<?php

namespace App\Modules\Settings\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Settings\Models\Setting;
use App\Modules\Settings\Requests\SettingRequest;
use App\Modules\Settings\Resources\SettingResource;
use App\Traits\ApiResponses;
use App\Traits\CloudflareUpload;
use Illuminate\Support\Facades\Cache;

class SettingController extends Controller
{
    use ApiResponses, CloudflareUpload;

    private const CACHE_KEY = 'settings:all';
    private const CACHE_TTL = 3600; // 1 hour

    public function index()
    {
        $settings = Setting::orderBy('key')->get();

        return $this->successResponse(
            SettingResource::collection($settings),
            "Paramètres chargés avec succès."
        );
    }

    public function show(Setting $setting)
    {
        return $this->successResponse(
            new SettingResource($setting),
            "Paramètre chargé avec succès."
        );
    }

    public function store(SettingRequest $request)
    {
        $data = $request->validated();
        $data['value'] = $this->prepareValueForStorage(
            $data['type'],
            $data['value'] ?? null,
            $request
        );

        $setting = Setting::create([
            'key' => $data['key'],
            'type' => $data['type'],
            'value' => $data['value'],
        ]);

        $this->flushCache();

        return $this->successResponse(
            new SettingResource($setting),
            "Paramètre créé avec succès.",
            201
        );
    }

    public function update(SettingRequest $request, Setting $setting)
    {
        $data = $request->validated();
        $incomingType = $data['type'] ?? $setting->type;

        // Handle image replacement: delete old file if a new one is uploaded AND it was an image
        $newValue = $this->prepareValueForStorage(
            $incomingType,
            $data['value'] ?? null,
            $request
        );

        if ($setting->type === 'image' && $setting->value) {
            $hasNewUpload = $request->hasFile('value_file') ||
                (isset($data['value']) && is_string($data['value']) && $data['value'] !== $setting->value);
            if ($hasNewUpload) {
                $this->deleteImage($setting->value, 'settings');
            }
        }

        $setting->update([
            'key' => $data['key'],
            'type' => $incomingType,
            'value' => $newValue,
        ]);

        $this->flushCache();

        return $this->successResponse(
            new SettingResource($setting->refresh()),
            "Paramètre mis à jour avec succès."
        );
    }

    public function destroy(Setting $setting)
    {
        if ($setting->type === 'image' && $setting->value) {
            $this->deleteImage($setting->value, 'settings');
        }

        $setting->delete();
        $this->flushCache();

        return $this->noContentSuccessResponse(
            "Paramètre supprimé avec succès."
        );
    }

    // ————————————————————————————————————————————————————————————————————————
    // Helpers
    // ————————————————————————————————————————————————————————————————————————

    /**
     * Transforme la valeur saisie par l'utilisateur pour insertion en base,
     * en fonction du type déclaré.
     *  • boolean  → stocké en tant que "1"/"0" (string)
     *  • integer  → stocké en tant que string
     *  • decimal  → stocké en tant que string
     *  • json     → stocké en tant que chaîne JSON (si on reçoit un tableau on encode)
     *  • image    → stocké en tant que clé de fichier R2 (upload via $request->file('value_file'))
     *  • text     → stocké tel quel
     */
    private function prepareValueForStorage(string $type, mixed $value, SettingRequest $request): mixed
    {
        // Upload d'image: d'abord on regarde si un fichier a été envoyé via value_file
        if ($type === 'image' && $request->hasFile('value_file')) {
            return $this->uploadImage($request->file('value_file'), 'settings');
        }

        // Si c'est une image et qu'on a reçu une chaîne non vide c'est probablement une URL / clé existante → on garde
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'boolean' => $this->normalizeBoolean($value) ? '1' : '0',
            'integer' => (string) (int) $value,
            'decimal' => (string) (float) $value,
            'json' => is_array($value) ? json_encode($value, JSON_UNESCAPED_UNICODE) : (string) $value,
            'image' => (string) $value,
            default => (string) $value,
        };
    }

    private function normalizeBoolean(mixed $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? false;
    }

    private function flushCache(): void
    {
        try {
            Cache::forget(self::CACHE_KEY);
            Setting::flushCompanyCache();
        } catch (\Throwable) {
            // Cache driver may not be configured in dev — ignore silently
        }
    }
}
