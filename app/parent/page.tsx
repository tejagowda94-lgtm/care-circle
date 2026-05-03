"use client";

import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ParentDashboard() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ calIn: 0, calOut: 0, water: 0 });
  const [logs, setLogs] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data: meals } = await supabase.from('meal_logs').select('calories').filter('created_at', 'gte', today);
      const { data: exercise } = await supabase.from('exercise_logs').select('calories_burned').filter('created_at', 'gte', today);
      const { data: water } = await supabase.from('water_logs').select('glasses').eq('created_at', today);
      
      setStats({
        calIn: meals?.reduce((acc, curr) => acc + curr.calories, 0) || 0,
        calOut: exercise?.reduce((acc, curr) => acc + curr.calories_burned, 0) || 0,
        water: water?.length || 0
      });
      
      const { data: recent } = await supabase.from('meal_logs').select('*').order('created_at', { ascending: false }).limit(5);
      if (recent) setLogs(recent);
    };
    fetchData();
  }, []);

  const triggerSOS = async (type: string) => {
    navigator.geolocation.getCurrentPosition(async (pos: any) => {
      await supabase.from('emergency_alerts').insert([{ 
        location_lat: pos.coords.latitude, location_long: pos.coords.longitude, alert_type: type 
      }]);
      alert(`🚨 ${type.toUpperCase()} ALERT SENT TO FAMILY!`);
    });
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { data: upload } = await supabase.storage.from('care-photos').upload(fileName, file);
    const { data: url } = supabase.storage.from('care-photos').getPublicUrl(fileName);
    
    // Simulate AI Nutrition Data for now
    await supabase.from('meal_logs').insert([{ 
      meal_name: "Logged Meal", calories: 350, protein: 20, carbs: 45, fats: 10, photo_url: url.publicUrl 
    }]);
    
    window.location.reload(); // Refresh to show new data
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans text-slate-800">
      {/* 1. EMERGENCY GRID */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button onClick={() => triggerSOS('police')} className="bg-blue-700 text-white p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center">
          <span className="text-2xl">🚔</span>
          <span className="text-[10px] font-black mt-1">POLICE</span>
        </button>
        <button onClick={() => triggerSOS('general')} className="bg-red-600 text-white p-4 rounded-2xl shadow-xl flex flex-col items-center justify-center animate-pulse">
          <span className="text-2xl">🚨</span>
          <span className="text-[10px] font-black mt-1">SOS</span>
        </button>
        <button onClick={() => triggerSOS('doctor')} className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center">
          <span className="text-2xl">🩺</span>
          <span className="text-[10px] font-black mt-1">DOCTOR</span>
        </button>
      </div>

      {/* 2. STATS OVERVIEW */}
      <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 mb-6 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-2xl font-black text-orange-500">{stats.calIn}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Calories In</p>
        </div>
        <div className="border-x border-slate-100">
          <p className="text-2xl font-black text-blue-500">{stats.water}/8</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Water</p>
        </div>
        <div>
          <p className="text-2xl font-black text-emerald-500">{stats.calOut}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Burned</p>
        </div>
      </div>

      {/* 3. CAMERA BUTTON */}
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="w-full bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-xl mb-6 flex items-center justify-center space-x-4 active:scale-95 transition-all"
      >
        <span className="text-4xl">📸</span>
        <div className="text-left">
          <p className="text-xl font-black">CLICK FOOD PHOTO</p>
          <p className="text-xs opacity-80 font-bold uppercase tracking-widest">Auto-track Nutrition</p>
        </div>
      </button>
      <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

      {/* 4. RECENT ACTIVITY */}
      <div className="w-full">
        <h3 className="text-sm font-black text-slate-400 uppercase mb-4 px-2">Today's History</h3>
        <div className="space-y-3">
          {logs.map((log, i) => (
            <div key={i} className="bg-white p-4 rounded-3xl shadow-sm flex items-center space-x-4 border-l-4 border-indigo-500">
              <span className="text-2xl">{log.meal_name.includes('Water') ? '💧' : '🍲'}</span>
              <div className="flex-1">
                <p className="font-bold">{log.meal_name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(log.created_at).toLocaleTimeString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-400">{log.calories} kcal</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => window.location.href='/logout'} className="mt-10 text-slate-300 font-bold text-sm">LOGOUT CARECIRCLE</button>
    </div>
  );
}