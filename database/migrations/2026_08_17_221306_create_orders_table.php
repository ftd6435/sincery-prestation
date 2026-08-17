<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique(); // Auto-generated i.e : CMD-2026-0001, CMD-2026-0002, ...
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->enum('status', ['new', 'pending', 'confirmed', 'delivered', 'canceled'])->default('new');
            $table->string('delivery_mode'); // Home or Pick up at shop
            $table->text('comment')->nullable();
            $table->text('internal_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
