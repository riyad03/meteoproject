package com.dgm.notificationservice.listener;

import com.dgm.notificationservice.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.util.Queue;

@Component
public class WebSocketEventListener implements ApplicationListener<SessionConnectedEvent> {
    @Autowired
    private NotificationService notificationService;

    @Override
    public void onApplicationEvent(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = accessor.getUser();
        if (user != null) {
            String userName = user.getName();
            System.out.println("userName Connected: " + userName);

            // Flush queued notifications here
            /*
            Queue<String> userQueue = notificationService.getPendingNotifications(userName);
            while (userQueue != null && !userQueue.isEmpty()) {
                notificationService.sendMessage(userName, userQueue.poll());
            }
            notificationService.clearPendingNotifications(userName);*/
        }
    }
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        System.out.println("=== SessionConnectedEvent triggered ===");
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        String userName = null;

        // First, try from accessor.getUser()
        if (accessor.getUser() != null) {
            userName = accessor.getUser().getName();
            System.out.println("Got username from accessor.getUser(): " + userName);
        }

        // Then, fallback to session attributes only if they exist
        if (userName == null && accessor.getSessionAttributes() != null) {
            userName = (String) accessor.getSessionAttributes().get("username");
            System.out.println("Got username from session attributes: " + userName);
        }

        if (userName != null) {
            System.out.println("userName Connected: " + userName);
            notificationService.userConnected(userName);
            //notificationService.sendMessage(userName, "test");
        } else {
            System.out.println("SessionConnectedEvent: No username found");
        }
    }


    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event){
        StompHeaderAccessor accessor=StompHeaderAccessor.wrap(event.getMessage());
        if(accessor.getUser()!=null){
            System.out.println("userName Disconnected: "+accessor.getUser().getName());
            notificationService.userDisconnect(accessor.getUser().getName());
        }
    }

}
