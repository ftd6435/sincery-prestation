<?php

namespace App\Modules\Management\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {

        return [
            'post_id' => 'required|integer|exists:posts,id',
            'name' => 'required|string',
            'email' => 'nullable|string|email',
            'content' => 'required|string',
            'parent_id' => 'nullable|integer|exists:comments,id',
            'is_approved' => 'nullable|boolean',
        ];
    }
}
