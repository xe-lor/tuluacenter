<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Niveau;
use Illuminate\Http\Request;

class NiveauController extends Controller
{
    public function store(Request $request){
        $request->validate([
            'niveau'=>'required',
            'avrage'=>'nullable',
        ]);
        $niveau=Niveau::create([
            'name'=>$request->niveau,
            'avrage'=>$request->avrage,
        ]);
        if($niveau){
            return response()->json([
                'type'=>'btn btn-success',
                'message'=>'Niveau name inserted successfully!',
            ]);
        }else{
            return response()->json([
                'type'=>'btn btn-danger',
                'message'=>'Failed to insert Niveau name!!!',
            ]);
        }
    }
}
