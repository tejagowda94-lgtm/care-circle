"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert(error.message);
    else {
      alert("Password updated successfully!");
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-sm">
        <h1 className="text-2xl font-black text-slate-800 mb-6">New Password</h1>
        <form onSubmit={handleUpdate} className="space-y-4">
          <input 
            type="password" placeholder="Enter new password" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-4 rounded-2xl border border-slate-200 font-bold"
          />
          <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-2xl font-black">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}