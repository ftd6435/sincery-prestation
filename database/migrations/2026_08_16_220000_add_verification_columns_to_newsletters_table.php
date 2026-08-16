<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Ajoute les colonnes nécessaires à la vérification par e-mail des abonnés
     * newsletter, et corrige au passage le nom de colonne `is_verifed` vers
     * `is_verified` (typo historique) si cette variante existe encore.
     */
    public function up(): void
    {
        Schema::table('newsletters', function (Blueprint $table) {
            $columns = Schema::getColumnListing('newsletters');

            // Étape 1 — correction de typo (lancée seulement si la colonne erronée existe)
            if (in_array('is_verifed', $columns, true) && !in_array('is_verified', $columns, true)) {
                $table->renameColumn('is_verifed', 'is_verified');
            }

            // Étape 2 — colonnes de vérification
            if (!in_array('verification_token', $columns, true)) {
                $table->string('verification_token', 80)
                    ->nullable()
                    ->unique()
                    ->after('is_verified');
            }

            if (!in_array('verified_at', $columns, true)) {
                $table->timestamp('verified_at')
                    ->nullable()
                    ->after('verification_token');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('newsletters', function (Blueprint $table) {
            $columns = Schema::getColumnListing('newsletters');
            if (in_array('verified_at', $columns, true)) {
                $table->dropColumn('verified_at');
            }
            if (in_array('verification_token', $columns, true)) {
                $table->dropColumn('verification_token');
            }
        });
    }
};
