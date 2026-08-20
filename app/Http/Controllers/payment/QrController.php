<?php

namespace App\Http\Controllers\payment;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QrController extends Controller
{
      public function getStudentsQr()
{
    $students = DB::table('students')
        ->join('payments', 'students.id', '=', 'payments.student_id')
        ->join('niveaux', 'payments.niveau_id', '=', 'niveaux.id') 
        ->select(
            'students.id as student_id',
            'students.name as student_name',
            'students.lastname as student_lastname',
            'students.image as student_image',
            'payments.id as payment_id',
            'payments.date as payment_date',
            'payments.reduction as payment_reduction',
            'niveaux.name as niveau_name',

            // ✅ NEW: global reduction flag per student
            DB::raw('MAX(payments.reduction) OVER (PARTITION BY students.id) as payment_reduction')
        )
        ->get();

    $grouped = $students
        ->groupBy('student_id')
        ->map(function ($values) {
            $first = $values->first();

            return [
                'student_id' => $first->student_id,
                'student_name' => $first->student_name,
                'student_lastname' => $first->student_lastname,
                'student_image' => $first->student_image,
                'niveau_name' => $first->niveau_name,
                'payment_date' => $first->payment_date,
                'payment_reduction' => $first->payment_reduction,

                // ✅ NEW FIELD (safe)
                'payment_reduction' => (int) $first->payment_reduction,
            ];
        })
        ->values();

    return response()->json([
        'students' => $grouped
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
