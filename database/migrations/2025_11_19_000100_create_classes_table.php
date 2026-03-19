<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('matiere_id')
                  ->constrained('matieres')
                  ->cascadeOnDelete();
            $table->foreignId('prof_id')
                  ->constrained('profs')
                  ->cascadeOnDelete();
            $table->foreignId('niveau_id')
                  ->constrained('niveaux')
                  ->cascadeOnDelete();
            $table->integer('percentage');
            $table->decimal('price', 8, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
