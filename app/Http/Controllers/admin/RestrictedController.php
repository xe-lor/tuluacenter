<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Secretary;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RestrictedController extends Controller
{
    // Admin page: list every secretary with her restriction settings
    public function index()
    {
        return response()->json(
            Secretary::select('id', 'name', 'restricted', 'blocked_months')
                ->orderBy('name')
                ->get()
        );
    }

    // Admin page: save the restriction of one secretary
    public function update(Request $request, Secretary $secretary)
    {
        $data = $request->validate([
            'restricted'     => ['required', 'boolean'],
            'blocked_months' => ['nullable', 'integer', Rule::in(Secretary::SCHOOL_MONTHS)],
        ]);

        $secretary->update($data);

        return response()->json($secretary->only('id', 'name', 'restricted', 'blocked_months'));
    }

    // Payment pages: which months are locked for the logged-in user.
    // Admins (or any user without a secretary row) get an empty list.
    public function mine(Request $request)
    {
        $user = $request->user();

        $secretary = $user
            ? Secretary::where('user_id', $user->id)->first()
            : null;

        return response()->json([
            'locked_months' => $secretary ? $secretary->lockedMonths() : [],
        ]);
    }
}