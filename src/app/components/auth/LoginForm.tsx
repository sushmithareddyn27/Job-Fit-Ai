import { useMemo, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Loader2, LogIn, Mail, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import type { AuthRole, AuthSession } from '@/app/auth/types';
import { loginWithOptions } from '@/app/auth/authService';
import { loadUsers, saveUsers } from '@/app/auth/storage';

interface LoginFormProps {
  role: AuthRole;
  onSuccess: (session: AuthSession) => void;
  onGoToSignup: () => void;
}

export function LoginForm({ role, onSuccess, onGoToSignup }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const accents = useMemo(
    () => (role === 'jobseeker' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'),
    [role]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsLoading(true);
    try {
      const session = await loginWithOptions(role, { email, password }, { rememberMe });
      onSuccess(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPassword = async () => {
    setError(null);
    setInfo(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Enter your email first, then click “Forgot password?”.');
      return;
    }

    // Demo-only reset: set password to 'password123' for the user+role.
    // This keeps everything local and avoids adding a backend.
    const users = loadUsers();
    const idx = users.findIndex((u) => u.email === normalizedEmail && u.role === role);
    if (idx === -1) {
      setError('No account found for this email and role.');
      return;
    }

    const enc = new TextEncoder();
    const hashBuf = await crypto.subtle.digest('SHA-256', enc.encode('password123'));
    const bytes = Array.from(new Uint8Array(hashBuf));
    const passwordHash = bytes.map((b) => b.toString(16).padStart(2, '0')).join('');

    users[idx] = { ...users[idx], passwordHash };
    saveUsers(users);
    setInfo('Password reset (demo). New password: password123');
  };

  return (
    <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} onSubmit={onSubmit}>
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {info && (
          <Alert>
            <AlertDescription>{info}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              className="pl-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(v) => setRememberMe(Boolean(v))}
              />
              <Label htmlFor="remember" className="text-sm text-gray-700">
                Remember me
              </Label>
            </div>

            <button
              type="button"
              className="text-sm text-gray-700 underline underline-offset-4"
              onClick={onForgotPassword}
            >
              Forgot password?
            </button>
          </div>
        </div>

        <Button type="submit" className={`w-full ${accents}`} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <LogIn className="mr-2 size-4" />}
          Login
        </Button>

        <div className="text-center text-sm text-gray-600">
          Don’t have an account?{' '}
          <button type="button" className="font-medium text-gray-900 underline underline-offset-4" onClick={onGoToSignup}>
            Sign up
          </button>
        </div>
      </div>
    </motion.form>
  );
}
