<?php

namespace App\Modules\Settings\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $table = 'settings';

    protected $fillable = ['key', 'value', 'type'];

    protected $casts = [
        'type' => 'string',
    ];

    private const COMPANY_CACHE_KEY = 'settings:company';
    private const COMPANY_CACHE_TTL = 3600; // 1 hour

    public static function defaultSettings(): array
    {
        return [
            'name' => 'Sincery Prestations',
            'tagline' => 'Des équipements professionnels pour protéger, équiper et accompagner vos activités.',
            'address' => 'Nongo, Conakry - République de Guinée',
            'phone' => '+224 622 14 67 14',
            'email' => 'contact@sincery-pres.com',
            'hours' => [
                'Lundi–Vendredi: 08h00–18h00',
                'Samedi: 09h00–13h00',
                'Dimanche: fermé',
            ],
        ];
    }

    /**
     * Retourne les paramètres "identité société" utilisés par les PDF, e-mails,
     * pages publiques de devis, etc.
     *
     * Les valeurs sont priorisées comme suit :
     *   1. Cache Laravel (settings:company) — TTL 1h
     *   2. Base de données (table settings), chaque valeur castée selon son type
     *   3. Fallback hardcodé : Setting::defaultSettings()
     *
     * IMPORTANT : pour forcer le recalcul du cache après un update, appeler
     * static::flushCompanyCache() depuis le SettingController sur CUD.
     */
    public static function getCompanySettings(): array
    {
        try {
            return Cache::remember(self::COMPANY_CACHE_KEY, self::COMPANY_CACHE_TTL, function (): array {
                return self::buildCompanySettings();
            });
        } catch (\Throwable) {
            return self::buildCompanySettings();
        }
    }

    public static function flushCompanyCache(): void
    {
        try {
            Cache::forget(self::COMPANY_CACHE_KEY);
        } catch (\Throwable) {
        }
    }

    private static function buildCompanySettings(): array
    {
        $defaults = self::defaultSettings();

        try {
            $rows = self::whereIn('key', array_keys($defaults))->get();
        } catch (\Throwable) {
            // La table settings n'existe pas encore, ou la BDD est HS
            return $defaults;
        }

        $merged = $defaults;

        foreach ($rows as $row) {
            if (! \array_key_exists($row->key, $merged)) {
                continue;
            }
            if ($row->value === null) {
                continue;
            }
            $merged[$row->key] = self::castValue($row->type ?? 'text', $row->value, $defaults[$row->key]);
        }

        return $merged;
    }

    /**
     * Cast d'une valeur brute stockée en base, en suivant la même convention
     * que SettingResource::castValue(). Si la valeur n'est pas castable, on
     * retourne le $fallback passé en argument (typiquement defaultSettings).
     */
    private static function castValue(?string $type, mixed $raw, mixed $fallback): mixed
    {
        if ($raw === null || $raw === '') {
            return $fallback;
        }

        try {
            return match ($type ?? 'text') {
                'boolean' => (bool) filter_var($raw, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE ?? 0),
                'integer' => (int) $raw,
                'decimal' => (float) $raw,
                'json' => is_string($raw) ? (json_decode($raw, true) ?? $fallback) : $raw,
                'image', 'text' => (string) $raw,
                default => (string) $raw,
            };
        } catch (\Throwable) {
            return $fallback;
        }
    }
}
