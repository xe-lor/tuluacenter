<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Niveau;
use Illuminate\Http\Request;

class NiveauController extends Controller
{

    public function index()
    {
        $niveaux=Niveau::all();
        return response()->json([
            'niveaux'=>$niveaux
        ]);
    }


    public function store(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'avrage' => 'nullable',
    ]);

    $niveau = Niveau::create([
        'name' => $request->name,
        'avrage' => $request->avrage,
    ]);

    return response()->json([
        'message' => 'Level created successfully!',
        'niveau' => $niveau   // ✅ IMPORTANT
    ]);
}










    public function show($id)
{
    $niveau = Niveau::findOrFail($id);
    return response()->json(['niveau' => $niveau]);
}



    public function update(Request $request, $id)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'avrage' => 'required',
    ]);

    $niveau = Niveau::findOrFail($id);

    $niveau->update([
        'name' => $request->name,
        'avrage' => $request->avrage
    ]);

    return response()->json([
        'message' => 'Niveau updated successfully',
        'niveau' => $niveau
    ]);
}

    public function delete(Request $request)
{
    $niveau = Niveau::find($request->id);

    if (!$niveau) {
        return response()->json(['message' => 'Not found'], 404);
    }

    $niveau->delete();

    return response()->json(['message' => 'Deleted successfully']);
}
}
