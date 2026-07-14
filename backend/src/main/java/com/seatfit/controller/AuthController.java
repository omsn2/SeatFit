package com.seatfit.controller;

import com.seatfit.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(@Valid @RequestBody SendOtpRequest req) {
        authService.sendOtp(req.getPhone());
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@Valid @RequestBody VerifyOtpRequest req) {
        Map<String, String> tokens = authService.verifyOtp(req.getPhone(), req.getOtp(), req.getName());
        return ResponseEntity.ok(tokens);
    }

    // ── Inner DTOs ────────────────────────────────────────────────────────

    @Data
    public static class SendOtpRequest {
        @NotBlank
        @Pattern(regexp = "^\\+91[6-9]\\d{9}$", message = "Enter a valid Indian mobile number starting with +91")
        private String phone;
    }

    @Data
    public static class VerifyOtpRequest {
        @NotBlank
        private String phone;
        @NotBlank
        @Pattern(regexp = "^\\d{6}$", message = "OTP must be 6 digits")
        private String otp;
        private String name;  // Optional — for new users only
    }
}
