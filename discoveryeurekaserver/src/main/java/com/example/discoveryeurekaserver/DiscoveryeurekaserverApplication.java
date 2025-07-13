package com.example.discoveryeurekaserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class DiscoveryeurekaserverApplication {

	public static void main(String[] args) {
		SpringApplication.run(DiscoveryeurekaserverApplication.class, args);
	}

}
