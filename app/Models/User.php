<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $guarded = [];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_prompted_at' => 'datetime',
    ];

    public function profs()
    {
        return $this->hasMany(Prof::class);
    }

    public function secretaries()
    {
        return $this->hasMany(Secretary::class);
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function histories()
    {
        return $this->hasMany(History::class);
    }
}
