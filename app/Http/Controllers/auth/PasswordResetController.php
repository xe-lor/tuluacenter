<?php

namespace App\Http\Controllers\auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Str;
use Throwable;

/**
 * "Forgot password" for teachers, by email + 6-digit code.
 *
 *   POST /auth/forgot-password   { email }                                   -> sends the code
 *   POST /auth/reset-password    { email, code, password, password_confirmation }
 *
 * Gmail credentials live in config/gmail_reset.php.
 */
class PasswordResetController extends Controller
{
    private const TABLE        = 'password_reset_codes';
    private const MAX_ATTEMPTS = 5;   // wrong codes allowed before the code is burned
    private const RESEND_AFTER = 60;  // seconds between two emails for the same address

    private function normalizeEmail(string $email): string
    {
        return strtolower(trim($email));
    }

    private function findTeacher(string $email): ?User
    {
        return User::whereRaw('LOWER(email) = ?', [$email])
            ->where('role', 'teacher')
            ->first();
    }

    private function gmailAddress(): string
    {
        return trim((string) config('gmail_reset.gmail_address'));
    }

    private function gmailPassword(): string
    {
        // Google shows the code as "abcd efgh ijkl mnop": spaces are ignored.
        return str_replace(' ', '', (string) config('gmail_reset.gmail_app_password'));
    }

    private function gmailIsConfigured(): bool
    {
        $address  = $this->gmailAddress();
        $password = $this->gmailPassword();

        return $address !== ''
            && $password !== ''
            && !str_contains($address, 'PASTE_')
            && !str_contains($password, 'PASTE_');
    }

    private function mailer()
    {
        config(['mail.mailers.gmail_reset' => [
            'transport'  => 'smtp',
            'host'       => 'smtp.gmail.com',
            'port'       => 587,
            'encryption' => 'tls',
            'username'   => $this->gmailAddress(),
            'password'   => $this->gmailPassword(),
            'timeout'    => 15,
        ]]);

        return Mail::mailer('gmail_reset');
    }

    private function emailHtml(string $name, string $code, int $minutes): string
    {
        $name = e($name);

        return <<<HTML
<div style="font-family:Arial,Helvetica,sans-serif;background:#F5F6FA;padding:32px 16px;">
  <div style="max-width:460px;margin:0 auto;background:#FFFFFF;border-radius:14px;padding:32px 28px;border:1px solid #EDEEF4;">
    <div style="color:#7B2FF2;font-size:11px;font-weight:700;letter-spacing:3px;">TULUA CENTER</div>
    <h2 style="color:#171725;margin:8px 0 12px;font-size:22px;">Réinitialisation du mot de passe</h2>
    <p style="color:#2D2D3A;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Bonjour {$name}, voici votre code de vérification :
    </p>
    <div style="text-align:center;margin:0 0 20px;">
      <span style="display:inline-block;background:#F5F6FA;border:1px solid #EDEEF4;border-radius:10px;padding:14px 26px;font-size:32px;font-weight:700;letter-spacing:10px;color:#7B2FF2;">{$code}</span>
    </div>
    <p style="color:#6F7085;font-size:13px;line-height:1.6;margin:0;">
      Ce code est valable {$minutes} minutes. Si vous n'êtes pas à l'origine de cette demande,
      ignorez simplement cet email : votre mot de passe ne sera pas modifié.
    </p>
  </div>
</div>
HTML;
    }

    // ------------------------------------------------------------------
    // POST /auth/forgot-password
    // ------------------------------------------------------------------
    public function sendCode(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', 'max:255'],
        ], [
            'email.required' => 'Entrez votre adresse email.',
            'email.email'    => "L'adresse email n'est pas valide.",
        ]);

        $email = $this->normalizeEmail($request->input('email'));

        // Answer once the code has been sent (or was sent less than a minute ago).
        $generic = response()->json([
            'message' => 'Si un compte enseignant correspond à cet email, un code de vérification vient de lui être envoyé.',
        ]);

        // Checked before any lookup so the answer does not depend on the email.
        if (!$this->gmailIsConfigured()) {
            Log::error('Password reset: Gmail is not configured (see config/gmail_reset.php).');

            return response()->json([
                'message' => "L'envoi d'email n'est pas encore configuré. Contactez l'administrateur.",
            ], 500);
        }

        $user = $this->findTeacher($email);

        // Tells the user clearly when no teacher has this email.
        // (This also reveals which emails are registered; to hide that,
        // replace this block with `return $generic;`.)
        if (!$user) {
            $notFound = "Aucun enseignant n'est associé à cet email.";

            return response()->json([
                'message' => $notFound,
                'errors'  => ['email' => [$notFound]],
            ], 422);
        }

        // Do not send a new email if one was sent less than a minute ago.
        $existing = DB::table(self::TABLE)->where('email', $email)->first();
        if ($existing && $existing->created_at
            && Carbon::parse($existing->created_at)->gt(now()->subSeconds(self::RESEND_AFTER))) {
            return $generic;
        }

        $minutes = (int) config('gmail_reset.code_ttl_minutes', 15);
        $code    = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        DB::table(self::TABLE)->updateOrInsert(
            ['email' => $email],
            [
                'code_hash'  => Hash::make($code),
                'attempts'   => 0,
                'expires_at' => now()->addMinutes($minutes),
                'created_at' => now(),
            ]
        );

        $address  = $this->gmailAddress();
        $fromName = (string) config('gmail_reset.from_name', 'Tulua Center');
        $html     = $this->emailHtml((string) $user->name, $code, $minutes);

        try {
            $this->mailer()->send(['html' => new HtmlString($html)], [], function ($message) use ($address, $fromName, $email, $user) {
                $message->from($address, $fromName)
                    ->to($email, $user->name)
                    ->subject('Votre code de réinitialisation - Tulua Center');
            });
        } catch (Throwable $e) {
            DB::table(self::TABLE)->where('email', $email)->delete();
            Log::error('Password reset: email could not be sent. ' . $e->getMessage());

            return response()->json([
                'message' => "Impossible d'envoyer l'email pour le moment. Réessayez plus tard.",
            ], 500);
        }

        return $generic;
    }

    // ------------------------------------------------------------------
    // POST /auth/reset-password
    // ------------------------------------------------------------------
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'    => ['required', 'email', 'max:255'],
            'code'     => ['required', 'digits:6'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'email.required'     => 'Entrez votre adresse email.',
            'email.email'        => "L'adresse email n'est pas valide.",
            'code.required'      => 'Entrez le code reçu par email.',
            'code.digits'        => 'Le code contient 6 chiffres.',
            'password.required'  => 'Entrez un nouveau mot de passe.',
            'password.min'       => 'Le mot de passe doit contenir au moins 6 caractères.',
            'password.confirmed' => 'La confirmation ne correspond pas.',
        ]);

        $email = $this->normalizeEmail($request->input('email'));

        $invalid = response()->json([
            'message' => 'Code invalide ou expiré.',
            'errors'  => ['code' => ['Code invalide ou expiré.']],
        ], 422);

        $record = DB::table(self::TABLE)->where('email', $email)->first();

        if (!$record) {
            return $invalid;
        }

        if (Carbon::parse($record->expires_at)->isPast() || $record->attempts >= self::MAX_ATTEMPTS) {
            DB::table(self::TABLE)->where('email', $email)->delete();
            return $invalid;
        }

        // Count the try before checking it, so a wrong guess is always counted.
        DB::table(self::TABLE)->where('email', $email)->increment('attempts');

        if (!Hash::check($request->input('code'), $record->code_hash)) {
            return $invalid;
        }

        $user = $this->findTeacher($email);

        if (!$user) {
            DB::table(self::TABLE)->where('email', $email)->delete();
            return $invalid;
        }

        $user->password = Hash::make($request->input('password'));
        $user->setRememberToken(Str::random(60));
        $user->save();

        // A code can only be used once.
        DB::table(self::TABLE)->where('email', $email)->delete();

        return response()->json([
            'message' => 'Mot de passe modifié avec succès. Vous pouvez vous connecter.',
        ]);
    }
}