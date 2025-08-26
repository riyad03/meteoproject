package com.dgm.notificationservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationService {
    private final SimpMessagingTemplate messagingTemplate;
    private ConcurrentHashMap<String, Queue<String>> pendingNotifications = new ConcurrentHashMap<>();
    private ConcurrentHashMap<String, Boolean> users = new ConcurrentHashMap<>(); // Changed to ConcurrentHashMap

    @Autowired
    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public synchronized void sendMessage(String username, String message) {
        System.out.println("Attempting to send message to: " + username + ", message: " + message);

        // Always queue the message first
        pendingNotifications.computeIfAbsent(username, key -> new LinkedList<>()).add(message);

        // If user is online, send immediately and remove from queue
        if (users.containsKey(username) && users.get(username)) {
            try {
                messagingTemplate.convertAndSendToUser(username, "/queue/notify", message);
                System.out.println("Successfully sent message to " + username + ": " + message);

                // Remove the message from queue since it was sent successfully
                Queue<String> userQueue = pendingNotifications.get(username);
                if (userQueue != null && !userQueue.isEmpty()) {
                    userQueue.poll(); // Remove the message we just sent
                }
            } catch (Exception e) {
                System.err.println("Failed to send message to " + username + ": " + e.getMessage());
            }
        } else {
            System.out.println("User " + username + " is offline, message queued");
        }
    }

    public synchronized void userConnected(String userName) {
        System.out.println("User connecting: " + userName);
        users.put(userName, true);

        // Send all pending notifications
        Queue<String> userQueue = pendingNotifications.get(userName);
        if (userQueue != null && !userQueue.isEmpty()) {
            System.out.println("Sending " + userQueue.size() + " pending messages to " + userName);

            while (!userQueue.isEmpty()) {
                String pendingMessage = userQueue.poll();
                try {
                    messagingTemplate.convertAndSendToUser(userName, "/queue/notify", pendingMessage);
                    System.out.println("Sent pending message to " + userName + ": " + pendingMessage);
                } catch (Exception e) {
                    System.err.println("Failed to send pending message to " + userName + ": " + e.getMessage());
                    // Re-add to queue if sending failed
                    userQueue.offer(pendingMessage);
                    break;
                }
            }

            // Remove empty queue
            if (userQueue.isEmpty()) {
                pendingNotifications.remove(userName);
            }
        }

        System.out.println("User " + userName + " is now online and ready to receive messages");
    }

    public boolean isUserConnected(String username) {
        return users.containsKey(username) && users.get(username);
    }

    public synchronized void userDisconnect(String userName) {
        System.out.println("User disconnecting: " + userName);
        users.put(userName, false);
    }
}