package com.seatfit.repository;

import com.seatfit.entity.SeatLock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SeatLockRepository extends JpaRepository<SeatLock, UUID> {

    @Query("""
        SELECT sl FROM SeatLock sl
        WHERE sl.seat.id = :seatId
          AND sl.shift.id = :shiftId
          AND sl.lockDate = :date
          AND sl.isActive = true
          AND sl.expiresAt > :now
        """)
    Optional<SeatLock> findActiveLock(UUID seatId, UUID shiftId, LocalDate date, OffsetDateTime now);

    @Modifying
    @Query("UPDATE SeatLock sl SET sl.isActive = false WHERE sl.expiresAt <= :now AND sl.isActive = true")
    int expireLocks(OffsetDateTime now);

    @Modifying
    @Query("UPDATE SeatLock sl SET sl.isActive = false WHERE sl.seat.id = :seatId AND sl.shift.id = :shiftId AND sl.lockDate = :date")
    void releaseLock(UUID seatId, UUID shiftId, LocalDate date);
}
