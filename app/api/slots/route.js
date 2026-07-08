import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date'); // Formato: YYYY-MM-DD
    
    if (!dateStr) {
      return NextResponse.json({ error: 'Falta el parámetro date' }, { status: 400 });
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Fecha inválida' }, { status: 400 });
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Mismo cálculo que el script.js para cubrir zonas horarias de España
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');
    const prevDay = String(prevDate.getDate()).padStart(2, '0');

    const rangeStart = `${prevYear}-${prevMonth}-${prevDay}T22:00:00.000Z`;
    const rangeEnd = `${year}-${month}-${day}T22:00:00.000Z`;

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[Slots API] Credenciales de Supabase no configuradas en el servidor');
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    const url = `${supabaseUrl}/rest/v1/xtech_booked_slots` +
      `?select=booking_slot,booking_date` +
      `&booking_date=gte.${encodeURIComponent(rangeStart)}` +
      `&booking_date=lt.${encodeURIComponent(rangeEnd)}` +
      `&order=booking_date.asc`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      },
      next: { revalidate: 0 } // Desactivar caché para ver actualizaciones de reservas en tiempo real
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('[Slots API] Error de Supabase:', res.status, errBody);
      return NextResponse.json([], { status: 200 }); // Retornar vacío como fallback seguro
    }

    const rows = await res.json();
    const slots = rows.map(r => r.booking_slot).filter(Boolean);
    
    return NextResponse.json(slots);

  } catch (error) {
    console.error('[Slots API] Error inesperado:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
