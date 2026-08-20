<?php

namespace App\Http\Controllers\payment;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use App\Models\Payment;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class PaymentController extends Controller
{
 
public function getClasses()
{
    $classes = DB::table('classes')
        ->join('niveaux', 'classes.niveau_id', '=', 'niveaux.id')
        ->join('matieres', 'classes.matiere_id', '=', 'matieres.id')
        ->select(
            'niveaux.id as niveau_id',
            'niveaux.name as niveau_name',
            'matieres.id as matiere_id',
            'matieres.name as matiere_name',
            'classes.id as class_id',
            'classes.price as matiere_price',
        )
        ->get();

    $grouped = collect($classes)
        ->groupBy('niveau_id')
        ->map(function ($values) {
            return [
                //keys       =>    values
                'niveau_id' => $values->first()->niveau_id,
                'niveau_name' => $values->first()->niveau_name,
                'matieres' => $values->map(function ($class) {
                    return [
                        'matiere_id' => $class->matiere_id,
                        'matiere_name' => $class->matiere_name,
                        'matiere_price' => $class->matiere_price,
                        'class_id' => $class->class_id,
                    ];
                })->toArray(),
            ];
        })
        ->values()
        ->toArray();

    return response()->json([
        'classes' => $grouped
    ]);
}

//----------------------------------------------------------------------------------------------


public function delete($Id){
    $student=Student::find($Id);
    $student->delete();
}


//-----------------------------------------------------------------------------------------------





    public function store(Request $request){
        $request->validate([
            'name'=>'required',
            'lastName'=>'required',
            'parentName'=>'required',
            'studentPhone'=>'required',
            'parentPhone'=>'nullable',
            'niveau'=>'required',
            'classe'=>'required|array',
            'groupe'=>'nullable',
        ]);
        $student=Student::create([
            'name'=>$request->name,
            'lastname'=>$request->lastName,
            'parentname'=>$request->parentName,
            'studentphone'=>$request->studentPhone, 
            'parentphone'=>$request->parentPhone,
        ]);

        $date=Carbon::parse($request->date);
        $day=$date->day;

        $schoolyearmonths = [9,10,11,12,1,2,3,4,5,6];

        $reductions=$request->reduction;

        foreach($request->classe as $classId){
            $class=Classe::find($classId);
            $finalPrice = $reductions[$class->matiere_id]  ?? $class->price;
                if($finalPrice < $class->price){
                    $reduction=1;
                }elseif($finalPrice == $class->price){
                    $reduction=0;
                }
            foreach($schoolyearmonths as $monthnumber){
                $payment=Payment::create([
                    'student_id'=>$student->id,
                    'matiere_id'=>$class->matiere_id,
                    'niveau_id'=>$class->niveau_id,
                    'class_id'=>$classId,
                    'groupe'=>$request->groupe,
                    'price' => $finalPrice,
                    'reduction'=>$reduction,
                    'date'=>$request->date,
                    'month'=>$monthnumber,
                    'day'=>$day,
                    'status'=>$request->state,
                ]);
            }
        }
        if($payment){
            return response()->json([
                'message'=>'Student inserted successfuly!',
                'type'=>'btn btn-success',
            ]);
        }else{
            return response()->json([
                'message'=>'Failed to insert student!',
                'type'=>'btn btn-danger',
            ]);
        }
    }




//-----------------------------------------------------------------------------------------------






    public function getStudents(){
        $students = DB::table('students')
            ->join('payments', 'students.id', '=', 'payments.student_id')
            ->join('classes', 'payments.class_id', '=', 'classes.id')
            ->join('matieres', 'classes.matiere_id', '=', 'matieres.id')
            ->join('niveaux', 'classes.niveau_id', '=', 'niveaux.id')

            ->select(
                'students.id as student_id',
                'students.name',
                'students.lastname',
                'students.parentname',
                'students.studentphone',
                'students.parentphone',
                'students.image',
            
                'payments.id as payment_id',
                'payments.price as payment_price',
                'payments.status as payment_state',
                'payments.month as payment_month',
                'payments.day as payment_day',
                'payments.date as payment_date',
                'payments.groupe as groupe',
            
                'classes.id as class_id',

                'matieres.id as matiere_id',
                'matieres.name as matiere_name',

                'niveaux.id as niveau_id',
                'niveaux.name as niveau_name',
            )
            ->get();

       $grouped = $students
        ->groupBy('student_id')
        ->map(function ($values) {
            return [
                'student_id' => $values->first()->student_id,
                'student_name' => $values->first()->name,
                'student_lastname' => $values->first()->lastname,
                'payment_date' => $values->first()->payment_date,
                'groupe' => $values->first()->groupe,
                'parent_name' => $values->first()->parentname,
                'parent_phone' => $values->first()->parentphone,
                'student_phone' => $values->first()->studentphone,
                'student_image' => $values->first()->image,
            
                'payments' => $values->groupBy('class_id')->map(function ($row) {
                    return [
                        'payment_id' =>    $row->first()->payment_id,
                        'class_id'   =>    $row->first()->class_id,
                        'class_name' =>    $row->first()->matiere_name,
                        'class_niveau' =>  $row->first()->niveau_name,
                        'payment_state' => $row->first()->payment_state,
                        'payment_price' => $row->first()->payment_price,
                        'months' => $row->map(function($m){
                            return[
                                'payment_id'=>$m->payment_id,
                                'month'=>$m->payment_month,
                                'day'=>$m->payment_day,
                                'status'=>$m->payment_state,
                                'payment_price'=>$m->payment_price,
                            ];
                        })->values(),
                    ];
                })->values()
            ];
        })
        ->values();

        return response()->json([
            'students'=>$grouped,
        ]);
    }
    

//----------------------------------------------------------------------------------------------=








public function getStudent($id)
{
    $students = $this->getStudents()->original['students']; 
    $student = collect($students)->firstWhere('student_id', $id);

    if (!$student) {
        return response()->json([
            'student' => null,
            'message' => 'No student found for id: ' . $id
        ], 404);
    }

    return response()->json([
        'student' => $student
    ]);
}



//-----------------------------------------------------------------------------------------------





    public function setPayment(Request $request)
{
    $paymentId = (int) $request->paymentId;
    $classId   = (int) $request->classId;
    $studentId = (int) $request->studentId;   
    $month     = (int) $request->month;

    $schoolMonths = [9,10,11,12,1,2,3,4,5,6];

    $current = Payment::where('id', $paymentId)
        ->where('class_id', $classId)
        ->where('student_id', $studentId)
        ->where('month', $month)
        ->firstOrFail();

    $clickedIndex = array_search($month, $schoolMonths, true);

    if ($current->status === 'paye') {
        $current->status = 'impaye';
        $current->save();

        return response()->json([
            'success' => true,
            'clicked_month' => $month,
            'status' => 'impaye',
            'updated' => [
                ['payment_id' => $current->id, 'status' => 'impaye']
            ]
        ]);
    }

        if ($current->status === 'impaye') {
        $current->status = 'paye';
        $current->save();

        return response()->json([
            'success' => true,
            'clicked_month' => $month,
            'status' => 'paye',
            'updated' => [
                ['payment_id' => $current->id, 'status' => 'paye']
            ]
        ]);
    }


    $updated = [];

    foreach ($schoolMonths as $index => $m) {

        $p = Payment::where('student_id', $studentId)
            ->where('class_id', $classId)
            ->where('month', $m)
            ->first();

        if (!$p) continue;

        if($p->status==='canceled'){
            if ($index === $clickedIndex) {
                $p->status = 'paye';
                $p->save();
                $updated[] = ['payment_id' => $p->id, 'status' => 'paye'];
            }
            elseif ($index > $clickedIndex) {
                $p->status = 'impaye';
                $p->save();
                $updated[] = ['payment_id' => $p->id, 'status' => 'impaye'];
            }
        }
    }

    return response()->json([
        'success' => true,
        'clicked_month' => $month,
        'status' => 'paye',
        'updated' => $updated
    ]);
}





//-----------------------------------------------------------------------------------------------






    
public function setPaymentToCanceled(Request $request){
    $studentId = (int) $request->studentId; 
    $classId   = (int) $request->classId;
    $month     = (int) $request->month;

    $schoolMonths = [9,10,11,12,1,2,3,4,5,6];

    $cancelIndex = array_search($month, $schoolMonths, true);
    if ($cancelIndex === false) {
        return response()->json(['status' => 'invalid_month'], 422);
    }

    $monthsToCancel = array_slice($schoolMonths, $cancelIndex);

    $affected = Payment::where('student_id', $studentId)
        ->where('class_id', $classId)
        ->whereIn('month', $monthsToCancel)
        ->get(['id']);

    if ($affected->isEmpty()) {
        return response()->json(['status' => 'not_found'], 404);
    }

    Payment::whereIn('id', $affected->pluck('id'))
        ->update(['status' => 'canceled']);

    $updated = $affected->map(fn($p) => [
        'payment_id' => $p->id,
        'status'     => 'canceled'
    ])->values();

    return response()->json([
        'status'  => 'canceled',
        'updated' => $updated
    ]);
}






//-----------------------------------------------------------------------------------------------











public function setPaymentToCanceledAll(Request $request){
    $studentId = (int) $request->studentId; 
    $month     = (int) $request->month;

    $schoolMonths = [9,10,11,12,1,2,3,4,5,6];
    
    $cancelIndex = array_search($month, $schoolMonths, true);
    $monthsToCancel = array_slice($schoolMonths, $cancelIndex);

    $affected = Payment::where('student_id', $studentId)
        ->whereIn('month', $monthsToCancel)
        ->get(['id']);

    Payment::whereIn('id', $affected->pluck('id'))
        ->update(['status' => 'canceled']);

    $updated = $affected->map(fn($p) => [
        'payment_id' => $p->id,
        'status'     => 'canceled'
    ])->values();

    return response()->json([
        'status'  => 'canceled',
        'allUpdated' => $updated
    ]);
}









//-----------------------------------------------------------------------------------------------









public function setPaymentAll(Request $request)
{
    $studentId = (int) $request->studentId;
    $month     = (int) $request->month;
    $schoolMonths = [9,10,11,12,1,2,3,4,5,6];

    $payments = Payment::where('student_id', $studentId)
        ->where('month', $month)
        ->get();

    $updated = [];

    foreach($payments as $p){
        if($p->status==='impaye'){

            $p->status='paye';
            $p->save();
                    $updated[] = [
            'payment_id' => $p->id,
            'status' => 'paye'
        ];

        }
    }

    $clickedIndex = array_search($month, $schoolMonths, true);



    foreach ($schoolMonths as $index => $m) {

        $paymentss = Payment::where('student_id', $studentId)
            ->where('month', $m)
            ->get();

        foreach($paymentss as $p){
            if($p->status==='canceled'){
                if ($index === $clickedIndex) {
                    $p->status = 'paye';
                    $p->save();
                    $updated[] = ['payment_id' => $p->id, 'status' => 'paye'];
                }
                elseif ($index > $clickedIndex) {
                    $p->status = 'impaye';
                    $p->save();
                    $updated[] = ['payment_id' => $p->id, 'status' => 'impaye'];
                }
            }
        }
    }

    return response()->json([
        'success' => true,
        'updated' => $updated
    ]);

}


public function getRegistredClasses(){
    $classes = DB::table('classes')
        ->join('niveaux', 'classes.niveau_id', '=', 'niveaux.id')
        ->join('matieres', 'classes.matiere_id', '=', 'matieres.id')
        ->join('classes', 'payment.class_id', '=', 'classes.id')
        ->select(
            'niveaux.id as niveau_id',
            'niveaux.name as niveau_name',
            'matieres.id as matiere_id',
            'matieres.name as matiere_name',
            'classes.id as class_id',
            'classes.price as matiere_price',
        )->where('',)
        ->get();

    $grouped = collect($classes)
        ->groupBy('niveau_id')
        ->map(function ($values) {
            return [
               //used to return a json table in order to send it to the front end 
               //keys       =>    values
                'niveau_id' => $values->first()->niveau_id,
                'niveau_name' => $values->first()->niveau_name,
                'matieres' => $values->map(function ($class) {
                    return [
                        'matiere_id' => $class->matiere_id,
                        'matiere_name' => $class->matiere_name,
                        'matiere_price' => $class->matiere_price,
                        'class_id' => $class->class_id,
                    ];
                })->toArray(),
            ];
        })
        ->values()
        ->toArray();

    return response()->json([
        'classes' => $grouped
    ]);
}



//---------------------------------------------------------------------------------------------










public function update(Request $request, $studentId)
{
    if (Session::get('user_role') === 'secretary') {
        $restricted = (bool) DB::table('secretaries')
            ->where('user_id', Session::get('user_id'))
            ->value('restricted');

        if ($restricted) {
            abort(403, 'Editing is disabled for your account.');
        }
    }

    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'lastname' => 'required|string|max:255',
        'studentphone' => 'nullable|string|max:20',
        'parentname' => 'nullable|string|max:255',
        'parentphone' => 'nullable|string|max:20',
        'groupe' => 'nullable|integer|min:1',
        'date' => 'nullable|date',

        'payments' => 'nullable|array',
        'payments.*.id' => 'required|integer|exists:payments,id',
        'payments.*.price' => 'nullable|numeric|min:0',
        'payments.*.status' => 'nullable|in:paye,impaye,canceled',

        'apply_next_months' => 'nullable|array',

        'new_classes' => 'nullable|array',
        'new_classes.*' => 'integer|exists:classes,id',
        'new_classes_prices' => 'nullable|array',
        'new_classes_prices.*' => 'nullable|numeric|min:0',
        'new_classes_dates' => 'nullable|array',
        'new_classes_dates.*' => 'nullable|date',

        'selected_month' => 'nullable|integer|between:1,12',
    ]);

    try {

        DB::transaction(function () use ($validated, $studentId) {

            DB::table('students')
                ->where('id', $studentId)
                ->update([
                    'name' => $validated['name'],
                    'lastname' => $validated['lastname'],
                    'parentname' => $validated['parentname'] ?? null,
                    'studentphone' => $validated['studentphone'] ?? null,
                    'parentphone' => $validated['parentphone'] ?? null,
                    'updated_at' => now()
                ]);

            $schoolMonths = [9,10,11,12,1,2,3,4,5,6];

            if (!empty($validated['payments']) && !empty($validated['selected_month'])) {

                foreach ($validated['payments'] as $payment) {

                    $paymentRow = DB::table('payments')
                        ->where('id', $payment['id'])
                        ->where('student_id', $studentId)
                        ->first();

                    if (!$paymentRow) continue;

                    $classPrice = DB::table('classes')
                        ->where('id', $paymentRow->class_id)
                        ->value('price');

                    $newPrice = $payment['price'] ?? $paymentRow->price;
                    $status = $payment['status'] ?? $paymentRow->status;
                    $reduction = $newPrice < $classPrice ? 1 : 0;

                   $monthsToUpdate = [];

$schoolMonths = [9,10,11,12,1,2,3,4,5,6];

$applyNext = !empty($validated['apply_next_months'][$payment['id']]);

if ($applyNext) {
    $order = [9,10,11,12,1,2,3,4,5,6];

    $startMonthInt = (int) $paymentRow->month;

    $idx = array_search($startMonthInt, $order, true);

    if ($idx === false) {
        continue;
    }

    $monthsToUpdate = array_slice($order, $idx);
} else {
    $monthsToUpdate = [(int) $paymentRow->month];
}

DB::table('payments')
    ->where('student_id', $studentId)
    ->where('class_id', $paymentRow->class_id)
    ->whereIn('month', $monthsToUpdate)
    ->update([
        'price' => $newPrice,
        'reduction' => $reduction,
        'status' => $status,
        'groupe' => $validated['groupe'] ?? null,
        'updated_at' => now()
    ]);
                    
                    
                }
            }

            if (!empty($validated['new_classes'])) {

                foreach ($validated['new_classes'] as $classId) {

                    $class = DB::table('classes')->where('id', $classId)->first();
                    if (!$class) continue;

                    $classPrice = $class->price;
                    $enteredPrice = $validated['new_classes_prices'][$classId] ?? null;
                    $finalPrice = $enteredPrice ?? $classPrice;
                    $reduction = $finalPrice < $classPrice ? 1 : 0;

                    $dateInput = $validated['new_classes_dates'][$classId] ?? now();
                    $enrollmentDate = \Carbon\Carbon::parse($dateInput);

                    foreach ($schoolMonths as $month) {
                        DB::table('payments')->insert([
                            'student_id' => $studentId,
                            'class_id' => $class->id,
                            'matiere_id' => $class->matiere_id,
                            'niveau_id' => $class->niveau_id,
                            'price' => $finalPrice,
                            'reduction' => $reduction,
                            'month' => $month,
                            'day' => $enrollmentDate->day,
                            'status' => 'impaye',
                            'groupe' => $validated['groupe'] ?? null,
                            'date' => $enrollmentDate->toDateString(),
                            'created_at' => now(),
                            'updated_at' => now()
                        ]);
                    }
                }
            }
        });

        return response()->json([
            'message' => 'Student updated successfully',
            'type' => 'success'
        ]);

    } catch (\Throwable $e) {
        Log::error($e->getMessage());

        return response()->json([
            'message' => 'Update failed',
            'type' => 'error'
        ], 500);
    }
}
}