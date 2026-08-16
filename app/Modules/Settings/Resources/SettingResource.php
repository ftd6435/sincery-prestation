<?php

namespace App\Modules\Settings\Resources;

use App\Traits\CloudflareUpload;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettingResource extends JsonResource
{
    use CloudflareUpload;

    public function toArray(Request $request): array
    {
        $raw = $this->value;
        $casted = $this->castValue($this->type, $raw);

        return [
            'id' => $this->id,
            'key' => $this->key,
            'type' => $this->type,
            'value' => $casted,
            'raw_value' => $raw,
            'value_url' => $this->type === 'image' && $raw ? $this->resolveImageUrl($raw) : null,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }

    private function castValue(?string $type, mixed $raw): mixed
    {
        if ($raw === null) {
            return null;
        }

        return match ($type) {
            'boolean' => (bool) filter_var($raw, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE ?? 0),
            'integer' => (int) $raw,
            'decimal' => (float) $raw,
            'json' => is_string($raw) ? (json_decode($raw, true) ?? $raw) : $raw,
            'image' => (string) $raw,
            'text' => (string) $raw,
            default => (string) $raw,
        };
    }

    private function resolveImageUrl(string $path): ?string
    {
        // If the stored value already looks like a URL, return as-is
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        // Otherwise resolve through CloudflareUpload trait if available
        if (method_exists($this, 'getImageUrl')) {
            try {
                return $this->getImageUrl($path, 'settings');
            } catch (\Throwable) {
            }
        }

        // Fallback: use laravel asset helper (via global function)
        try {
            return asset('storage/settings/' . ltrim($path, '/'));
        } catch (\Throwable) {
            return $path;
        }
    }
}
