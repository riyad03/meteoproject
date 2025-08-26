package com.dgm.notificationservice;

import com.dgm.notificationservice.service.NotificationService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import io.micrometer.core.instrument.config.validate.Validated;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.security.Key;
import java.util.Date;

@SpringBootApplication
public class NotificationserviceApplication implements CommandLineRunner {
	@Value("${jwt.secret}")
	String SECRET_KEY;
	@Autowired
	public NotificationService notificationService;
	boolean test=false;
	@Autowired
	NotificationService notificationservice;
	public String generateToken(String username) {
		long expirationTimeMs = 1000 * 60 * 60; // 1 hour
		Key secretKey = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

		return Jwts.builder()
				.setSubject(username)
				.setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + expirationTimeMs))
				.signWith(secretKey,SignatureAlgorithm.HS256)
				.compact();

	}

	public static void main(String[] args) {

		SpringApplication.run(NotificationserviceApplication.class, args);

	}
	@Override
	public void run(String... args) throws Exception {
		System.err.println("Generated JWT: " + generateToken("riyad"));
		System.out.println(notificationService.isUserConnected("riyad"));
		    

	}

}
