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
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800">CareCircle Hub 🌍</h1>
      </header>

      {/* AI INSIGHT CARD */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-[2rem] text-white shadow-xl mb-8">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-2xl">✨</span>
          <h3 className="font-black uppercase text-sm tracking-widest">AI Health Insight</h3>
        </div>
        <p className="font-medium text-blue-50 leading-relaxed">
          Dad is doing great today! He has hit <b>{Math.round((waterTotal/8)*100)}%</b> of his water goal. His activity is consistent, but don't forget to check if he took his 4 PM meds.
        </p>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl shadow-sm text-center border-b-4 border-blue-400">
          <p className="text-4xl mb-1">💧</p>
          <p className="text-2xl font-black text-slate-800">{waterTotal}/8</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Glasses</p>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-sm text-center border-b-4 border-orange-400">
          <p className="text-4xl mb-1">🚶‍♂️</p>
          <p className="text-2xl font-black text-slate-800">1,250</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Steps</p>
        </div>
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
    </div>
  );
}