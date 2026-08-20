<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Prof;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class TeacherController extends Controller
{

public function index()
{
    $teachers = Prof::with('user')->get();

    return response()->json([
        'teachers' => $teachers
    ]);
}



    public function store(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'password' => 'required|min:6',
    ]);

    $user = User::create([
        'name' => $request->name,
        'password' => Hash::make($request->password),
        'role' => 'teacher',
    ]);

    $prof = Prof::create([
        'name' => $request->name,
        'user_id' => $user->id,
    ]);

    return response()->json([
        'message' => 'Teacher created successfully',
        'teacher' => $prof->load('user') // ✅ IMPORTANT
    ]);
}

    //------------------------------------------------------------------------



public function update(Request $request, $id)
{
    $teacher = Prof::with('user')->findOrFail($id);

    $request->validate([
        'name' => 'required|string|max:255',
        'password' => 'nullable|min:6', // ✅ optional
    ]);

    $teacher->update([
        'name' => $request->name,
    ]);

    $userData = [
        'name' => $request->name,
    ];

    // ✅ Only update password IF provided
    if ($request->password) {
        $userData['password'] = Hash::make($request->password);
    }

    $teacher->user->update($userData);

    return response()->json([
        'message' => 'Teacher updated successfully',
        'teacher' => $teacher->load('user') // ✅ IMPORTANT
    ]);
}

//-----------------------------------------------------------------------




public function show($id)
{
    $teacher = Prof::with('user')->findOrFail($id);

    return response()->json([
        'teacher' => $teacher
    ]);
}








public function destroy($id)
{
    $teacher = Prof::with('user')->findOrFail($id);

    $teacher->user->delete(); // ✅ delete linked user
    $teacher->delete();

    return response()->json([
        'message' => 'Deleted successfully'
    ]);
}
}
