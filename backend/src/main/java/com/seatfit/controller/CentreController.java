package com.seatfit.controller;

import com.seatfit.entity.Centre;
import com.seatfit.entity.Seat;
import com.seatfit.entity.Shift;
import com.seatfit.entity.PricingPlan;
import com.seatfit.exception.SeatFitException;
import com.seatfit.repository.CentreRepository;
import com.seatfit.repository.SeatRepository;
import com.seatfit.repository.ShiftRepository;
import com.seatfit.repository.PricingPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Public centre endpoints — no auth required.
 * Used by both guests (browsing) and logged-in members.
 */
@RestController
@RequestMapping("/centres")
@RequiredArgsConstructor
public class CentreController {

    private final CentreRepository centreRepository;
    private final SeatRepository seatRepository;
    private final ShiftRepository shiftRepository;
    private final PricingPlanRepository pricingPlanRepository;

    @GetMapping
    public ResponseEntity<List<Centre>> listCentres() {
        return ResponseEntity.ok(centreRepository.findActiveCentresWithDetails());
    }

    @GetMapping("/{centreId}")
    public ResponseEntity<Centre> getCentre(@PathVariable UUID centreId) {
        return ResponseEntity.ok(
                centreRepository.findByIdWithDetails(centreId)
                        .orElseThrow(() -> new SeatFitException("Centre not found")));
    }

    @GetMapping("/{centreId}/shifts")
    public ResponseEntity<List<Shift>> getShifts(@PathVariable UUID centreId) {
        return ResponseEntity.ok(
                shiftRepository.findByCentreIdAndIsActiveTrueOrderByStartTimeAsc(centreId));
    }

    @GetMapping("/{centreId}/pricing")
    public ResponseEntity<List<PricingPlan>> getPricing(@PathVariable UUID centreId) {
        return ResponseEntity.ok(
                pricingPlanRepository.findByCentreIdAndIsActiveTrueOrderByPriceAsc(centreId));
    }

    /** Seat availability map for a given shift+date */
    @GetMapping("/{centreId}/seats")
    public ResponseEntity<List<Seat>> getSeatMap(
            @PathVariable UUID centreId,
            @RequestParam UUID shiftId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(
                seatRepository.findByCentreWithAvailability(centreId, shiftId, date));
    }
}
