"use client";

import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ParentDashboard() {
  const [stats, setStats] = useState({ calIn: 0, calOut: 0, water: 0 });
  const [logs, setLogs] = useState<any[]>([]);
  const [lang, setLang] = useState('en');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data: meals } = await supabase.from('meal_logs').select('*').filter('created_at', 'gte', today);
      const { data: water } = await supabase.from('water_logs').select('*').eq('created_at', today);
      
      setStats({
        calIn: meals?.reduce((acc, curr) => acc + curr.calories, 0) || 0,
        calOut: 1250, // Simulated steps/calories burned
        water: water?.length || 0
      });
      if (meals) setLogs(meals.slice(0, 5));
    };
    fetchData();
  }, []);

  const triggerSOS = async (type: string) => {
    navigator.geolocation.getCurrentPosition(async (pos: any) => {
      await supabase.from('emergency_alerts').insert([{ 
        location_lat: pos.coords.latitude, location_long: pos.coords.longitude, alert_type: type 
      }]);
      alert(`🚨 ${type.toUpperCase()} ALERT SENT!`);
    });
  };

  const addWater = async () => {
    await supabase.from('water_logs').insert([{ glasses: 1 }]);
    await supabase.from('meal_logs').insert([{ meal_name: "💧 Drank Water", calories: 0 }]);
    window.location.reload();
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const fileName = `${Date.now()}-${file.name}`;
    const { data: upload } = await supabase.storage.from('care-photos').upload(fileName, file);
    const { data: url } = supabase.storage.from('care-photos').getPublicUrl(fileName);
    await supabase.from('meal_logs').insert([{ 
      meal_name: "Logged Meal", calories: 350, protein: 15, carbs: 40, fats: 10, photo_url: url.publicUrl 
    }]);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans text-slate-800">
      {/* 1. LANGUAGE SELECTOR */}
      <div className="flex space-x-2 mb-6 w-full max-w-md mx-auto">
        {['en', 'hi', 'te'].map((l) => (
          <button key={l} onClick={() => setLang(l)} className={`flex-1 py-2 rounded-xl font-bold ${lang === l ? 'bg-indigo-600 text-white' : 'bg-white shadow-sm'}`}>{l.toUpperCase()}</button>
        ))}
      </div>

      {/* 2. EMERGENCY GRID (SAME AS CHILD) */}
      <div className="grid grid-cols-3 gap-3 mb-6 max-w-md mx-auto">
        <button onClick={() => triggerSOS('police')} className="bg-blue-800 text-white p-5 rounded-3xl shadow-lg flex flex-col items-center"><span className="text-3xl">🚔</span><span className="text-[10px] font-black mt-1">POLICE</span></button>
        <button onClick={() => triggerSOS('general')} className="bg-red-600 text-white p-5 rounded-3xl shadow-xl flex flex-col items-center animate-pulse"><span className="text-3xl">🚨</span><span className="text-[10px] font-black mt-1">SOS</span></button>
        <button onClick={() => triggerSOS('doctor')} className="bg-emerald-600 text-white p-5 rounded-3xl shadow-lg flex flex-col items-center"><span className="text-3xl">🩺</span><span className="text-[10px] font-black mt-1">DOCTOR</span></button>
      </div>

      {/* 3. STATS CARD (SAME AS CHILD) */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 mb-6 grid grid-cols-3 gap-2 text-center max-w-md mx-auto">
        <div><p className="text-2xl font-black text-orange-500">{stats.calIn}</p><p className="text-[10px] font-bold text-slate-400 uppercase">Cal In</p></div>
        <div className="border-x border-slate-100"><p className="text-2xl font-black text-blue-500">{stats.water}/8</p><p className="text-[10px] font-bold text-slate-400 uppercase">Water</p></div>
        <div><p className="text-2xl font-black text-emerald-500">{stats.calOut}</p><p className="text-[10px] font-bold text-slate-400 uppercase">Burned</p></div>
      </div>

      {/* 4. MAIN ACTION: CAMERA & WATER */}
      <div className="space-y-4 max-w-md mx-auto">
        <button onClick={() => fileInputRef.current?.click()} className="w-full bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-xl flex items-center justify-center space-x-4">
          <span className="text-4xl">📸</span>
          <div className="text-left"><p className="text-xl font-black">CLICK FOOD PHOTO</p><p className="text-xs opacity-70">Verify Nutrition</p></div>
        </button>
        <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        
        <button onClick={addWater} className="w-full bg-blue-500 text-white p-6 rounded-[2rem] shadow-lg flex items-center justify-center space-x-3">
          <span className="text-3xl">💧</span>
          <span className="text-xl font-black">DRINK WATER</span>
        </button>
      </div>

      {/* 5. HISTORY FEED */}
      <div className="mt-8 max-w-md mx-auto">
        <h3 className="text-sm font-black text-slate-400 uppercase mb-4 px-2">Your Activity</h3>
        <div className="space-y-3">
          {logs.map((log, i) => (
            <div key={i} className="bg-white p-4 rounded-3xl shadow-sm flex items-center justify-between border-l-4 border-indigo-500">
              <p className="font-bold">{log.meal_name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}