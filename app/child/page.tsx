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
      const { data: exercise } = await supabase.from('exercise_logs').select('calories_burned').filter('created_at', 'gte', today);
      const { data: water } = await supabase.from('water_logs').select('glasses').eq('created_at', today);
      
      setStats({
        calIn: meals?.reduce((acc, curr) => acc + curr.calories, 0) || 0,
        calOut: exercise?.reduce((acc, curr) => acc + curr.calories_burned, 0) || 0,
        water: water?.length || 0
      });
      if (meals) setLogs(meals);
    };
    fetchData();

    // SOS LISTENER
    const sosSub = supabase.channel('sos-alerts').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emergency_alerts' }, (payload) => {
      const mapUrl = `https://www.google.com/maps?q=${payload.new.location_lat},${payload.new.location_long}`;
      alert(`🚨 DAD NEEDS A ${payload.new.alert_type.toUpperCase()}! Opening Map...`);
      window.open(mapUrl, '_blank');
    }).subscribe();

    return () => { supabase.removeChannel(sosSub); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-black text-slate-800">DAD'S LIVE HEALTH 🌍</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Synced with India</p>
      </header>

      {/* 1. DAD'S REAL-TIME STATS (Same as Parent) */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-6 shadow-xl mb-6 grid grid-cols-3 gap-2 text-center text-white">
        <div><p className="text-2xl font-black">{stats.calIn}</p><p className="text-[8px] font-bold uppercase opacity-70">Cal In</p></div>
        <div className="border-x border-white/20"><p className="text-2xl font-black">{stats.water}/8</p><p className="text-[8px] font-bold uppercase opacity-70">Water</p></div>
        <div><p className="text-2xl font-black">{stats.calOut}</p><p className="text-[8px] font-bold uppercase opacity-70">Burned</p></div>
      </div>

      {/* 2. EMERGENCY CONTACT GRID */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button onClick={() => window.open('tel:100')} className="bg-white border-2 border-blue-800 text-blue-800 p-4 rounded-3xl font-black flex flex-col items-center">
          <span className="text-2xl">🚔</span>
          <span className="text-xs">POLICE INDIA</span>
        </button>
        <button onClick={() => window.open('tel:102')} className="bg-white border-2 border-emerald-700 text-emerald-700 p-4 rounded-3xl font-black flex flex-col items-center">
          <span className="text-2xl">🩺</span>
          <span className="text-xs">AMBULANCE</span>
        </button>
      </div>

      {/* 3. ACTIVITY FEED WITH PHOTOS */}
      <h3 className="text-sm font-black text-slate-400 uppercase mb-4 px-2">Live Verification Feed</h3>
      <div className="space-y-4">
        {logs.map((log, i) => (
          <div key={i} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
            {log.photo_url && <img src={log.photo_url} className="w-full h-40 object-cover" />}
            <div className="p-4 flex items-center justify-between">
               <div>
                  <p className="font-bold text-slate-800">{log.meal_name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(log.created_at).toLocaleTimeString()}</p>
               </div>
               <div className="text-right">
                  <p className="text-xs font-black text-indigo-600">{log.calories} kcal</p>
                  <p className="text-[8px] text-slate-400">P:{log.protein} C:{log.carbs} F:{log.fats}</p>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}