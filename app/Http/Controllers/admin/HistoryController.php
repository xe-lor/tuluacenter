<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HistoryController extends Controller
{
    /**
     * The `histories` table has no "type" column, so the CRUD type is derived
     * from the beginning of the message written by PaymentController::logHistory().
     *
     *   create -> "Étudiant inscrit ..."
     *   delete -> "Étudiant supprimé ...", "Classe annulée ...", "Toutes les classes annulées ..."
     *   update -> everything else (payments paid/unpaid, student edited, ...)
     *
     * If you add a new kind of log message, add its prefix here.
     */
    private const ACTION_SQL = "CASE
        WHEN histories.name LIKE 'Étudiant inscrit%' THEN 'create'
        WHEN histories.name LIKE 'Étudiant supprimé%'
          OR histories.name LIKE 'Classe annulée%'
          OR histories.name LIKE 'Toutes les classes annulées%' THEN 'delete'
        ELSE 'update'
    END";

    /**
     * Base query: one history row joined with the secretary who did the action.
     */
    private function baseQuery()
    {
        return DB::table('histories')
            ->join('secretaries', 'histories.secretary_id', '=', 'secretaries.id')
            ->select(
                'histories.id',
                'histories.name',
                'histories.secretary_id',
                'secretaries.name as secretary_name',
                'histories.created_at',
                DB::raw(self::ACTION_SQL . ' as action')
            );
    }

    /**
     * Display a listing of the resource.
     * Optional filters (query string):
     *   ?secretary_id=3   -> only the actions of this assistant
     *   ?action=create    -> only create | update | delete
     * Also returns the secretaries list (filter dropdown + "add" row).
     */
    public function index(Request $request)
    {
        $request->validate([
            'secretary_id' => 'nullable|integer',
            'action'       => 'nullable|in:create,update,delete',
        ]);

        $query = $this->baseQuery();

        if ($request->filled('secretary_id')) {
            $query->where('histories.secretary_id', $request->secretary_id);
        }

        if ($request->filled('action')) {
            $query->whereRaw('(' . self::ACTION_SQL . ') = ?', [$request->action]);
        }

        $histories = $query
            ->orderByDesc('histories.created_at')
            ->orderByDesc('histories.id')
            ->get();

        $secretaries = DB::table('secretaries')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return response()->json([
            'histories'   => $histories,
            'secretaries' => $secretaries,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     * A manual entry has no type of its own: it is counted as "update"
     * unless its text starts with one of the prefixes above.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'secretary_id' => 'required|integer|exists:secretaries,id',
        ]);

        $id = DB::table('histories')->insertGetId([
            'name'         => trim($validated['name']),
            'secretary_id' => $validated['secretary_id'],
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        $history = $this->baseQuery()->where('histories.id', $id)->first();

        return response()->json([
            'message' => 'History added successfully',
            'history' => $history,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $history = $this->baseQuery()->where('histories.id', $id)->first();

        if (!$history) {
            return response()->json([
                'history' => null,
                'message' => 'No history found for id: ' . $id,
            ], 404);
        }

        return response()->json([
            'history' => $history,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     * The id comes in the body ({ id }), same pattern as /admin/matieres/delete.
     */
    public function destroy(Request $request)
    {
        $request->validate([
            'id' => 'required|integer',
        ]);

        $deleted = DB::table('histories')->where('id', $request->id)->delete();

        if (!$deleted) {
            return response()->json([
                'message' => 'History not found',
            ], 404);
        }

        return response()->json([
            'message' => 'History deleted successfully',
        ]);
    }
}