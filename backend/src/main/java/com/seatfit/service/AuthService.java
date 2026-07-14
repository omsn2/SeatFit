package com.seatfit.service;

import com.seatfit.entity.OtpRequest;
import com.seatfit.entity.User;
import com.seatfit.exception.RateLimitException;
import com.seatfit.exception.SeatFitException;
import com.seatfit.repository.OtpRequestRepository;
import com.seatfit.repository.UserRepository;
import com.seatfit.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final OtpRequestRepository otpRequestRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${otp.expiry-minutes:10}")
    private int otpExpiryMinutes;

    @Value("${otp.max-attempts:3}")
    private int maxAttempts;

    @Value("${otp.rate-limit-per-hour:3}")
    private int rateLimitPerHour;

    @Value("${otp.dev-mode:true}")
    private boolean devMode;

    /**
     * Step 1 — send OTP.
     * In dev mode, OTP is always "123456". In prod, send via MSG91/Twilio.
     */
    @Transactional
    public void sendOtp(String phone) {
        // Rate-limit: max 3 OTPs per phone per hour
        OffsetDateTime oneHourAgo = OffsetDateTime.now().minusHours(1);
        long recentCount = otpRequestRepository.countRequestsSince(phone, oneHourAgo);
        if (recentCount >= rateLimitPerHour) {
            throw new RateLimitException("Too many OTP requests. Try again in an hour.");
        }

        String otp = devMode ? "123456" : generateOtp();
        String hash = hashOtp(otp);

        otpRequestRepository.invalidateAllForPhone(phone);   // invalidate old OTPs

        OtpRequest request = OtpRequest.builder()
                .phone(phone)
                .otpHash(hash)
                .expiresAt(OffsetDateTime.now().plusMinutes(otpExpiryMinutes))
                .attemptNo((int) recentCount + 1)
                .build();
        otpRequestRepository.save(request);

        if (devMode) {
            log.info("[DEV] OTP for {}: {}", phone, otp);
        } else {
            // TODO: Integrate MSG91 / Twilio here
            log.info("OTP sent to {}", phone);
        }
    }

    /**
     * Step 2 — verify OTP and return JWT tokens.
     * Creates the user if they don't exist yet (phone = identity).
     */
    @Transactional
    public Map<String, String> verifyOtp(String phone, String otp, String name) {
        OtpRequest otpRequest = otpRequestRepository
                .findLatestValid(phone, OffsetDateTime.now())
                .orElseThrow(() -> new SeatFitException("OTP expired or not found"));

        if (!checkOtp(otp, otpRequest.getOtpHash())) {
            throw new SeatFitException("Invalid OTP");
        }

        otpRequest.setIsUsed(true);
        otpRequestRepository.save(otpRequest);

        // Upsert user
        User user = userRepository.findByPhone(phone).orElseGet(() -> {
            User newUser = User.builder()
                    .phone(phone)
                    .name(name != null ? name : "User")
                    .build();
            return userRepository.save(newUser);
        });

        String accessToken  = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getRole().name(),
                user.getCentre() != null ? user.getCentre().getId() : null);

        String refreshToken = jwtTokenProvider.generateRefreshToken(
                user.getId(), user.getRole().name(),
                user.getCentre() != null ? user.getCentre().getId() : null);

        return Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "userId", user.getId().toString(),
                "role", user.getRole().name()
        );
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    private String hashOtp(String otp) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return Base64.getEncoder().encodeToString(md.digest(otp.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash OTP", e);
        }
    }

    private boolean checkOtp(String plainOtp, String hash) {
        return hashOtp(plainOtp).equals(hash);
    }
}
