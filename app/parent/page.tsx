"use client";

import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ParentDashboard() {
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('en'); 
  const [waterCount, setWaterCount] = useState(0);
  const [logs, setLogs] = useState<any[]>([]);

  // 1. Fetch Today's Data
  useEffect(() => {
    const fetchData = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data: waterData } = await supabase.from('water_logs').select('glasses').eq('created_at', today);
      if (waterData) setWaterCount(waterData.length);

      const { data: activityData } = await supabase.from('meal_logs').select('*').order('created_at', { ascending: false }).limit(5);
      if (activityData) setLogs(activityData);
    };
    fetchData();
  }, []);

  // 2. Translations
  const content: any = {
    en: { welcome: "Hello, Dad!", water: "Daily Water Goal", addWater: "+ DRINK WATER 💧", steps: "Steps Today", sos: "EMERGENCY SOS 🚨", voice: "SEND VOICE NOTE 🎙️", history: "Your Activity", police: "POLICE", doctor: "DOCTOR" },
    hi: { welcome: "नमस्ते पिताजी!", water: "पानी का लक्ष्य", addWater: "+ पानी पिएं 💧", steps: "आज के कदम", sos: "आपातकालीन SOS 🚨", voice: "वॉयस नोट भेजें 🎙️", history: "आपकी गतिविधि", police: "पुलिस", doctor: "डॉक्टर" },
    te: { welcome: "నమస్తే నాన్న!", water: "నీటి లక్ష్యం", addWater: "+ నీళ్లు తాగండి 💧", steps: "నేటి అడుగులు", sos: "అత్యవసర SOS 🚨", voice: "వాయిస్ నోట్ పంపండి 🎙️", history: "మీ కార్యకలాపాలు", police: "పోలీసు", doctor: "డాక్టర్" }
  };

  const addWater = async () => {
    setWaterCount(prev => prev + 1);
    await supabase.from('water_logs').insert([{ glasses: 1 }]);
    const newLog = { meal_name: "💧 Drank water", created_at: new Date().toISOString() };
    setLogs([newLog, ...logs]);
    await supabase.from('meal_logs').insert([newLog]);
  };

  const triggerSOS = async (type: string) => {
    navigator.geolocation.getCurrentPosition(async (pos: any) => {
      await supabase.from('emergency_alerts').insert([
        { 
          location_lat: pos.coords.latitude, 
          location_long: pos.coords.longitude,
          alert_type: type 
        }
      ]);
      alert(`🚨 ${type.toUpperCase()} ALERT SENT!`);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center pb-24 text-slate-800">
      
      {/* LANGUAGE SELECTOR */}
      <div className="flex space-x-2 mb-6 w-full max-w-md">
        {['en', 'hi', 'te'].map((l) => (
          <button key={l} onClick={() => setLang(l)} className={`flex-1 py-2 rounded-xl font-bold ${lang === l ? 'bg-blue-600 text-white' : 'bg-white shadow-sm'}`}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* MAIN EMERGENCY SOS */}
      <button onClick={() => triggerSOS('general')} className="w-full max-w-md bg-red-600 text-white p-8 rounded-[2.5rem] shadow-2xl mb-4 animate-pulse font-black text-3xl">
        {content[lang].sos}
      </button>

      {/* NEW: POLICE & DOCTOR BUTTONS */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-8">
        <button onClick={() => triggerSOS('police')} className="bg-blue-800 text-white p-6 rounded-3xl shadow-xl font-black text-xl flex flex-col items-center">
          <span>{content[lang].police}</span>
          <span className="text-3xl">🚔</span>
        </button>
        <button onClick={() => triggerSOS('doctor')} className="bg-emerald-600 text-white p-6 rounded-3xl shadow-xl font-black text-xl flex flex-col items-center">
          <span>{content[lang].doctor}</span>
          <span className="text-3xl">🩺</span>
        </button>
      </div>

      {/* WATER PROGRESS */}
      <div className="w-full max-w-md bg-white p-6 rounded-[2rem] shadow-sm mb-6 border-b-8 border-blue-400">
        <h3 className="text-xl font-bold mb-2">{content[lang].water}</h3>
        <div className="w-full bg-blue-100 h-6 rounded-full overflow-hidden mb-4">
          <div className="bg-blue-500 h-full transition-all" style={{ width: `${(waterCount / 8) * 100}%` }}></div>
        </div>
        <p className="font-bold text-blue-600 mb-4 text-center">{waterCount} / 8 Glasses</p>
        <button onClick={addWater} className="bg-blue-500 text-white w-full py-4 rounded-2xl font-black text-xl shadow-lg">{content[lang].addWater}</button>
      </div>

      {/* HISTORY FEED */}
      <div className="w-full max-w-md mb-8">
        <h2 className="text-lg font-black uppercase text-slate-400 mb-4 px-2">{content[lang].history}</h2>
        <div className="space-y-3">
          {logs.map((log, index) => (
            <div key={index} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between border-l-4 border-blue-400">
              <p className="font-bold text-slate-700">{log.meal_name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => window.location.href = '/logout'} className="text-slate-400 font-bold text-sm">Logout 🚪</button>
    </div>
  );
}