"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogIn, Compass, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLocale } from '@/components/providers/useLocale';

export default function LoginPage() {
  const { t } = useLocale();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-12 rounded-[3rem] shadow-2xl shadow-primary/5 border border-gray-100 text-center">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Compass className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter">{t.login.welcomeBack}</h1>
          <p className="text-gray-400 font-medium">{t.login.subtitle}</p>
        </div>

        <div className="space-y-4 pt-8">
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center space-x-4 bg-white border-2 border-gray-100 hover:border-primary px-8 py-5 rounded-2xl transition-all group"
          >
            <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-6 h-6" alt="Google" />
            <span className="text-sm font-black uppercase tracking-widest text-primary">{t.login.signInGoogle}</span>
          </button>

          <button
            onClick={() => signIn("credentials", { 
              email: "test@example.com", 
              password: "password",
              callbackUrl: "/dashboard" 
            })}
            className="w-full flex items-center justify-center space-x-4 bg-primary text-white px-8 py-5 rounded-2xl transition-all hover:bg-emerald-900 shadow-xl"
          >
            <LogIn className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-widest">{t.login.dummyLogin}</span>
          </button>
        </div>

        <div className="pt-10 border-t border-gray-50">
          <p className="text-xs text-gray-400 font-medium mb-6">{t.login.planningTrip}</p>
          <Link href="/plan-your-trip" className="inline-flex items-center text-xs font-black uppercase tracking-[0.2em] text-orange-500 hover:text-orange-600 transition-colors">
            {t.login.startPlanning} <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
