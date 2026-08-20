<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use App\Models\Matiere;
use App\Models\Niveau;
use App\Models\Prof;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClassController extends Controller
{

public function index()
{
    $classes = DB ::table('classes')
        ->join('matieres', 'classes.matiere_id', '=', 'matieres.id')
        ->join('profs', 'classes.prof_id', '=', 'profs.id')
        ->join('niveaux', 'classes.niveau_id', '=', 'niveaux.id')
        ->select(
            'classes.id',
            'classes.matiere_id',
            'classes.prof_id',
            'classes.niveau_id',
            'classes.percentage',
            'classes.price',

            // Matiere
            'matieres.name as matiere_name',

            // Prof
            'profs.name as prof_name',

            // Niveau
            'niveaux.name as niveau_name'
        )
        ->get();

    return response()->json([
        'classes' => $classes
    ]);
}



    public function classes(){
        $teachers=Prof::all();
        $niveaux=Niveau::all();
        $matieres=Matiere::all();

        return response()->json([
            'teachers'=>$teachers,
            'niveaux'=>$niveaux,
            'matieres'=>$matieres,
        ]);
    }



    public function store(Request $request){
        $request->validate([
            'matiere'=>'required',
            'niveau'=>'required',
            'teacher'=>'required',
            'price'=>'required',
            'percentage'=>'required',
        ]);

        $classe=Classe::create([
            'matiere_id'=>$request->matiere,
            'prof_id'=>$request->teacher,
            'niveau_id'=>$request->niveau,
            'percentage'=>$request->percentage,
            'price'=>$request->price,
        ]);
        if($classe){
            return response()->json([
                'message'=>'Class inserted successfuly!',
                'type'=>'btn btn-success',
            ]);
        }else{
            return response()->json([
                'message'=>'Failed to insert class!',
                'type'=>'btn btn-danger',
            ]);
        }
    }

    public function update(Request $request, $id)
{
    $request->validate([
        'matiere' => 'required',
        'niveau' => 'required',
        'teacher' => 'required',
        'price' => 'required',
        'percentage' => 'required',
    ]);

    $classe = Classe::find($id);

    if (!$classe) {
        return response()->json([
            'message' => 'Class not found!',
            'type' => 'btn btn-danger',
        ], 404);
    }

    $classe->update([
        'matiere_id' => $request->matiere,
        'prof_id' => $request->teacher,
        'niveau_id' => $request->niveau,
        'percentage' => $request->percentage,
        'price' => $request->price,
    ]);

    return response()->json([
        'message' => 'Class updated successfully!',
        'type' => 'btn btn-success',
    ]);
}


public function destroy($id)
{
    $classe = Classe::find($id);

    if (!$classe) {
        return response()->json([
            'message' => 'Class not found!',
            'type' => 'btn btn-danger',
        ], 404);
    }

    $classe->delete();

    return response()->json([
        'message' => 'Class deleted successfully!',
        'type' => 'btn btn-success',
    ]);
}
}
