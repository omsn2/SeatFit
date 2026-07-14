package com.seatfit.repository;

import com.seatfit.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface SeatRepository extends JpaRepository<Seat, UUID> {

    List<Seat> findByCentreIdOrderByRowNumberAscColNumberAsc(UUID centreId);

    /**
     * Returns all seats for a centre annotated with booking status for a given date+shift.
     * Uses LEFT JOIN so unbooked seats still appear.
     */
    @Query("""
        SELECT s FROM Seat s
        LEFT JOIN Booking b ON b.seat = s
            AND b.shift.id = :shiftId
            AND b.bookingDate = :date
            AND b.status NOT IN ('cancelled')
        WHERE s.centre.id = :centreId
        ORDER BY s.rowNumber ASC, s.colNumber ASC
        """)
    List<Seat> findByCentreWithAvailability(UUID centreId, UUID shiftId, LocalDate date);
}
