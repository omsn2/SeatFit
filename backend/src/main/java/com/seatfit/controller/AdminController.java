package com.seatfit.controller;

import com.seatfit.entity.Booking;
import com.seatfit.entity.Centre;
import com.seatfit.entity.Seat;
import com.seatfit.entity.Shift;
import com.seatfit.repository.CentreRepository;
import com.seatfit.repository.SeatRepository;
import com.seatfit.repository.ShiftRepository;
import com.seatfit.security.SeatFitUserPrincipal;
import com.seatfit.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasAnyRole('CENTRE_ADMIN','SUPER_ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final BookingService bookingService;
    private final CentreRepository centreRepository;
    private final SeatRepository seatRepository;
    private final ShiftRepository shiftRepository;

    /** Dashboard overview for today */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard(
            @AuthenticationPrincipal SeatFitUserPrincipal principal) {

        UUID centreId      = principal.getCentreId();
        LocalDate today    = LocalDate.now();
        BigDecimal revenue = bookingService.getTodayRevenue(centreId);
        Centre centre      = centreRepository.findById(centreId).orElseThrow();

        List<Shift> shifts = shiftRepository.findByCentreIdAndIsActiveTrueOrderByStartTimeAsc(centreId);
        long totalSeats    = centre.getTotalSeats();

        return ResponseEntity.ok(Map.of(
                "date",       today,
                "centreId",   centreId,
                "centreName", centre.getName(),
                "totalSeats", totalSeats,
                "revenue",    revenue,
                "shifts",     shifts
        ));
    }

    /** All bookings for this centre — paginated, searchable */
    @GetMapping("/bookings")
    public ResponseEntity<Page<Booking>> getCentreBookings(
            @AuthenticationPrincipal SeatFitUserPrincipal principal,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<Booking> result = bookingService.getCentreBookings(
                principal.getCentreId(),
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(result);
    }

    /** Cancel any booking as admin */
    @PatchMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<Booking> cancelBooking(
            @AuthenticationPrincipal SeatFitUserPrincipal principal,
            @PathVariable UUID bookingId) {
        return ResponseEntity.ok(
                bookingService.cancelBooking(bookingId, principal.getUserId(), true));
    }

    /** Walk-in booking (cash) */
    @PostMapping("/bookings/walk-in")
    public ResponseEntity<Booking> walkInBooking(
            @AuthenticationPrincipal SeatFitUserPrincipal principal,
            @RequestBody BookingController.CreateBookingRequest req) {

        Booking booking = bookingService.createBooking(
                principal.getUserId(),
                req.getSeatId(), req.getShiftId(), req.getCentreId(),
                req.getPricingPlanId(), req.getDate(), true, req.getNotes()
        );
        return ResponseEntity.ok(booking);
    }

    /** Block / unblock a seat */
    @PatchMapping("/seats/{seatId}/status")
    public ResponseEntity<Seat> setSeatStatus(
            @PathVariable UUID seatId,
            @RequestParam Seat.SeatStatus status) {

        Seat seat = seatRepository.findById(seatId).orElseThrow();
        seat.setStatus(status);
        return ResponseEntity.ok(seatRepository.save(seat));
    }

    /** Seat map for a specific date+shift (admin view) */
    @GetMapping("/seats")
    public ResponseEntity<List<Seat>> seatMap(
            @AuthenticationPrincipal SeatFitUserPrincipal principal,
            @RequestParam UUID shiftId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(
                seatRepository.findByCentreWithAvailability(principal.getCentreId(), shiftId, date));
    }

    /** QR check-in */
    @GetMapping("/checkin/{qrCode}")
    public ResponseEntity<Booking> checkIn(@PathVariable String qrCode) {
        return ResponseEntity.ok(bookingService.getByQrCode(qrCode));
    }
}
