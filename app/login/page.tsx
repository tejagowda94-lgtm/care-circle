"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const router = useRouter();

  // 1. EMAIL LOGIN
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message); 
    else router.push('/');
  };

  // 2. FORGOT PASSWORD REQUEST
  const handleResetRequest = async () => {
    if (!email) {
      alert("Please enter your email address first.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) alert(error.message);
    else alert("Reset link sent to your email!");
  };

  // 3. PHONE LOGIN (Sends an OTP)
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showOtp) {
      const { error } = await supabase.auth.signInWithOtp({ phone: `+${phone}` });
      if (error) alert(error.message); 
      else setShowOtp(true);
    } else {
      const { error } = await supabase.auth.verifyOtp({ phone: `+${phone}`, token: otp, type: 'sms' });
      if (error) alert(error.message); 
      else router.push('/');
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      alert("Please enter both email and password!");
      return;
    }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Account created! Now you can Login.");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-sm">
        <h1 className="text-3xl font-black text-slate-800 mb-6 text-center">CareCircle AI</h1>
        
        {/* Toggle between Email and Phone */}
        <div className="flex mb-6 bg-slate-100 p-1 rounded-2xl">
          <button onClick={() => setMethod('email')} className={`flex-1 py-2 rounded-xl font-bold ${method === 'email' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>Email</button>
          <button onClick={() => setMethod('phone')} className={`flex-1 py-2 rounded-xl font-bold ${method === 'phone' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>Phone</button>
        </div>

        {method === 'email' ? (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-2xl border border-slate-200 font-bold" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 rounded-2xl border border-slate-200 font-bold" />
            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg">Login</button>
            
            <button type="button" onClick={handleResetRequest} className="w-full text-blue-600 font-bold text-sm text-center">
              Forgot Password?
            </button>
            
            <button type="button" onClick={handleSignUp} className="w-full text-slate-400 font-bold text-sm text-center pt-2">
              Create New Account
            </button>
          </form>
        ) : (
          <form onSubmit={handlePhoneLogin} className="space-y-4">
            <input type="tel" placeholder="Phone (e.g. 919876543210)" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={showOtp} className="w-full p-4 rounded-2xl border border-slate-200 font-bold" />
            {showOtp && <input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-4 rounded-2xl border border-slate-200 font-bold" />}
            <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-lg">{showOtp ? 'Verify OTP' : 'Send OTP Code'}</button>
          </form>
        )}
      </div>
    </div>
  );
}