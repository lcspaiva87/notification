'use client';

import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function Home() {
  const [companyId, setCompanyId] = useState('company1');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const { notifications, sendNotification } = useNotifications(companyId);

  useWebSocket(companyId, (data) => {
    if (data.type === 'notification') {
      // Trate a notificação recebida
      console.log('Nova notificação:', data);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendNotification(title, message);
      setTitle('');
      setMessage('');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Toaster />

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Company Notifications</h1>
        <select
          className="w-full p-2 border rounded"
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
        >
          <option value="company1">Company 1</option>
          <option value="company2">Company 2</option>
          <option value="company3">Company 3</option>
        </select>
      </div>

      <Card className="p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Send Notification</Button>
        </form>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
        {Array.isArray(notifications) && notifications.map((notification) => (
          <Card key={notification.id} className="p-4">
            <div className="flex items-start gap-4">
              <Bell className="w-5 h-5 mt-1" />
              <div>
                <h3 className="font-semibold">{notification.title}</h3>
                <p className="text-gray-600">{notification.message}</p>
                <p className="text-sm text-gray-400 mt-2">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}