<?php

/*
|--------------------------------------------------------------------------
| Gmail settings for the "Forgot password" email
|--------------------------------------------------------------------------
|
| This is the ONLY place you need to edit to make the reset emails work.
|
| HOW TO GET THE 16-CHARACTER GMAIL CODE (App Password):
|   1. Open https://myaccount.google.com/security
|   2. Turn ON "2-Step Verification" (required by Google).
|   3. Open https://myaccount.google.com/apppasswords
|   4. Type a name (e.g. "Tulua Center") and click "Create".
|   5. Google shows a 16-character code like:  abcd efgh ijkl mnop
|   6. Paste it below. Spaces are ignored, so you can paste it as-is.
|
| Use the App Password here, NOT your normal Gmail password.
|
| NOTE: if you ever ran `php artisan config:cache` on the server, run
|       `php artisan config:clear` after editing this file.
|
*/

return [

    // The Gmail address that sends the emails.
    'gmail_address' => 'tuluainstitute007@gmail.com',

    // >>>>>>>>>>  PASTE YOUR 16-CHARACTER GMAIL CODE BETWEEN THE QUOTES  <<<<<<<<<<
    'gmail_app_password' => 'yvlz cazz gdgj jvun',

    // Sender name shown in the teacher's inbox.
    'from_name' => 'Tulua Center',

    // How long a code stays valid (minutes).
    'code_ttl_minutes' => 15,

];
