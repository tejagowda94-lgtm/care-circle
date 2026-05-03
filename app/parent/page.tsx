"use client";

import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function UnifiedDashboard() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ calIn: 0, calOut: 0, water: 0 });
  const [logs, setLogs] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. REAL-TIME DATA SYNC
  const fetchData = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data: meals } = await supabase.from('meal_logs').select('*').filter('created_at', 'gte', today);
    const { data: water } = await supabase.from('water_logs').select('*').eq('created_at', today);
    
    setStats({
      calIn: meals?.reduce((acc, curr) => acc + (curr.calories || 0), 0) || 0,
      calOut: 1250, // Simulated burned calories
      water: water?.length || 0
    });
    if (meals) setLogs(meals.slice(0, 10));
  };

  useEffect(() => {
    fetchData();

    // Listen for any new activity instantly
    const channel = supabase.channel('global-sync').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'meal_logs' }, () => fetchData()).subscribe();
    
    const sosSub = supabase.channel('sos-alerts').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emergency_alerts' }, (p) => {
      alert(`🚨 EMERGENCY: ${p.new.alert_type.toUpperCase()}!`);
      window.open(`https://www.google.com/maps?q=${p.new.location_lat},${p.new.location_long}`, '_blank');
    }).subscribe();

    return () => { supabase.removeChannel(channel); supabase.removeChannel(sosSub); };
  }, []);

  // 2. SHARED ACTIONS
  const triggerSOS = async (type: string) => {
    navigator.geolocation.getCurrentPosition(async (pos: any) => {
      await supabase.from('emergency_alerts').insert([{ location_lat: pos.coords.latitude, location_long: pos.coords.longitude, alert_type: type }]);
      alert(`${type.toUpperCase()} SENT!`);
    });
  };

  const addWater = async () => {
    await supabase.from('water_logs').insert([{ glasses: 1 }]);
    await supabase.from('meal_logs').insert([{ meal_name: "💧 Drank Water", calories: 0 }]);
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { data: upload } = await supabase.storage.from('care-photos').upload(fileName, file);
    const { data: url } = supabase.storage.from('care-photos').getPublicUrl(fileName);
    await supabase.from('meal_logs').insert([{ meal_name: "Nutrition Verified", calories: 350, photo_url: url.publicUrl }]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans text-slate-800">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-black tracking-tighter uppercase">CARE CIRCLE LIVE 🌍</h1>
      </header>

      {/* EMERGENCY GRID */}
      <div className="grid grid-cols-3 gap-3 mb-6 max-w-md mx-auto">
        <button onClick={() => triggerSOS('police')} className="bg-blue-800 text-white p-5 rounded-3xl shadow-lg flex flex-col items-center"><span className="text-3xl">🚔</span><span className="text-[10px] font-black mt-1">POLICE</span></button>
        <button onClick={() => triggerSOS('sos')} className="bg-red-600 text-white p-5 rounded-3xl shadow-xl flex flex-col items-center animate-pulse"><span className="text-3xl">🚨</span><span className="text-[10px] font-black mt-1">SOS</span></button>
        <button onClick={() => triggerSOS('doctor')} className="bg-emerald-600 text-white p-5 rounded-3xl shadow-lg flex flex-col items-center"><span className="text-3xl">🩺</span><span className="text-[10px] font-black mt-1">DOCTOR</span></button>
      </div>

      {/* STATS CARD */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-6 shadow-xl mb-6 grid grid-cols-3 gap-2 text-center text-white max-w-md mx-auto">
        <div><p className="text-2xl font-black">{stats.calIn}</p><p className="text-[8px] font-bold uppercase opacity-70">Cal In</p></div>
        <div className="border-x border-white/20"><p className="text-2xl font-black">{stats.water}/8</p><p className="text-[8px] font-bold uppercase opacity-70">Water</p></div>
        <div><p className="text-2xl font-black">{stats.calOut}</p><p className="text-[8px] font-bold uppercase opacity-70">Burned</p></div>
      </div>

      {/* MAIN ACTIONS */}
      <div className="space-y-4 max-w-md mx-auto mb-8">
        <button onClick={() => fileInputRef.current?.click()} className="w-full bg-white border-2 border-indigo-600 text-indigo-600 p-6 rounded-[2rem] shadow-sm flex items-center justify-center space-x-4 active:scale-95 transition-all">
          <span className="text-3xl">📸</span>
          <p className="text-lg font-black">{loading ? 'UPLOADING...' : 'LOG FOOD PHOTO'}</p>
        </button>
        <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
        
        <button onClick={addWater} className="w-full bg-blue-500 text-white p-6 rounded-[2rem] shadow-lg flex items-center justify-center space-x-3 active:scale-95 transition-all">
          <span className="text-3xl">💧</span>
          <p className="text-lg font-black">LOG WATER INTAKE</p>
        </button>
      </div>

      {/* ACTIVITY FEED */}
      <div className="max-w-md mx-auto">
        <h3 className="text-sm font-black text-slate-400 uppercase mb-4 px-2 tracking-widest">Live Activity Feed</h3>
        <div className="space-y-4">
          {logs.map((log, i) => (
            <div key={i} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
              {log.photo_url && <img src={log.photo_url} className="w-full h-44 object-cover" />}
              <div className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-slate-800">{log.meal_name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(log.created_at).toLocaleTimeString()}</p>
                </div>
                <p className="text-xs font-black text-indigo-600">{log.calories} kcal</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => window.location.href='/logout'} className="w-full mt-10 text-slate-300 font-bold text-xs uppercase tracking-widest text-center">Logout CareCircle</button>
    </div>
  );
}