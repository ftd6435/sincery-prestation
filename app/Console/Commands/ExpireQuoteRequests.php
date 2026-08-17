<?php

namespace App\Console\Commands;

use App\Modules\ERP\Models\QuoteRequest;
use Illuminate\Console\Command;

class ExpireQuoteRequests extends Command
{
    protected $signature = 'quote-requests:expire';
    protected $description = "Switch 'sent' quote requests past their validity date to 'expired'";

    public function handle(): int
    {
        $count = QuoteRequest::where('status', 'sent')
            ->whereNotNull('validity_date')
            ->where('validity_date', '<', now())
            ->update(['status' => 'expired']);

        $this->info("{$count} demande(s) de devis marquée(s) comme expirée(s).");

        return self::SUCCESS;
    }
}
