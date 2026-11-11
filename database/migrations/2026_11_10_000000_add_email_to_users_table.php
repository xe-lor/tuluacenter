<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Adds the optional email (used later for password reset) and a flag that
     * remembers the "please add your email" prompt was already shown.
     *
     * Every step is guarded, so it is safe to run even if the `email`
     * column was already added by hand in phpMyAdmin.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'email')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('email')->nullable()->after('name');
            });
        }

        if (!Schema::hasColumn('users', 'email_prompted_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('email_prompted_at')->nullable()->after('email');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'email_prompted_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('email_prompted_at');
            });
        }

        if (Schema::hasColumn('users', 'email')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('email');
            });
        }
    }
};
