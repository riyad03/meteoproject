package com.example.springcloudgateway;

import com.example.springcloudgateway.jwt.JwtUtil;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.actuate.autoconfigure.security.reactive.ReactiveManagementWebSecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.reactive.ReactiveSecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.reactive.ReactiveUserDetailsServiceAutoConfiguration;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication(exclude = {
		ReactiveSecurityAutoConfiguration.class,
		ReactiveUserDetailsServiceAutoConfiguration.class,
		ReactiveManagementWebSecurityAutoConfiguration.class
})
@EnableDiscoveryClient
public class SpringcloudgatewayApplication {

	public static void main(String[] args) {
		String token = JwtUtil.generateToken("riyad");
		System.err.println("Generated Token: " + token);
		SpringApplication.run(SpringcloudgatewayApplication.class, args);
	}

}
