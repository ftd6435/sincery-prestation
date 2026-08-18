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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('reference')->unique(); // If not provided, auto generate PRD-(first three characters of name)-001, etc.
            $table->string('name');
            $table->string('slug')->unique(); // auto generated from name
            $table->string('short_description');
            $table->text('description')->nullable();
            $table->decimal('price', 15, 2)->nullable();
            $table->boolean('is_quote_only')->default(false); // To determine if product price is on quote only
            $table->string('unit')->nullable();
            $table->boolean('is_featured')->default(false); // To determine if product is featured
            $table->boolean('is_available')->default(true); // To determine if product is available
            $table->boolean('is_published')->default(true); // To determine if product is published
            $table->timestamp('published_at')->nullable(); // When product published at
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('thumbnail')->nullable(); // Thumbnail image
            $table->foreignId('created_by')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->cascadeOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
