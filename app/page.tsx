"use client";
import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      {/* App Logo/Icon */}
      <div className="bg-green-100 p-6 rounded-full mb-6">
        <span className="text-6xl">🌍</span>
      </div>

      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
        CareCircle AI
      </h1>
      <p className="text-xl text-gray-600 mb-10 max-w-md">
        Bridging the distance between you and your family's health.
      </p>

      <div className="flex flex-col space-y-4 w-full max-w-sm">
        <Link href="/parent" className="bg-green-600 text-white py-4 px-8 rounded-2xl text-xl font-bold shadow-lg hover:bg-green-700 transition-all">
          I am a Parent 👴
        </Link>
        
        <Link href="/child" className="bg-blue-600 text-white py-4 px-8 rounded-2xl text-xl font-bold shadow-lg hover:bg-blue-700 transition-all">
          I am a Child Abroad ✈️
        </Link>
      </div>

      <p className="mt-12 text-sm text-gray-400 italic">
        "Peace of mind, one notification at a time."
      </p>
    </div>
  );
}