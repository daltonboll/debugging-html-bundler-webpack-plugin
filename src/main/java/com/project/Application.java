package com.project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * The top-level entrypoint for the application.
 */
@SpringBootApplication
public class Application {

	public static void main(String[] args) {
		System.out.println("Our application is running!");
		SpringApplication.run(Application.class, args);
	}
}
