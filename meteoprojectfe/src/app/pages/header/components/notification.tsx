import React, { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';


const NotificationClient: React.FC = () => {
  const [notifications, setNotifications] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const clientRef = useRef<Client | null>(null);

  // Replace this with a real token
  const token =
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbmFzIiwicm9sZXMiOlsidGVzdCJdLCJpYXQiOjE3NTYxNzIzNzQsImV4cCI6MTc1NjE3NTk3NH0.sOL3Q5nDd8fiN3uCGB8aYu71h1TqwF8Jf3QEXYysrfk';

  useEffect(() => {
    console.log('Initializing WebSocket connection...');
    setConnectionStatus('Connecting...');

    const stompClient = new Client({
      // Attach token in query string for handshake
      brokerURL: `ws://localhost:8086/ws-notifications?token=${token}`,
      debug: (str) => console.log('STOMP Debug:', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        console.log('✅ Connected to WebSocket:', frame);
        setConnected(true);
        setConnectionStatus('Connected');

        // Subscribe to personal queue
        stompClient.subscribe('/user/queue/notify', (message) => {
          const data=JSON.parse(message.body);
          console.log('📩 Received notification:', data.message);
          setNotifications((prev) => [...prev, data.message]);
        });

        // Example broadcast subscription
        stompClient.subscribe('/topic/notifications', (message) => {
          const data=JSON.parse(message.body);
          console.log('📢 Broadcast:', data.message);
          setNotifications((prev) => [...prev,  data.message]);
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
    });

    clientRef.current = stompClient;
    stompClient.activate();

    return () => {
      console.log('Cleaning up WebSocket connection');
      clientRef.current?.deactivate();
    };
  }, [token]);

  const sendTest = async () => {
    try {
      await fetch('http://localhost:8086/api/notify/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify('hello message'),
      });
    } catch (err) {
      console.error('Error sending test notification:', err);
    }
  };

  return (
    <div className="p-4 absolute bg-gray-100 rounded right-[95px]">
      <div className="mb-2 font-bold">
        Status: {connected ? '✅ Connected' : '❌ Disconnected'} ({connectionStatus})
      </div>

      {connected && (
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
            {notifications.length === 0 && <div>No notifications yet.</div>}
            {notifications.map((msg, i) => (
              <div key={i} className="p-2 mb-2 border rounded bg-white">
                {msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {!connected && <div>Attempting connection...</div>}
    </div>
  );
};

export default NotificationClient;
