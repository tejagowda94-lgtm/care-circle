"use client";

import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ParentDashboard() {
  const [loading, setLoading] = useState(false);
  const [waterCount, setWaterCount] = useState(0);
  const [steps, setSteps] = useState(1250); // Simulation
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load daily stats
  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase.from('water_logs').select('glasses').eq('created_at', new Date().toISOString().split('T')[0]);
      if (data) setWaterCount(data.length);
    };
    fetchStats();
  }, []);

  const addWater = async () => {
    setWaterCount(prev => prev + 1);
    await supabase.from('water_logs').insert([{ glasses: 1 }]);
    await supabase.from('meal_logs').insert([{ meal_name: "💧 Drank a glass of water", calories: 0 }]);
  };

  const triggerSOS = async () => {
    navigator.geolocation.getCurrentPosition(async (pos: any) => {
      await supabase.from('emergency_alerts').insert([{ location_lat: pos.coords.latitude, location_long: pos.coords.longitude }]);
      alert("🚨 SOS SENT!");
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center pb-24">
      {/* SOS EMERGENCY BUTTON */}
      <button onClick={triggerSOS} className="w-full max-w-md bg-red-600 text-white p-8 rounded-[2.5rem] shadow-2xl mb-8 animate-pulse font-black text-3xl">EMERGENCY SOS 🚨</button>

      {/* WATER PROGRESS BAR */}
      <div className="w-full max-w-md bg-white p-6 rounded-[2rem] shadow-sm mb-6 text-center border-b-8 border-blue-400">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Daily Water Goal</h3>
        <div className="w-full bg-blue-100 h-6 rounded-full overflow-hidden mb-4">
          <div className="bg-blue-500 h-full transition-all" style={{ width: `${(waterCount / 8) * 100}%` }}></div>
        </div>
        <p className="font-bold text-blue-600 mb-4">{waterCount} / 8 Glasses</p>
        <button onClick={addWater} className="bg-blue-500 text-white w-full py-4 rounded-2xl font-black text-xl shadow-lg">+ DRINK WATER 💧</button>
      </div>

      {/* STEP COUNTER CARD */}
      <div className="w-full max-w-md bg-white p-6 rounded-[2rem] shadow-sm mb-6 flex items-center justify-between border-b-8 border-orange-400">
        <div>
          <p className="text-slate-400 font-bold uppercase text-xs">Steps Today</p>
          <h2 className="text-4xl font-black text-slate-800">{steps}</h2>
        </div>
        <span className="text-5xl">🚶‍♂️</span>
      </div>

      {/* VOICE NOTE BUTTON */}
      <button onClick={() => alert("Voice Recording Started (Simulated)")} className="w-full max-w-md bg-purple-600 text-white p-8 rounded-[2rem] shadow-xl mb-6 font-black text-2xl flex items-center justify-center space-x-3">
        <span>SEND VOICE NOTE</span>
        <span>🎙️</span>
      </button>

      {/* LOGOUT */}
      <button onClick={() => window.location.href = '/logout'} className="text-slate-400 font-bold text-sm mt-4">Logout 🚪</button>
    </div>
  );
}