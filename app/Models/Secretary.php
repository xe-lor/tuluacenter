<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Secretary extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'restricted' => 'boolean',
    ];

    // School year order: 9, 10, 11, 12, 1, 2, 3, 4, 5, 6
    public const SCHOOL_MONTHS = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function history()
    {
        return $this->hasMany(History::class);
    }

    // True if this secretary can't touch the given month
    public function isMonthLocked(int $month): bool
    {
        if (!$this->restricted || $this->blocked_months === null) {
            return false;
        }

        $position = array_search($month, self::SCHOOL_MONTHS, true);
        $limit = array_search((int) $this->blocked_months, self::SCHOOL_MONTHS, true);

        return $position !== false && $limit !== false && $position <= $limit;
    }

    // Months this secretary may still use, in school-year order
    public function allowedMonths(): array
    {
        return array_values(array_filter(
            self::SCHOOL_MONTHS,
            fn ($m) => !$this->isMonthLocked($m)
        ));
    }
}