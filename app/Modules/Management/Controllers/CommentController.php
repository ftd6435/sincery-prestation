<?php

namespace App\Modules\Management\Controllers;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponses;
use App\Modules\Management\Models\Comment;
use App\Modules\Management\Requests\CommentRequest;

class CommentController extends Controller
{
    use ApiResponses;

    public function index()
    {
        $comments = Comment::with(['post', 'parent', 'children'])->orderBy('created_at', 'desc')->get();

        return $this->successResponse($comments, "Commentaires chargés avec succès.");
    }

    public function store(CommentRequest $request)
    {
        $comment = Comment::create($request->validated());

        return $this->successResponse($comment, "Commentaire créé avec succès.");
    }

    public function update(CommentRequest $request, Comment $comment)
    {
        $comment->update($request->validated());

        return $this->successResponse($comment, "Commentaire mis à jour avec succès.");
    }

    public function switchStatus(Comment $comment)
    {
        $comment->is_approved = !$comment->is_approved;
        $comment->save();

        return $this->successResponse($comment, "Commentaire statut changé avec succès.");
    }

    public function destroy(Comment $comment)
    {
        $comment->delete();

        return $this->successResponse($comment, "Commentaire supprimé avec succès.");
    }
}
