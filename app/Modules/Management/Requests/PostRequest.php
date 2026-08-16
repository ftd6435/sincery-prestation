<?php

namespace App\Modules\Management\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PostRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'category_id' => 'required|integer|exists:post_categories,id',
            'author_id' => 'required|integer|exists:users,id',
            'title' => ['required', 'string', 'max:255', Rule::unique('posts', 'title')->ignore($this->post)],
            'excerpt' => 'required|string|max:255',
            'content' => 'nullable|string',
            'description' => 'required|string',
            'thumbnail' => ['sometimes', 'nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:2048'],
            'meta_title' => 'required|string|max:255',
            'meta_description' => 'required|string',
            'is_published' => 'required|boolean',
        ];
    }
}
