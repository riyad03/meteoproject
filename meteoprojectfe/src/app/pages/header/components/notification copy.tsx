import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';

const NotificationClient: React.FC = () => {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const clientRef = useRef<Client | null>(null);

  const token =
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyaXlhZCIsImlhdCI6MTc1NjE1NzM1MiwiZXhwIjoxNzU2MTYwOTUyfQ.YPP20VZkXaWBDFdC21EaayjnyXXhdSHJ7X353U8bA2w';

  useEffect(() => {
    console.log('Initializing WebSocket connection...');
    setConnectionStatus('Connecting...');

    const stompClient = new Client({
      brokerURL: 'ws://localhost:8086/ws-notifications', // direct websocket (no SockJS)
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
      onConnect: (frame) => {
        console.log('✅ Connected to WebSocket:', frame);
        setConnected(true);
        setConnectionStatus('Connected');

        // Subscribe to personal queue
        stompClient.subscribe('/user/queue/notify', (message) => {
          console.log('📩 Received notification:', message.body);
          setNotifications((prev) => [...prev, message.body]);
        });

        // Optionally subscribe to broadcast
        stompClient.subscribe('/topic/notifications', (message) => {
          console.log('📢 Broadcast message:', message.body);
          setNotifications((prev) => [...prev, message.body]);
        });
      },
      onDisconnect: () => {
        console.log('❌ Disconnected from WebSocket');
        setConnected(false);
        setConnectionStatus('Disconnected');
      },
      onStompError: (frame) => {
        console.error('🚨 STOMP Error:', frame);
        setConnectionStatus('Error: ' + frame.headers['message']);
      },
      onWebSocketError: (event) => {
        console.error('🌐 WebSocket Error:', event);
        setConnectionStatus('WebSocket Error');
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    clientRef.current = stompClient;
    stompClient.activate();

    return () => {
      console.log('Cleaning up WebSocket connection');
      clientRef.current?.deactivate();
    };
  }, [token]);

  const sendTest = async () => {
    await fetch('http://localhost:8086/api/notify/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify('hello message'),
    });
  };

  return (
    <div className="p-4 absolute bg-gray-100 rounded right-[95px]">
      {connected ? (
        <div>
          <div className="mb-4">
            <button
              onClick={sendTest}
              className="ml-4 px-3 py-1 bg-blue-500 text-white rounded"
            >
              Send Test
            </button>
          </div>
          <div>
            {notifications.map((msg, i) => (
              <div key={i} className="p-2 mb-2">
                {msg}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>No connection ({connectionStatus})</div>
      )}
    </div>
  );
};

export default NotificationClient;
