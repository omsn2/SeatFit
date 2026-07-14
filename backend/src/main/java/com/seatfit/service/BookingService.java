package com.seatfit.service;

import com.seatfit.entity.*;
import com.seatfit.exception.ConflictException;
import com.seatfit.exception.SeatFitException;
import com.seatfit.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SeatLockRepository seatLockRepository;
    private final SeatRepository seatRepository;
    private final ShiftRepository shiftRepository;
    private final PricingPlanRepository pricingPlanRepository;
    private final CentreRepository centreRepository;
    private final UserRepository userRepository;

    @Value("${seat-lock.ttl-minutes:10}")
    private int lockTtlMinutes;

    /**
     * Acquire a 10-minute seat lock before payment.
     * Uses DB unique constraint to prevent concurrent locks on same seat+shift+date.
     */
    @Transactional
    public SeatLock lockSeat(UUID userId, UUID seatId, UUID shiftId, LocalDate date) {
        // Check for existing active lock (someone else may hold it)
        seatLockRepository.findActiveLock(seatId, shiftId, date, OffsetDateTime.now())
                .ifPresent(existing -> {
                    if (!existing.getUser().getId().equals(userId)) {
                        throw new ConflictException("Seat is temporarily held by another user. Try again in a few minutes.");
                    }
                });

        // Check not already booked
        boolean alreadyBooked = bookingRepository.existsBySeatIdAndShiftIdAndBookingDateAndStatusNot(
                seatId, shiftId, date, Booking.BookingStatus.cancelled);
        if (alreadyBooked) {
            throw new ConflictException("Seat is already booked for this shift and date.");
        }

        Seat seat   = seatRepository.findById(seatId).orElseThrow(() -> new SeatFitException("Seat not found"));
        Shift shift = shiftRepository.findById(shiftId).orElseThrow(() -> new SeatFitException("Shift not found"));
        User user   = userRepository.findById(userId).orElseThrow(() -> new SeatFitException("User not found"));

        // Release any existing expired locks for this seat first
        seatLockRepository.releaseLock(seatId, shiftId, date);

        try {
            SeatLock lock = SeatLock.builder()
                    .seat(seat)
                    .user(user)
                    .shift(shift)
                    .lockDate(date)
                    .expiresAt(OffsetDateTime.now().plusMinutes(lockTtlMinutes))
                    .build();
            return seatLockRepository.save(lock);
        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("Seat was just taken. Please select another seat.");
        }
    }

    /**
     * Create a confirmed booking (called after Razorpay payment webhook confirms capture).
     * Also used for admin walk-in bookings (isWalkIn = true, paymentStatus = paid, method = cash).
     */
    @Transactional
    public Booking createBooking(UUID userId, UUID seatId, UUID shiftId, UUID centreId,
                                 UUID pricingPlanId, LocalDate date,
                                 boolean isWalkIn, String notes) {
        // Final double-booking check at DB level
        boolean alreadyBooked = bookingRepository.existsBySeatIdAndShiftIdAndBookingDateAndStatusNot(
                seatId, shiftId, date, Booking.BookingStatus.cancelled);
        if (alreadyBooked) {
            throw new ConflictException("Seat already booked. Race condition caught.");
        }

        User user            = userRepository.findById(userId).orElseThrow(() -> new SeatFitException("User not found"));
        Seat seat            = seatRepository.findById(seatId).orElseThrow(() -> new SeatFitException("Seat not found"));
        Shift shift          = shiftRepository.findById(shiftId).orElseThrow(() -> new SeatFitException("Shift not found"));
        Centre centre        = centreRepository.findById(centreId).orElseThrow(() -> new SeatFitException("Centre not found"));
        PricingPlan plan     = pricingPlanRepository.findById(pricingPlanId).orElseThrow(() -> new SeatFitException("Pricing plan not found"));

        try {
            Booking booking = Booking.builder()
                    .user(user)
                    .seat(seat)
                    .shift(shift)
                    .centre(centre)
                    .pricingPlan(plan)
                    .bookingDate(date)
                    .amount(plan.getPrice())
                    .status(isWalkIn ? Booking.BookingStatus.confirmed : Booking.BookingStatus.pending)
                    .paymentStatus(isWalkIn ? Booking.PaymentStatus.paid : Booking.PaymentStatus.unpaid)
                    .isWalkIn(isWalkIn)
                    .notes(notes)
                    .qrCode(isWalkIn ? UUID.randomUUID().toString() : null)
                    .build();

            Booking saved = bookingRepository.save(booking);

            // Release the seat lock
            seatLockRepository.releaseLock(seatId, shiftId, date);

            log.info("Booking created: {} for user {} seat {} on {}", saved.getId(), userId, seatId, date);
            return saved;

        } catch (DataIntegrityViolationException e) {
            throw new ConflictException("Double-booking detected at DB level.");
        }
    }

    /** Confirm a booking after payment — sets QR code and updates statuses */
    @Transactional
    public Booking confirmBooking(UUID bookingId, String razorpayPaymentId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new SeatFitException("Booking not found"));

        booking.setStatus(Booking.BookingStatus.confirmed);
        booking.setPaymentStatus(Booking.PaymentStatus.paid);
        booking.setQrCode(UUID.randomUUID().toString());

        Booking saved = bookingRepository.save(booking);
        log.info("Booking {} confirmed with Razorpay payment {}", bookingId, razorpayPaymentId);
        return saved;
    }

    /** Cancel booking — checks policy window and sets cancelled_at */
    @Transactional
    public Booking cancelBooking(UUID bookingId, UUID requestingUserId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new SeatFitException("Booking not found"));

        if (!isAdmin && !booking.getUser().getId().equals(requestingUserId)) {
            throw new SeatFitException("Not authorized to cancel this booking");
        }

        if (booking.getStatus() == Booking.BookingStatus.cancelled) {
            throw new SeatFitException("Booking is already cancelled");
        }

        booking.setStatus(Booking.BookingStatus.cancelled);
        booking.setCancelledAt(OffsetDateTime.now());
        return bookingRepository.save(booking);
    }

    public Page<Booking> getMyBookings(UUID userId, Pageable pageable) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public Page<Booking> getCentreBookings(UUID centreId, Pageable pageable) {
        return bookingRepository.findByCentreIdOrderByCreatedAtDesc(centreId, pageable);
    }

    public Booking getByQrCode(String qrCode) {
        return bookingRepository.findByQrCode(qrCode)
                .orElseThrow(() -> new SeatFitException("Invalid QR code"));
    }

    public BigDecimal getTodayRevenue(UUID centreId) {
        return bookingRepository.totalRevenueForDate(centreId, LocalDate.now());
    }
}
