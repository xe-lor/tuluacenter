<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use App\Models\Matiere;
use App\Models\Niveau;
use App\Models\Prof;
use Illuminate\Http\Request;


class ClassController extends Controller
{
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
}
