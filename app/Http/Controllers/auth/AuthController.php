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
    if (Auth::attempt($request->only('username', 'password'))) {

        $request->session()->regenerate();

        $user = Auth::user();
        session([
            'user_id' => $user->id,
            'user_role' => $user->role
        ]);

        if ($user->role === 'secretary') {

            $restricted = DB::table('secretaries')
                ->where('user_id', $user->id)
                ->value('restricted');

            session([
                'secretary_restricted' => (bool)$restricted
            ]);
        }

        return response()->json([
            'success' => true,
            'user' => $user,
            'session' => [
                'user_id' => session('user_id'),
                'user_role' => session('user_role')
            ]
        ]);
    }

    return response()->json([
        'success' => false
    ], 401);
}
}
