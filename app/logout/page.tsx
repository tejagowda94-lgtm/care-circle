"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      // 1. Sign out from Supabase
      await supabase.auth.signOut();
      
      // 2. Redirect to login page after 1.5 seconds
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    };

    performLogout();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-slate-800">Logging you out...</h1>
        <p className="text-slate-500">See you soon! 🌍</p>
      </div>
    </div>
  );
}