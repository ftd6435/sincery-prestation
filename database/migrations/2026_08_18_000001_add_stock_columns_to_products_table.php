<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'stock')) {
                $table->unsignedInteger('stock')->default(0)->after('price');
            }
            if (!Schema::hasColumn('products', 'low_stock_threshold')) {
                $table->unsignedInteger('low_stock_threshold')->default(5)->after('stock');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'stock')) {
                $table->dropColumn('stock');
            }
            if (Schema::hasColumn('products', 'low_stock_threshold')) {
                $table->dropColumn('low_stock_threshold');
            }
        });
    }
};
