'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  companyId: string;
}

export function useNotifications(companyId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Fetch existing notifications
    fetch(`/api/notifications?companyId=${companyId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch((error) => console.error('Error fetching notifications:', error));

    // Connect to WebSocket
    const websocket = new WebSocket(`ws://localhost:3001?companyId=${companyId}`);

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notification' && data.companyId === companyId) {
        setNotifications((prev) => [data.data, ...prev]);
        toast(data.data.title, {
          description: data.data.message,
        });
      }
    };

    return () => {
      websocket.close();
    };
  }, [companyId]);

  const sendNotification = async (title: string, message: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          message,
          companyId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  };

  return {
    notifications,
    sendNotification,
  };
}