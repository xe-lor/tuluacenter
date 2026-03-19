<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Matiere;
use Illuminate\Http\Request;

class MatiereController extends Controller
{
    public function store(Request $request){
        $request->validate([
            'matiere'=>'required',
        ]);
        $matiere=Matiere::create([
            'name'=>$request->matiere,
        ]);
        if($matiere){
            return response()->json([
                'type'=>'btn btn-success',
                'message'=>'Matiere name inserted successfully!',
            ]);
        }else{
            return response()->json([
                'type'=>'btn btn-danger',
                'message'=>'Failed to insert matiere name!!!',
            ]);
        }
    }
}
