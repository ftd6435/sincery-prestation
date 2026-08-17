<?php

namespace App\Modules\ERP\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Override;

class CustomerResource extends JsonResource
{
    #[Override]
    public function toArray(Request $request)
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'company_name' => $this->company_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'city' => $this->city,
            'country' => $this->country,

            'quotes' => $this->whenLoaded('quoteRequests', fn() => QuoteRequestResource::collection($this->quoteRequests)),

            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
