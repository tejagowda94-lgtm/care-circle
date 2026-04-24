"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ChildDashboard() {
const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. AUTH CHECK: Ensure user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = '/login'; }
    };
    checkUser();
  }, []);

  // 2. DATA & REAL-TIME LISTENERS
  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase.from('meal_logs').select('*').order('created_at', { ascending: false });
      if (data) setLogs(data);
      setLoading(false);
    };
    fetchLogs();

    // LISTEN FOR NEW MEALS/MEDS
    const mealSub = supabase.channel('meal-logs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'meal_logs' }, (payload) => {
        setLogs((prev) => [payload.new, ...prev]);
      }).subscribe();

    // LISTEN FOR EMERGENCY SOS
    const sosSub = supabase.channel('sos-alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'emergency_alerts' }, (payload) => {
        const { location_lat, location_long } = payload.new;
        const mapUrl = `https://www.google.com/maps?q=${location_lat},${location_long}`;
        alert("🚨 EMERGENCY SOS! Dad needs help. Opening location...");
        window.open(mapUrl, '_blank');
      }).subscribe();

    return () => {
      supabase.removeChannel(mealSub);
      supabase.removeChannel(sosSub);
    };
  }, []);

  const getIcon = (name: string) => {
    if (name.toLowerCase().includes('med')) return '💊';
    if (name.toLowerCase().includes('water')) return '💧';
    if (name.toLowerCase().includes('okay')) return '😊';
    return '🍛';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight underline decoration-blue-500">CareCircle Hub 🌍</h1>
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">Global Monitoring Active</p>
      </header>

      <div className="space-y-6 max-w-md mx-auto">
        {loading ? (
          <div className="text-center p-10 text-slate-300 animate-pulse font-bold text-xl text-center">Syncing with India...</div>
        ) : logs.length === 0 ? (
          <div className="text-center p-10 text-slate-400 font-bold text-xl text-center">No activity today.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 transition-all hover:shadow-md">
              
              {/* PHOTO VERIFICATION */}
              {log.photo_url && (
                <div className="w-full h-52 bg-slate-200 overflow-hidden relative">
                  <img src={log.photo_url} alt="Meal" className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase">Verified Photo</div>
                </div>
              )}

              <div className="p-5 flex items-center space-x-4">
                <span className="text-4xl bg-slate-50 p-3 rounded-2xl">{getIcon(log.meal_name)}</span>
                <div className="flex-1">
                  <h3 className="font-extrabold text-slate-800 text-lg">{log.meal_name}</h3>
                  <div className="flex flex-col text-[11px] font-bold text-slate-400 mt-1 uppercase">
                    <span>🇮🇳 India: {new Date(log.created_at).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                    <span>📍 Your Time: {new Date(log.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="fixed bottom-6 left-6 right-6 max-w-md mx-auto space-y-3">
        <button className="bg-red-600 text-white w-full py-5 rounded-[2rem] font-black text-xl shadow-2xl flex items-center justify-center space-x-3">
          <span>CALL DAD NOW 📞</span>
        </button>
        <button 
          onClick={() => window.location.href = '/logout'}
          className="w-full text-slate-400 font-bold text-xs hover:text-red-500 transition-colors"
        >
          Logout from CareCircle 🚪
        </button>
      </div>
    </div>
  );
}