import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { WebSocket } from 'ws';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const data = JSON.parse(body);

    const { title, message, companyId } = data;

    const notification = db.prepare(`
      INSERT INTO notifications (id, title, message, company_id)
      VALUES (@id, @title, @message, @companyId)
      RETURNING *
    `).get({
      id: crypto.randomUUID(),
      title,
      message,
      companyId,
    });

    // Broadcast the notification through WebSocket
    const wsMessage = JSON.stringify({
      type: 'notification',
      companyId,
      data: notification,
    });

    // Send to WebSocket server
    const ws = new WebSocket(`${process.env.WEBSOCKET_URL || 'ws://localhost:3001'}?companyId=${companyId}`);
    
    ws.onopen = () => {
      ws.send(wsMessage);
      ws.close();
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const notifications = db.prepare(`
      SELECT * FROM notifications
      WHERE company_id = ?
      ORDER BY created_at DESC
    `).all(companyId);

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}