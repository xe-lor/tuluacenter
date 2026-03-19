<?php

use App\Http\Controllers\admin\ClassController;
use App\Http\Controllers\admin\MatiereController;
use App\Http\Controllers\admin\NiveauController;
use App\Http\Controllers\admin\TeacherController;
use App\Http\Controllers\auth\AuthController;
use App\Http\Controllers\payment\PaymentController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->group(function(){
    Route::post('/storeMatiere',[MatiereController::class,'store']);
    Route::post('/storeNiveau',[NiveauController::class,'store']);
    Route::post('/storeTeacher',[TeacherController::class,'store']);
    Route::get('/classes',[ClassController::class,'classes']);
    Route::post('/classes',[ClassController::class,'store']);
});

Route::prefix('auth')->group(function(){
    Route::post('/login',[AuthController::class,'Login']);
}); 

Route::prefix('payment')->group(function(){
    Route::post('/createStudent',[PaymentController::class,'store']);
    Route::get('/getClasses',[PaymentController::class,'getClasses']);
    Route::get('/getStudents',[PaymentController::class,'getStudents']);
    Route::post('/setPayment',[PaymentController::class, 'setPayment']);
    Route::post('/setPaymentToCanceled',[PaymentController::class, 'setPaymentToCanceled']);
    Route::post('/setPaymentToCanceledAll',[PaymentController::class, 'setPaymentToCanceledAll']);   
    Route::post('/setPaymentAll',[PaymentController::class, 'setPaymentAll']);
    Route::delete('/deleteStudent/{Id}',[PaymentController::class,'delete']);
    Route::post('/updateStudent/{studentId}', [PaymentController::class, 'update']);
    Route::get('/getStudent/{id}', [PaymentController::class, 'getStudent']);
});

Route::get('/{any}', function () {
    return view('main');
})->where('any', '.*');