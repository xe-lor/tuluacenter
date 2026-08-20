<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Secretary;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AssistantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
public function index()
{
    $assistantes = Secretary::with('user')->get();

    return response()->json([
        'assistantes' => $assistantes
    ]);
}


//----------------------------------------------------------------------------------------------




public function store(Request $request)
{
    $request->validate([
        'username' => 'required',
        'password' => 'required',
    ]);

    try {

        $user = User::create([
            'name' => $request->username,
            'password' => Hash::make($request->password),
            'role' => 'assistant',
        ]);

        $assistant = Secretary::create([
            'name' => $request->username,
            'user_id' => $user->id,
            'restricted' => false, 
        ]);


        return response()->json([
            'type' => 'success',
            'message' => 'Assistant inserted successfully!',
        ], 200);

    } catch (\Exception $e) {

        return response()->json([
            'type' => 'error',
            'message' => 'Failed to insert assistant',
        ], 500);
    }
}


//------------------------------------------------------------------------



public function update(Request $request, $id)
{
    $assistant = Secretary::with('user')->findOrFail($id);

    // update secretary table
    $assistant->update([
        'name' => $request->name,
    ]);

    // update user table
    $assistant->user->update([
        'name' => $request->user_name,
        'role' => $request->role,
    ]);

    return response()->json([
        'message' => 'Assistant updated successfully'
    ]);
}


//-----------------------------------------------------------------------




public function show($id)
{
    $assistant = Secretary::with('user')->findOrFail($id);

    return response()->json([
        'assistant' => $assistant
    ]);
}


public function destroy($id)
{
    $secretary = Secretary::findOrFail($id);
    $secretary->delete();

    return response()->json([
        'message' => 'Deleted successfully'
    ]);
}
}
