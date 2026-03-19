<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Prof;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TeacherController extends Controller
{
    public function store(Request $request){
        $request->validate([
            'username'=>'required',
            'password'=>'required',
        ]);
        $user=User::create([
            'name'=>$request->username,
            'password'=>Hash::make($request->password),
            'role'=>'teacher',
        ]); 
        if($user){
            $prof=Prof::create([
                'name'=>$request->username,
                'user_id'=>$user->id,
            ]);
            if($prof){
                return response()->json([
                    'type'=>'btn btn-success',
                    'message'=>'Teacher inserted successfully!',
                ]);
            }
        }else{
            return response()->json([
                'type'=>'btn btn-danger',
                'message'=>'Failed to insert teacher name!!!',
            ]);
        }
    }
}
