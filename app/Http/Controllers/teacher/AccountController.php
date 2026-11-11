<?php

namespace App\Http\Controllers\teacher;

use App\Http\Controllers\Controller;
use App\Models\Prof;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

/**
 * Self-service account settings for teachers:
 * username, optional email and password.
 */
class AccountController extends Controller
{
    /**
     * Resolve the logged-in teacher or stop with a JSON 401 / 403.
     */
    private function teacher(): User
    {
        $user = Auth::user();

        if (!$user && session('user_id')) {
            $user = User::find(session('user_id'));
        }

        if (!$user) {
            abort(response()->json(['message' => 'Non authentifié.'], 401));
        }

        if ($user->role !== 'teacher') {
            abort(response()->json(['message' => 'Accès refusé.'], 403));
        }

        return $user;
    }

    private function payload(User $user): array
    {
        return [
            'id'                 => $user->id,
            'name'               => $user->name,
            'email'              => $user->email,
            // Ask once: only while there is no email and the prompt was never answered/skipped.
            'needs_email_prompt' => empty($user->email) && is_null($user->email_prompted_at),
        ];
    }

    private function normalizeEmail(?string $email): ?string
    {
        $email = $email === null ? '' : strtolower(trim($email));

        return $email === '' ? null : $email;
    }

    // ------------------------------------------------------------------
    // GET /teacher/profile
    // ------------------------------------------------------------------
    public function show()
    {
        return response()->json($this->payload($this->teacher()));
    }

    // ------------------------------------------------------------------
    // PUT /teacher/profile  (username + email)
    // ------------------------------------------------------------------
    public function updateProfile(Request $request)
    {
        $user = $this->teacher();

        $newName  = trim((string) $request->input('name'));
        $newEmail = $this->normalizeEmail($request->input('email'));

        $nameChanged  = $newName !== $user->name;
        $oldEmail     = $this->normalizeEmail($user->email);
        $emailChanged = $newEmail !== $oldEmail;

        // Uniqueness is only checked when the value actually changes, because
        // older accounts may already share a username.
        $nameRules = ['required', 'string', 'max:255'];
        if ($nameChanged) {
            $nameRules[] = Rule::unique('users', 'name')->ignore($user->id);
        }

        $emailRules = ['nullable', 'email', 'max:255'];
        if ($emailChanged && $newEmail !== null) {
            $emailRules[] = Rule::unique('users', 'email')->ignore($user->id);
        }

        $request->merge(['name' => $newName, 'email' => $newEmail]);

        $request->validate([
            'name'  => $nameRules,
            'email' => $emailRules,
        ], [
            'name.required' => "Le nom d'utilisateur est obligatoire.",
            'name.unique'   => "Ce nom d'utilisateur est déjà utilisé.",
            'email.email'   => "L'adresse email n'est pas valide.",
            'email.unique'  => 'Cette adresse email est déjà utilisée.',
        ]);

        // Changing the username, or changing/removing an existing email,
        // must be confirmed with the current password.
        $needsPassword = $nameChanged || ($emailChanged && $oldEmail !== null);

        if ($needsPassword) {
            $request->validate(['current_password' => ['required', 'string']], [
                'current_password.required' => 'Entrez votre mot de passe actuel pour confirmer.',
            ]);

            if (!Hash::check($request->input('current_password'), $user->password)) {
                return response()->json([
                    'message' => 'Mot de passe actuel incorrect.',
                    'errors'  => ['current_password' => ['Mot de passe actuel incorrect.']],
                ], 422);
            }
        }

        $user->name  = $newName;
        $user->email = $newEmail;
        // Handling the email here counts as having answered the first-time prompt.
        if (is_null($user->email_prompted_at)) {
            $user->email_prompted_at = now();
        }
        $user->save();

        // Keep the teacher record (shown in admin screens) in sync with the login name.
        if ($nameChanged) {
            Prof::where('user_id', $user->id)->update(['name' => $newName]);
        }

        return response()->json([
            'message' => 'Profil mis à jour avec succès.',
            'user'    => $this->payload($user),
        ]);
    }

    // ------------------------------------------------------------------
    // PUT /teacher/profile/password
    // ------------------------------------------------------------------
    public function updatePassword(Request $request)
    {
        $user = $this->teacher();

        $request->validate([
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'string', 'min:6', 'confirmed', 'different:current_password'],
        ], [
            'current_password.required' => 'Entrez votre mot de passe actuel.',
            'password.required'         => 'Entrez un nouveau mot de passe.',
            'password.min'              => 'Le mot de passe doit contenir au moins 6 caractères.',
            'password.confirmed'        => 'La confirmation ne correspond pas.',
            'password.different'        => "Le nouveau mot de passe doit être différent de l'ancien.",
        ]);

        if (!Hash::check($request->input('current_password'), $user->password)) {
            return response()->json([
                'message' => 'Mot de passe actuel incorrect.',
                'errors'  => ['current_password' => ['Mot de passe actuel incorrect.']],
            ], 422);
        }

        $user->password = Hash::make($request->input('password'));
        $user->save();

        return response()->json(['message' => 'Mot de passe modifié avec succès.']);
    }

    // ------------------------------------------------------------------
    // POST /teacher/profile/email-prompt
    // First-visit popup. Email is optional: sending nothing = "skip".
    // ------------------------------------------------------------------
    public function answerEmailPrompt(Request $request)
    {
        $user = $this->teacher();

        $email = $this->normalizeEmail($request->input('email'));

        // This endpoint can only *set* a first email, never replace one.
        if ($email !== null && empty($user->email)) {
            $request->merge(['email' => $email]);

            $request->validate([
                'email' => ['email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            ], [
                'email.email'  => "L'adresse email n'est pas valide.",
                'email.unique' => 'Cette adresse email est déjà utilisée.',
            ]);

            $user->email = $email;
        }

        $user->email_prompted_at = now();
        $user->save();

        return response()->json([
            'message' => $email ? 'Email enregistré.' : 'Vous pourrez l’ajouter plus tard depuis « Mon compte ».',
            'user'    => $this->payload($user),
        ]);
    }
}
