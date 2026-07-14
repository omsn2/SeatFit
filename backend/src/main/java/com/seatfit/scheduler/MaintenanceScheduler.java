package com.seatfit.scheduler;

import com.seatfit.repository.OtpRequestRepository;
import com.seatfit.repository.SeatLockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

/**
 * Background maintenance jobs.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MaintenanceScheduler {

    private final SeatLockRepository seatLockRepository;
    private final OtpRequestRepository otpRequestRepository;

    /**
     * Expire stale seat locks every minute.
     * This is the fallback mechanism — Redis TTL would handle this in production.
     */
    @Scheduled(fixedRate = 60_000)   // every 60 seconds
    @Transactional
    public void expireSeatLocks() {
        int expired = seatLockRepository.expireLocks(OffsetDateTime.now());
        if (expired > 0) {
            log.info("[Scheduler] Expired {} stale seat locks", expired);
        }
    }

    /**
     * Clean up expired OTP records daily at 3am.
     * Keeps the table lean and avoids stale data accumulation.
     */
    @Scheduled(cron = "0 0 3 * * *")   // 3:00 AM every day
    @Transactional
    public void cleanExpiredOtps() {
        OffsetDateTime cutoff = OffsetDateTime.now().minusDays(1);
        otpRequestRepository.deleteExpired(cutoff);
        log.info("[Scheduler] Cleaned expired OTP records older than {}", cutoff);
    }
}
