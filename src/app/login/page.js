"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Compass, ArrowRight, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from '@/components/providers/useLocale';

function LoginContent() {
  const { t } = useLocale();
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError(t.login.errorInvalidCredentials || 'Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: email.trim(),
        password: password.trim(),
        callbackUrl
      });

      if (res?.error) {
        setError(t.login.errorInvalidCredentials || 'Invalid email or password.');
      } else if (res?.ok) {
        router.push(callbackUrl);
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    try {
      await signIn('google', { callbackUrl });
    } catch (err) {
      console.error(err);
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center px-6 py-16 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-10 sm:p-12 rounded-[3rem] shadow-2xl shadow-primary/5 border border-gray-100 relative overflow-hidden"
      >
        <div className="space-y-4 text-center">
          <div className="w-20 h-20 bg-emerald-50/80 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Compass className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter italic">
            {t.login.welcomeBack}
          </h1>
          <p className="text-gray-400 font-medium text-xs sm:text-sm max-w-xs mx-auto">
            {t.login.subtitle}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-100 text-red-600 px-5 py-3.5 rounded-2xl text-xs font-bold flex items-center space-x-3 shadow-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleCredentialsSubmit} className="space-y-5">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
              {t.login.emailLabel || 'Email address'}
            </label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.login.emailPlaceholder || 'your@email.com'}
                className="w-full bg-gray-50/50 border-2 border-gray-50 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
              {t.login.passwordLabel || 'Password'}
            </label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.login.passwordPlaceholder || 'Enter your password'}
                className="w-full bg-gray-50/50 border-2 border-gray-50 rounded-2xl pl-12 pr-12 py-4 text-sm font-bold text-gray-900 focus:outline-none focus:border-primary focus:bg-white transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-3 bg-primary text-white py-4 px-8 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-emerald-900 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{t.login.submitLogin || 'Sign In'}</span>
              </>
            )}
          </motion.button>
        </form>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink mx-4 text-[9px] font-black text-gray-300 uppercase tracking-widest">
            {t.login.orContinueWith || 'OR CONTINUE WITH'}
          </span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGoogleSignIn}
          disabled={isGoogleSubmitting}
          className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-gray-100 hover:border-primary/30 px-6 py-4 rounded-2xl transition-all shadow-sm group disabled:opacity-50"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.23l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-xs font-black uppercase tracking-widest text-gray-700 group-hover:text-primary transition-colors">
            {t.login.signInGoogle}
          </span>
        </motion.button>

        <div className="pt-8 border-t border-gray-50 text-center">
          <p className="text-xs text-gray-400 font-medium mb-4">{t.login.planningTrip}</p>
          <Link href="/plan-your-trip" className="inline-flex items-center text-xs font-black uppercase tracking-[0.2em] text-orange-500 hover:text-orange-600 transition-colors">
            {t.login.startPlanning} <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
