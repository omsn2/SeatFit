package com.seatfit.repository;

import com.seatfit.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    /** Check if a seat is already booked for a given shift+date (non-cancelled bookings) */
    boolean existsBySeatIdAndShiftIdAndBookingDateAndStatusNot(
        UUID seatId, UUID shiftId, LocalDate date, Booking.BookingStatus status
    );

    /** List bookings for a user, newest first */
    Page<Booking> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    /** List all bookings for a centre (admin view) */
    Page<Booking> findByCentreIdOrderByCreatedAtDesc(UUID centreId, Pageable pageable);

    /** Bookings for a centre on a specific date */
    List<Booking> findByCentreIdAndBookingDate(UUID centreId, LocalDate date);

    /** Look up by QR code for check-in */
    Optional<Booking> findByQrCode(String qrCode);

    /** Revenue summary: total confirmed+paid amount for a centre on a date */
    @Query("""
        SELECT COALESCE(SUM(b.amount), 0)
        FROM Booking b
        WHERE b.centre.id = :centreId
          AND b.bookingDate = :date
          AND b.paymentStatus = 'paid'
        """)
    BigDecimal totalRevenueForDate(UUID centreId, LocalDate date);

    /** Count of available bookable seats for a centre/shift/date (admin dashboard) */
    @Query("""
        SELECT COUNT(b) FROM Booking b
        WHERE b.centre.id = :centreId
          AND b.shift.id = :shiftId
          AND b.bookingDate = :date
          AND b.status NOT IN ('cancelled')
        """)
    long countBookedSeats(UUID centreId, UUID shiftId, LocalDate date);
}
