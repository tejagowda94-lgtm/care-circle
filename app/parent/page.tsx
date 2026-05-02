"use client";

import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ParentDashboard() {
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('en'); 
  const [waterCount, setWaterCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Today's Water
  useEffect(() => {
    const fetchWater = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase.from('water_logs').select('glasses').eq('created_at', today);
      if (data) setWaterCount(data.length);
    };
    fetchWater();
  }, []);

  // 2. Translations
  const content: any = {
    en: { welcome: "Hello, Dad!", water: "Daily Water Goal", addWater: "+ DRINK WATER 💧", steps: "Steps Today", sos: "EMERGENCY SOS 🚨", voice: "SEND VOICE NOTE 🎙️" },
    hi: { welcome: "नमस्ते पिताजी!", water: "पानी का लक्ष्य", addWater: "+ पानी पिएं 💧", steps: "आज के कदम", sos: "आपातकालीन SOS 🚨", voice: "वॉयस नोट भेजें 🎙️" },
    te: { welcome: "నమస్తే నాన్న!", water: "నీటి లక్ష్యం", addWater: "+ నీళ్లు తాగండి 💧", steps: "నేటి అడుగులు", sos: "అత్యవసర SOS 🚨", voice: "వాయిస్ నోట్ పంపండి 🎙️" }
  };

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
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center pb-24 text-slate-800">
      
      {/* LANGUAGE SELECTOR */}
      <div className="flex space-x-2 mb-6 w-full max-w-md">
        {['en', 'hi', 'te'].map((l) => (
          <button key={l} onClick={() => setLang(l)} className={`flex-1 py-2 rounded-xl font-bold ${lang === l ? 'bg-blue-600 text-white' : 'bg-white shadow-sm'}`}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* EMERGENCY SOS */}
      <button onClick={triggerSOS} className="w-full max-w-md bg-red-600 text-white p-8 rounded-[2.5rem] shadow-2xl mb-8 animate-pulse font-black text-3xl">
        {content[lang].sos}
      </button>

      {/* WATER PROGRESS */}
      <div className="w-full max-w-md bg-white p-6 rounded-[2rem] shadow-sm mb-6 border-b-8 border-blue-400">
        <h3 className="text-xl font-bold mb-2">{content[lang].water}</h3>
        <div className="w-full bg-blue-50 h-6 rounded-full overflow-hidden mb-4">
          <div className="bg-blue-500 h-full transition-all" style={{ width: `${(waterCount / 8) * 100}%` }}></div>
        </div>
        <p className="font-bold text-blue-600 mb-4 text-center">{waterCount} / 8 Glasses</p>
        <button onClick={addWater} className="bg-blue-500 text-white w-full py-4 rounded-2xl font-black text-xl shadow-lg">{content[lang].addWater}</button>
      </div>

      {/* STEP COUNTER (Simulated for now) */}
      <div className="w-full max-w-md bg-white p-6 rounded-[2rem] shadow-sm mb-6 flex items-center justify-between border-b-8 border-orange-400">
        <div>
          <p className="text-slate-400 font-bold uppercase text-xs">{content[lang].steps}</p>
          <h2 className="text-4xl font-black">1,250</h2>
        </div>
        <span className="text-5xl">🚶‍♂️</span>
      </div>

      {/* VOICE NOTE */}
      <button onClick={() => alert("Voice Recording Started")} className="w-full max-w-md bg-purple-600 text-white p-8 rounded-[2rem] shadow-xl font-black text-xl flex items-center justify-center space-x-3">
        <span>{content[lang].voice}</span>
      </button>

      <button onClick={() => window.location.href = '/logout'} className="mt-8 text-slate-400 font-bold text-sm">Logout 🚪</button>
    </div>
  );
}