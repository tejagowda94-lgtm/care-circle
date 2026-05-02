"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ChildDashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [waterTotal, setWaterTotal] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      const { data: logsData } = await supabase.from('meal_logs').select('*').order('created_at', { ascending: false });
      const { data: waterData } = await supabase.from('water_logs').select('glasses').eq('created_at', new Date().toISOString().split('T')[0]);
      if (logsData) setLogs(logsData);
      if (waterData) setWaterTotal(waterData.length);
    };
    fetchAll();

    // SOS LISTENER WITH TYPES
    const sosSub = supabase.channel('sos-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emergency_alerts' }, (payload) => {
        const { location_lat, location_long, alert_type } = payload.new;
        const mapUrl = `https://www.google.com/maps?q=${location_lat},${location_long}`;
        alert(`🚨 ${alert_type?.toUpperCase()} EMERGENCY! Dad needs help. Opening location...`);
        window.open(mapUrl, '_blank');
      }).subscribe();

    return () => { supabase.removeChannel(sosSub); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24">
      <header className="mb-8 text-center"><h1 className="text-3xl font-extrabold text-slate-800">CareCircle Hub 🌍</h1></header>

      {/* AI INSIGHT CARD */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-[2rem] text-white shadow-xl mb-8">
        <p className="font-medium leading-relaxed">✨ Dad has completed <b>{Math.round((waterTotal/8)*100)}%</b> of his water goal today. Health status is stable.</p>
      </div>

      {/* QUICK CALL EMERGENCY GRID */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button onClick={() => window.open('tel:100')} className="bg-blue-900 text-white p-4 rounded-3xl font-bold flex flex-col items-center shadow-lg">
          <span>CALL POLICE</span>
          <span className="text-2xl">🚔</span>
        </button>
        <button onClick={() => window.open('tel:102')} className="bg-emerald-700 text-white p-4 rounded-3xl font-bold flex flex-col items-center shadow-lg">
          <span>CALL DOCTOR</span>
          <span className="text-2xl">🩺</span>
        </button>
      </div>

      {/* ACTIVITY FEED */}
      <h2 className="text-lg font-black text-slate-800 mb-4 px-2 uppercase tracking-tighter">Activity Feed</h2>
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center space-x-4">
             <span className="text-3xl">{log.meal_name.includes('water') ? '💧' : '🍛'}</span>
             <div>
                <p className="font-bold text-slate-800 leading-tight">{log.meal_name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(log.created_at).toLocaleTimeString()}</p>
             </div>
          </div>
        ))}
      </div>

      <button onClick={() => window.location.href = '/logout'} className="w-full mt-8 text-slate-400 font-bold text-xs">Logout 🚪</button>
    </div>
  );
}