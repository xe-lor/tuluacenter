<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Matiere;
use Illuminate\Http\Request;

class MatiereController extends Controller
{
    public function index()
    {
        $matieres = Matiere::all();

        return response()->json([
            'matieres' => $matieres
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $matiere = Matiere::create([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Matiere created successfully',
            'matiere' => $matiere   
        ]);
    }

    public function show($id)
    {
        $matiere = Matiere::findOrFail($id);

        return response()->json([
            'matiere' => $matiere
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $matiere = Matiere::findOrFail($id);

        $matiere->update([
            'name' => $request->name
        ]);

        return response()->json([
            'message' => 'Matiere updated successfully',
            'matiere' => $matiere   
        ]);
    }

    public function delete(Request $request)
    {
        $matiere = Matiere::find($request->id);

        if (!$matiere) {
            return response()->json([
                'message' => 'Matiere not found'
            ], 404);
        }

        $matiere->delete();

        return response()->json([
            'message' => 'Deleted successfully'
        ]);
    }
}