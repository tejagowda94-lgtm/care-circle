import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const body = await request.json();
  const { meal_name, calories, parent_id } = body;

  const { data, error } = await supabase
    .from('meal_logs') // This is the table we created in Step 3 earlier!
    .insert([
      { meal_name, calories, parent_id, is_verified: false }
    ])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Meal Logged!", data });
}