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
        Schema::create('quote_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique(); // auto-generated reference ex: DEV-2026-0001, DEV-2026-0002, ...
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->enum('status', ['new', 'pending', 'approved', 'sent', 'rejected', 'expired'])->default('new'); // new when customer requests a quote, pending when admin approves the quote, approved when customer approves the quote, sent when admin sends the quote to customer, then rejected when customer rejects the quote, expired when validity_date exceed current date
            $table->enum('prefered_contact', ['telephone', 'email', 'phone'])->default('telephone'); // prefered contact method for admin to contact customer
            $table->timestamp('validity_date')->nullable(); // date set when admin switches status to pending
            $table->text('comment')->nullable(); // comment added by customer
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quote_requests');
    }
};
