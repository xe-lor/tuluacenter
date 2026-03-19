<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')
                  ->constrained('students')
                  ->cascadeOnDelete();
            $table->foreignId('matiere_id')
                  ->constrained('matieres')
                  ->cascadeOnDelete();
            $table->foreignId('niveau_id')
                  ->constrained('niveaux')
                  ->cascadeOnDelete();
            $table->foreignId('class_id')
                  ->constrained('classes')
                  ->cascadeOnDelete();
            $table->integer('groupe')->nullable();
            $table->decimal('price', 8, 2);
            $table->integer('reduction')->nullable();
            $table->date('date');
            $table->integer('month');
            $table->integer('day');
            $table->string('status');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
