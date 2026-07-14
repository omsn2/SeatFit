package com.seatfit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SeatFitApplication {
    public static void main(String[] args) {
        SpringApplication.run(SeatFitApplication.class, args);
    }
}
