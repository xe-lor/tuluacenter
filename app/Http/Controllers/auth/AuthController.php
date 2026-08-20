<?php

namespace App\Http\Controllers\auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{









public function login(Request $request)
{
    $request->validate([
        'name' => 'required',
        'password' => 'required',
    ]);

    if (Auth::attempt($request->only('name', 'password'))) {

        $request->session()->regenerate();

        $user = Auth::user();

        session([
            'user_id' => $user->id,
            'user_role' => $user->role
        ]);

        return response()->json([
            'success' => true,
            'user' => $user
        ]);
    }

    return response()->json([
        'success' => false
    ], 401);
}



public function logout(Request $request)
    {
        // Log out user
        Auth::logout();

        // Invalidate the session
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Return success response
        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }






}
