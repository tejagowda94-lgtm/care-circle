"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ChildDashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ calIn: 0, calOut: 0, water: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data: meals } = await supabase.from('meal_logs').select('*').filter('created_at', 'gte', today);
      const { data: water } = await supabase.from('water_logs').select('*').eq('created_at', today);
      
      setStats({
        calIn: meals?.reduce((acc, curr) => acc + curr.calories, 0) || 0,
        calOut: 1250,
        water: water?.length || 0
      });
      if (meals) setLogs(meals);
    };
    fetchData();

    const sosSub = supabase.channel('sos-alerts').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emergency_alerts' }, (payload) => {
      const mapUrl = `https://www.google.com/maps?q=${payload.new.location_lat},${payload.new.location_long}`;
      alert(`🚨 DAD NEEDS HELP (${payload.new.alert_type.toUpperCase()})!`);
      window.open(mapUrl, '_blank');
    }).subscribe();

    return () => { supabase.removeChannel(sosSub); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans text-slate-800">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-black text-slate-800 tracking-tighter">DAD'S LIVE STATUS 🌍</h1>
      </header>

      {/* 1. EMERGENCY CALL GRID (MATCHES PARENT SOS) */}
      <div className="grid grid-cols-3 gap-3 mb-6 max-w-md mx-auto">
        <button onClick={() => window.open('tel:100')} className="bg-blue-900 text-white p-5 rounded-3xl shadow-lg flex flex-col items-center"><span className="text-3xl">🚔</span><span className="text-[10px] font-black mt-1 text-center leading-none">CALL POLICE</span></button>
        <button onClick={() => window.open('tel:102')} className="bg-red-700 text-white p-5 rounded-3xl shadow-xl flex flex-col items-center"><span className="text-3xl">🚑</span><span className="text-[10px] font-black mt-1 text-center leading-none">AMBULANCE</span></button>
        <button onClick={() => window.open('tel:102')} className="bg-emerald-800 text-white p-5 rounded-3xl shadow-lg flex flex-col items-center"><span className="text-3xl">🩺</span><span className="text-[10px] font-black mt-1 text-center leading-none">DOCTOR</span></button>
      </div>

      {/* 2. STATS CARD (MATCHES PARENT) */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-6 shadow-xl mb-8 grid grid-cols-3 gap-2 text-center text-white max-w-md mx-auto">
        <div><p className="text-2xl font-black">{stats.calIn}</p><p className="text-[8px] font-bold uppercase opacity-70">Cal In</p></div>
        <div className="border-x border-white/20"><p className="text-2xl font-black">{stats.water}/8</p><p className="text-[8px] font-bold uppercase opacity-70">Water</p></div>
        <div><p className="text-2xl font-black">{stats.calOut}</p><p className="text-[8px] font-bold uppercase opacity-70">Burned</p></div>
      </div>

      {/* 3. ACTIVITY FEED WITH PHOTO PREVIEWS */}
      <h3 className="text-sm font-black text-slate-400 uppercase mb-4 px-2 max-w-md mx-auto">Live Verification Feed</h3>
      <div className="space-y-4 max-w-md mx-auto">
        {logs.map((log, i) => (
          <div key={i} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 transition-all">
            {log.photo_url && <img src={log.photo_url} className="w-full h-44 object-cover" />}
            <div className="p-5 flex items-center justify-between">
               <div>
                  <p className="font-extrabold text-slate-800">{log.meal_name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(log.created_at).toLocaleTimeString()}</p>
               </div>
               <div className="text-right">
                  <p className="text-xs font-black text-indigo-600">{log.calories} kcal</p>
                  <p className="text-[8px] text-slate-400 font-bold">P:{log.protein} C:{log.carbs} F:{log.fats}</p>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}