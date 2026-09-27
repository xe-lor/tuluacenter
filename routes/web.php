<?php

use App\Http\Controllers\admin\AssistantController;
use App\Http\Controllers\admin\ClassController;
use App\Http\Controllers\admin\MatiereController;
use App\Http\Controllers\admin\NiveauController;
use App\Http\Controllers\admin\TeacherController;

use App\Http\Controllers\auth\AuthController;

use App\Http\Controllers\payment\PaymentController;
use App\Http\Controllers\payment\QrController;

use App\Http\Controllers\teacher\TeacherController as TeacherPaymentController;

use Illuminate\Support\Facades\Route;


Route::prefix('/admin')->group(function(){
    Route::get('/matieres', [MatiereController::class, 'index']);
    Route::post('/storeMatiere',[MatiereController::class,'store']);
    Route::post('/matieres/delete', [MatiereController::class, 'delete']);
    Route::get('/matieres/{id}', [MatiereController::class, 'show']);
    Route::put('/matieres/{id}', [MatiereController::class, 'update']);


    Route::get('/niveaux', [NiveauController::class, 'index']);
    Route::post('/storeNiveau',[NiveauController::class,'store']);
    Route::post('/niveaux/delete', [NiveauController::class, 'delete']);
    Route::get('/niveaux/{id}', [NiveauController::class, 'show']);
    Route::put('/niveaux/{id}', [NiveauController::class, 'update']);


    Route::post('/storeTeacher',[TeacherController::class,'store']);
    Route::get('/teachers/{id}', [TeacherController::class, 'show']);
    Route::put('/teachers/{id}', [TeacherController::class, 'update']);
    Route::get('/profs', [TeacherController::class, 'index']);
    Route::delete('teachers/{id}', [TeacherController::class, 'destroy']);


    Route::get('/classes',[ClassController::class,'classes']);
    Route::get('/classes/index',[ClassController::class,'index']);
    Route::post('/classes',[ClassController::class,'store']);
    Route::put('/classes/{id}',[ClassController::class,'update']);
    Route::delete('/classes/{id}',[ClassController::class,'destroy']);

    
    Route::post('/assistants', [AssistantController::class, 'store']);
    Route::get('/secretaries', [AssistantController::class, 'index']);
    Route::get('/secretaries/{id}', [AssistantController::class, 'show']);
    Route::put('/secretaries/{id}', [AssistantController::class, 'update']);
    Route::delete('secretaries/{id}', [AssistantController::class, 'destroy']);
});





Route::prefix('/auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);
});









Route::prefix('/payment')->group(function(){
    Route::post('/createStudent',[PaymentController::class,'store']);
    Route::get('/getClasses',[PaymentController::class,'getClasses']);
    Route::get('/getClassesForUpdate/{studentId}',[PaymentController::class, 'getClassesForUpdate']);
    Route::get('/getStudents',[PaymentController::class,'getStudents']);
    Route::post('/setPayment',[PaymentController::class, 'setPayment']);
    Route::post('/setPaymentToCanceled',[PaymentController::class, 'setPaymentToCanceled']);
    Route::post('/setPaymentToCanceledAll',[PaymentController::class, 'setPaymentToCanceledAll']);   
    Route::post('/setPaymentAll',[PaymentController::class, 'setPaymentAll']);
    Route::delete('/deleteStudent/{Id}',[PaymentController::class,'delete']);
    Route::post('/updateStudent/{studentId}', [PaymentController::class, 'update']);
    Route::get('/getStudent/{id}', [PaymentController::class, 'getStudent']);
    Route::get('/students/Qr',[QrController::class,'getStudentsQr']);
    Route::post('/students/details/{student_id}', [QrController::class, 'getStudentPayments']);
});


Route::prefix('/teacher')->group(function () {

    // Students list (filters + ajax)
    Route::get('/students', [TeacherPaymentController::class, 'index']);

    // Stats
    Route::get('/stats', [TeacherPaymentController::class, 'stats']);

});



Route::get('/{any}', function () {
    return view('main');
})->where('any', '^(?!auth|api).*$');


