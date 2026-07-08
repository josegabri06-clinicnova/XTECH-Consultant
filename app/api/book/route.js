import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const payload = await request.json();
    
    // Validación básica
    const { name, email, dateFormatted, slot } = payload;
    if (!name || !email || !dateFormatted || !slot) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const n8nWebhookUrl = process.env.N8N_BOOKING_WEBHOOK_URL;
    if (!n8nWebhookUrl) {
      console.error('[Book API] Webhook de n8n no configurado en el servidor');
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    console.log('[Book API] Reenviando reserva a n8n:', payload);

    // Enviar al webhook de n8n de forma segura
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.warn('[Book API] n8n respondió con error:', response.status);
      return NextResponse.json({ success: false, status: response.status }, { status: 502 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Book API] Error procesando reserva:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
