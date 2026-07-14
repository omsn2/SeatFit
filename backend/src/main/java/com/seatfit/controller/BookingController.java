package com.seatfit.controller;

import com.seatfit.entity.Booking;
import com.seatfit.entity.SeatLock;
import com.seatfit.exception.SeatFitException;
import com.seatfit.repository.BookingRepository;
import com.seatfit.security.SeatFitUserPrincipal;
import com.seatfit.service.BookingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;

    /** Lock a seat for 10 minutes before payment */
    @PostMapping("/lock")
    public ResponseEntity<Map<String, Object>> lockSeat(
            @AuthenticationPrincipal SeatFitUserPrincipal principal,
            @Valid @RequestBody LockRequest req) {

        SeatLock lock = bookingService.lockSeat(
                principal.getUserId(), req.getSeatId(), req.getShiftId(), req.getDate());

        return ResponseEntity.ok(Map.of(
                "lockId",    lock.getId(),
                "expiresAt", lock.getExpiresAt()
        ));
    }

    /** Create a new booking (for walk-in admin bookings) */
    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @AuthenticationPrincipal SeatFitUserPrincipal principal,
            @Valid @RequestBody CreateBookingRequest req) {

        Booking booking = bookingService.createBooking(
                principal.getUserId(),
                req.getSeatId(), req.getShiftId(), req.getCentreId(),
                req.getPricingPlanId(), req.getDate(),
                req.isWalkIn(), req.getNotes()
        );
        return ResponseEntity.ok(booking);
    }

    /** My bookings — paginated */
    @GetMapping("/my")
    public ResponseEntity<Page<Booking>> getMyBookings(
            @AuthenticationPrincipal SeatFitUserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<Booking> result = bookingService.getMyBookings(
                principal.getUserId(),
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(result);
    }

    /** Cancel a booking */
    @PatchMapping("/{bookingId}/cancel")
    public ResponseEntity<Booking> cancelBooking(
            @AuthenticationPrincipal SeatFitUserPrincipal principal,
            @PathVariable UUID bookingId) {

        Booking cancelled = bookingService.cancelBooking(bookingId, principal.getUserId(), false);
        return ResponseEntity.ok(cancelled);
    }

    /** Get booking by ID (owner or admin only) */
    @GetMapping("/{bookingId}")
    public ResponseEntity<Booking> getBooking(
            @AuthenticationPrincipal SeatFitUserPrincipal principal,
            @PathVariable UUID bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new SeatFitException("Booking not found"));
        return ResponseEntity.ok(booking);
    }

    /** QR check-in lookup */
    @GetMapping("/qr/{qrCode}")
    public ResponseEntity<Booking> getByQrCode(@PathVariable String qrCode) {
        return ResponseEntity.ok(bookingService.getByQrCode(qrCode));
    }

    // ── Inner DTOs ────────────────────────────────────────────────────────

    @Data
    public static class LockRequest {
        @NotNull private UUID seatId;
        @NotNull private UUID shiftId;
        @NotNull @FutureOrPresent private LocalDate date;
    }

    @Data
    public static class CreateBookingRequest {
        @NotNull private UUID seatId;
        @NotNull private UUID shiftId;
        @NotNull private UUID centreId;
        @NotNull private UUID pricingPlanId;
        @NotNull @FutureOrPresent private LocalDate date;
        private boolean walkIn;
        private String notes;
    }
}
