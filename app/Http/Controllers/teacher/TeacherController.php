<?php

namespace App\Http\Controllers\teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeacherController extends Controller
{

public function index(Request $request)
{
    $userId = session('user_id');
    $prof = DB::table('profs')->where('user_id', $userId)->first();

    if (!$prof) {
        return response()->json([
            'students' => [],
            'totalStudents' => 0,
            'totalNette' => 0,
            'classes' => [],
        ]);
    }

    $classIds = DB::table('classes')
        ->where('prof_id', $prof->id)
        ->pluck('id');

    if ($classIds->isEmpty()) {
        return response()->json([
            'students' => [],
            'totalStudents' => 0,
            'totalNette' => 0,
            'classes' => [],
        ]);
    }

    $latestPaymentIds = DB::table('payments as pb2')
        ->whereIn('pb2.class_id', $classIds)
        ->when($request->filled('class_id'), fn($q) => $q->where('pb2.class_id', $request->class_id))
        ->when($request->filled('month'), fn($q) => $q->where('pb2.month', $request->month))
        ->when($request->filled('status'), fn($q) => $q->where('pb2.status', $request->status))
        ->selectRaw('MIN(pb2.id) as id')
        ->groupBy('pb2.student_id', 'pb2.class_id');

    $studentsQuery = DB::table('payments as p')
        ->joinSub($latestPaymentIds, 'lp', function ($join) {
            $join->on('p.id', '=', 'lp.id');
        })
        ->join('students', 'students.id', '=', 'p.student_id');

    if ($request->filled('search')) {
        $search = $request->search;
        $studentsQuery->where(function ($q) use ($search) {
            $q->where('students.name', 'like', "%{$search}%")
              ->orWhere('students.lastname', 'like', "%{$search}%")
              ->orWhere('students.studentphone', 'like', "%{$search}%")
              ->orWhere('students.parentphone', 'like', "%{$search}%");
        });
    }

    $students = $studentsQuery
        ->select(
            'students.id as student_id',
            'students.name',
            'students.lastname',
            'students.studentphone',
            'students.parentphone',
            'p.price',
            'p.class_id',
            'p.status',
            'p.month',
            'p.date as payment_date'
        )
        ->orderBy('students.name')
        ->get();

    $totalStudents = $students->count();

    $totalNetteQuery = DB::table('payments as p')
        ->joinSub($latestPaymentIds, 'lp', function ($join) {
            $join->on('p.id', '=', 'lp.id');
        })
        ->join('students', 'students.id', '=', 'p.student_id')
        ->join('classes', 'classes.id', '=', 'p.class_id');

    if ($request->filled('search')) {
        $search = $request->search;
        $totalNetteQuery->where(function ($q) use ($search) {
            $q->where('students.name', 'like', "%{$search}%")
              ->orWhere('students.lastname', 'like', "%{$search}%")
              ->orWhere('students.studentphone', 'like', "%{$search}%")
              ->orWhere('students.parentphone', 'like', "%{$search}%");
        });
    }

    $totalNette = (float) ($totalNetteQuery
        ->selectRaw('COALESCE(SUM(p.price * COALESCE(classes.percentage, 100) / 100), 0) as total')
        ->value('total') ?? 0);

    $classes = DB::table('classes')
        ->join('matieres', 'classes.matiere_id', '=', 'matieres.id')
        ->join('niveaux', 'classes.niveau_id', '=', 'niveaux.id')
        ->where('classes.prof_id', $prof->id)
        ->select('classes.id', 'matieres.name as matiere', 'niveaux.name as niveau')
        ->get();

    $normalize = function ($v) {
        $v = is_null($v) ? '' : $v;
        $v = mb_strtolower(trim($v), 'UTF-8');
        $repl = [
            'payes' => 'payé', 'paye' => 'payé', 'paid' => 'payé',
            'impayes' => 'impayé', 'impaye' => 'impayé', 'unpaid' => 'impayé',
            'annule' => 'annulé', 'canceled' => 'annulé',
        ];
        return $repl[$v] ?? $v;
    };

    foreach ($students as $row) {
        $s = $normalize($row->status ?? '');
        if ($s === 'payé') {
            $row->status_label = 'Payé';
            $row->status_class = 'bg-success';
        } elseif ($s === 'impayé') {
            $row->status_label = 'Impayé';
            $row->status_class = 'bg-danger';
        } elseif ($s === 'annulé') {
            $row->status_label = 'Annulé';
            $row->status_class = 'bg-warning text-dark';
        } else {
            $row->status_label = '—';
            $row->status_class = 'bg-secondary';
        }
    }

    return response()->json([
        'students' => $students,
        'totalStudents' => $totalStudents,
        'totalNette' => $totalNette,
        'classes' => $classes,
    ]);
}


public function stats()
{
    $userId = session('user_id');
    $prof = DB::table('profs')->where('user_id', $userId)->first();

    $months = [
        9 => 'September', 10 => 'October', 11 => 'November', 12 => 'December',
        1 => 'January', 2 => 'February', 3 => 'March', 4 => 'April',
        5 => 'May', 6 => 'June',
    ];

    if (!$prof) {
        return response()->json([
            'monthlyStats' => [],
            'orderedMonths' => $months,
            'classStats' => [],
            'totalNet' => 0,
        ]);
    }

    $classIds = DB::table('classes')
        ->where('prof_id', $prof->id)
        ->pluck('id')
        ->toArray();

    if (empty($classIds)) {
        return response()->json([
            'monthlyStats' => [],
            'orderedMonths' => $months,
            'classStats' => [],
            'totalNet' => 0,
        ]);
    }

    $monthlyStats = [];

    foreach ($months as $monthNum => $monthName) {
        $monthData = DB::table('payments')
            ->whereIn('class_id', $classIds)
            ->where('month', $monthNum)
            ->where('status', 'paye')
            ->select(
                DB::raw('COUNT(DISTINCT student_id) as student_count'),
                DB::raw('SUM(price) as total_price')
            )
            ->first();

        $studentCount = $monthData->student_count ?? 0;
        $totalPrice = $monthData->total_price ?? 0;

        $classBreakdown = DB::table('payments')
            ->join('classes', 'payments.class_id', '=', 'classes.id')
            ->join('matieres', 'classes.matiere_id', '=', 'matieres.id')
            ->join('niveaux', 'classes.niveau_id', '=', 'niveaux.id')
            ->where('payments.month', $monthNum)
            ->where('classes.prof_id', $prof->id)
            ->where('payments.status', 'paye')
            ->select(
                'classes.id',
                'matieres.name as matiere_name',
                'niveaux.name as niveau_name',
                'classes.percentage',
                DB::raw('COUNT(DISTINCT payments.student_id) as student_count'),
                DB::raw('SUM(payments.price) as total_price')
            )
            ->groupBy('classes.id', 'matieres.name', 'niveaux.name', 'classes.percentage')
            ->get();

        $totalNetForMonth = 0;
        $classStatsForMonth = [];

        foreach ($classBreakdown as $class) {
            $percentage = $class->percentage ?? 100;
            $net = $class->total_price * $percentage / 100;
            $totalNetForMonth += $net;

            $classStatsForMonth[] = [
                'matiere_name' => $class->matiere_name,
                'niveau_name' => $class->niveau_name,
                'student_count' => $class->student_count,
                'total_price' => $class->total_price,
                'nette' => $net,
            ];
        }

        $monthlyStats[$monthName] = [
            'student_count' => $studentCount,
            'total_price' => $totalPrice,
            'nette' => $totalNetForMonth,
            'classes' => $classStatsForMonth,
        ];
    }

    $classStats = DB::table('payments')
        ->join('classes', 'payments.class_id', '=', 'classes.id')
        ->join('matieres', 'classes.matiere_id', '=', 'matieres.id')
        ->join('niveaux', 'classes.niveau_id', '=', 'niveaux.id')
        ->where('classes.prof_id', $prof->id)
        ->where('payments.status', 'paye')
        ->select(
            'matieres.name as matiere_name',
            'niveaux.name as niveau_name',
            'classes.percentage',
            DB::raw('COUNT(DISTINCT payments.student_id) as student_count'),
            DB::raw('SUM(payments.price) as total_price')
        )
        ->groupBy('matieres.name', 'niveaux.name', 'classes.percentage')
        ->get();

    $totalNet = 0;

    foreach ($classStats as $class) {
        $percentage = $class->percentage ?? 100;
        $class->nette = $class->total_price * $percentage / 100;
        $totalNet += $class->nette;
    }

    return response()->json([
        'monthlyStats' => $monthlyStats,
        'orderedMonths' => $months,
        'classStats' => $classStats,
        'totalNet' => $totalNet,
    ]);
}

}
