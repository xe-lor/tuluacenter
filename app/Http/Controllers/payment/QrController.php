<?php

namespace App\Http\Controllers\payment;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QrController extends Controller
{
public function getStudentsQr()
{
    $rows = DB::table('students')
        ->join('payments', 'students.id', '=', 'payments.student_id')
        ->join('niveaux', 'payments.niveau_id', '=', 'niveaux.id')
        // leftJoin so students whose payment has no class are not dropped
        ->leftJoin('classes', 'payments.class_id', '=', 'classes.id')
        ->leftJoin('matieres', 'classes.matiere_id', '=', 'matieres.id')
        ->select(
            'students.id as student_id',
            'students.name as student_name',
            'students.lastname as student_lastname',
            'students.image as student_image',
            'payments.date as payment_date',
            'payments.reduction as payment_reduction',
            'niveaux.id as niveau_id',
            'niveaux.name as niveau_name',
            'matieres.id as matiere_id',
            'matieres.name as matiere_name'
        )
        ->orderBy('students.name')
        ->get();

    $students = $rows
        ->groupBy('student_id')
        ->map(function ($values) {
            $first = $values->first();

            return [
                'student_id'        => $first->student_id,
                'student_name'      => $first->student_name,
                'student_lastname'  => $first->student_lastname,
                'student_image'     => $first->student_image,
                // earliest payment = enrollment date
                'payment_date'      => $values->min('payment_date'),
                // 1 if ANY payment has a reduction
                'payment_reduction' => (int) $values->max('payment_reduction'),
                // all levels / subjects the student is linked to (used by the filters)
                'niveaux' => $values
                    ->filter(fn ($r) => $r->niveau_id !== null)
                    ->unique('niveau_id')
                    ->map(fn ($r) => ['id' => $r->niveau_id, 'name' => $r->niveau_name])
                    ->values(),
                'matieres' => $values
                    ->filter(fn ($r) => $r->matiere_id !== null)
                    ->unique('matiere_id')
                    ->map(fn ($r) => ['id' => $r->matiere_id, 'name' => $r->matiere_name])
                    ->values(),
            ];
        })
        ->values();

    // Options for the filter dropdowns
    $niveaux  = DB::table('niveaux')->select('id', 'name')->orderBy('name')->get();
    $matieres = DB::table('matieres')->select('id', 'name')->orderBy('name')->get();

    return response()->json([
        'students' => $students,
        'niveaux'  => $niveaux,
        'matieres' => $matieres,
    ]);
}










public function getStudentPayments($student_id)
{
    // Get current month and day
    $currentMonth = date('n'); // 1-12
    $currentDay = date('j');   // 1-31

    $payments = DB::table('payments')
        ->join('classes', 'payments.class_id', '=', 'classes.id')
        ->join('matieres', 'classes.matiere_id', '=', 'matieres.id')
        ->join('niveaux', 'classes.niveau_id', '=', 'niveaux.id')
        ->where('payments.student_id', $student_id)
        ->where('payments.month', $currentMonth) // Filter by current month
        ->select(
            'payments.id as payment_id',
            'payments.status as payment_state',
            'payments.month as payment_month',
            'payments.day as payment_day',
            'payments.price as payment_price',
            'classes.id as class_id',
            'matieres.name as class_name',
            'niveaux.name as class_niveau'
        )
        ->get();

    $grouped = $payments->groupBy('class_id')->map(function ($rows) use ($currentDay) {
        return [
            'payment_id' => $rows->first()->payment_id,
            'class_id' => $rows->first()->class_id,
            'class_name' => $rows->first()->class_name,
            'class_niveau' => $rows->first()->class_niveau,
            'months' => $rows->map(function ($r) use ($currentDay) {
                // Only include status if the day is <= today
                $status = $r->payment_state;
                return [
                    'month' => $r->payment_month,
                    'day' => $r->payment_day,
                    'status' => $status,
                    'payment_price' => $r->payment_price
                ];
            })->values()
        ];
    })->values();

    $student = DB::table('students')
        ->where('id', $student_id)
        ->select(
            'id as student_id',
            'name as student_name',
            'lastname as student_lastname',
            'image as student_image'
        )
        ->first();

    return response()->json([
        'student' => $student,
        'payments' => $grouped
    ]);
}
}
