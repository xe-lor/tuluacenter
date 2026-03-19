<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Classe extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $table = 'classes';

    public function matiere()
    {
        return $this->belongsTo(Matiere::class);
    }

    public function prof()
    {
        return $this->belongsTo(Prof::class);
    }

    public function niveau()
    {
        return $this->belongsTo(Niveau::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'class_id');
    }

    public function absences()
    {
        return $this->hasMany(Absence::class, 'class_id');
    }
}
