"use client";

import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ParentDashboard() {
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('en'); // Default language is English
  const fileInputRef = useRef(null);
  const [currentMeal, setCurrentMeal] = useState(null);

  // 1. AUTH CHECK: Ensure Dad is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/login'; 
      }
    };
    checkUser();
  }, []);

  // 2. TRANSLATION DICTIONARY
  const content = {
    en: { welcome: "Hello, Dad!", meal: "I Ate My Meal", med: "Take Medicine", water: "Drink Water", okay: "I'm Okay", sos: "EMERGENCY SOS 🚨", uploading: "Uploading...", tap: "Tap to take a photo" },
    hi: { welcome: "नमस्ते पिताजी!", meal: "मैंने खाना खा लिया", med: "दवा लें", water: "पानी पिएं", okay: "मैं ठीक हूँ", sos: "आपातकालीन SOS 🚨", uploading: "अपलोड हो रहा है...", tap: "फोटो लेने के लिए टैप करें" },
    te: { welcome: "నమస్తే నాన్న!", meal: "నేను భోజనం చేసాను", med: "మందులు వేసుకోండి", water: "నీళ్లు తాగండి", okay: "నేను బాగున్నాను", sos: "అత్యవసర SOS 🚨", uploading: "అప్‌లోడ్ అవుతోంది...", tap: "ఫోటో తీయడానికి నొక్కండి" }
  };

  // 3. LOGGING LOGIC (Triggers Camera)
  const startLogging = (meal) => {
    setCurrentMeal(meal);
    fileInputRef.current.click(); 
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const fileName = `${Date.now()}-${file.name}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('care-photos')
      .upload(fileName, file);

    if (uploadError) {
      alert("Error: " + uploadError.message);
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('care-photos').getPublicUrl(fileName);

    // Save Log to Database
    await supabase.from('meal_logs').insert([
      { meal_name: currentMeal.title, photo_url: urlData.publicUrl }
    ]);

    alert("✅ Sent to family!");
    setLoading(false);
  };

  // 4. SOS EMERGENCY LOGIC
  const triggerSOS = async () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { error } = await supabase.from('emergency_alerts').insert([
        { location_lat: pos.coords.latitude, location_long: pos.coords.longitude }
      ]);
      if (!error) alert("🚨 SOS SENT! Family notified.");
    });
  };

  const actions = [
    { title: content[lang].meal, key: 'meal', icon: "🍛", color: "bg-green-500" },
    { title: content[lang].med, key: 'med', icon: "💊", color: "bg-blue-500" },
    { title: content[lang].water, key: 'water', icon: "💧", color: "bg-cyan-500" },
    { title: content[lang].okay, key: 'okay', icon: "😊", color: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      
      {/* LANGUAGE TOGGLE */}
      <div className="flex space-x-3 mb-6 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-full max-w-md">
        {['en', 'hi', 'te'].map((l) => (
          <button 
            key={l} 
            onClick={() => setLang(l)} 
            className={`flex-1 py-2 rounded-xl font-bold transition-all ${lang === l ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
          >
            {l === 'en' ? 'ENG' : l === 'hi' ? 'हिंदी' : 'తెలుగు'}
          </button>
        ))}
      </div>

      {/* SOS BUTTON */}
      <button 
        onClick={triggerSOS}
        className="w-full max-w-md bg-red-600 text-white p-8 rounded-[2.5rem] shadow-2xl mb-8 animate-pulse font-black text-3xl"
      >
        {content[lang].sos}
      </button>

      <h1 className="text-4xl font-bold mb-10 text-slate-800 text-center">{content[lang].welcome}</h1>

      {/* HIDDEN CAMERA INPUT */}
      <input 
        type="file" accept="image/*" capture="environment" 
        ref={fileInputRef} onChange={handleFileChange} className="hidden" 
      />

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-1 gap-6 w-full max-w-md">
        {actions.map((item) => (
          <button
            key={item.key}
            disabled={loading}
            onClick={() => startLogging({title: item.title})}
            className={`${item.color} ${loading ? 'opacity-50' : ''} text-white p-8 rounded-3xl shadow-lg flex items-center justify-between transition-all active:scale-95`}
          >
            <div className="text-left">
              <h2 className="text-2xl font-bold">{item.title}</h2>
              <p className="text-sm font-medium opacity-80">{loading ? content[lang].uploading : content[lang].tap}</p>
            </div>
            <span className="text-5xl">{item.icon}</span>
          </button>
        ))}
      </div>

      {/* LOGOUT */}
      <div className="mt-12 text-center pb-12">
        <button 
          onClick={() => window.location.href = '/logout'}
          className="text-slate-400 font-bold text-sm hover:text-red-500 transition-colors"
        >
          Logout from CareCircle 🚪
        </button>
      </div>
    </div>
  );
}