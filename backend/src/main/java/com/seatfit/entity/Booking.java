package com.seatfit.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "bookings",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_booking_seat_shift_date",
           columnNames = {"seat_id", "shift_id", "booking_date"}
       ),
       indexes = {
           @Index(name = "idx_bookings_user",       columnList = "user_id"),
           @Index(name = "idx_bookings_centre",     columnList = "centre_id"),
           @Index(name = "idx_bookings_date",       columnList = "booking_date"),
           @Index(name = "idx_bookings_status",     columnList = "status"),
           @Index(name = "idx_bookings_seat_shift", columnList = "seat_id, shift_id, booking_date")
       })
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"bookings","seatLocks","centre"})
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false)
    @JsonIgnoreProperties({"bookings","seatLocks","centre"})
    private Seat seat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "centre_id", nullable = false)
    @JsonIgnoreProperties({"seats","shifts","pricingPlans","users","bookings"})
    private Centre centre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id", nullable = false)
    @JsonIgnoreProperties({"bookings","centre"})
    private Shift shift;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pricing_plan_id", nullable = false)
    @JsonIgnoreProperties({"bookings","centre"})
    private PricingPlan pricingPlan;

    @Column(nullable = false)
    private LocalDate bookingDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BookingStatus status = BookingStatus.pending;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.unpaid;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(unique = true, length = 100)
    private String qrCode;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isWalkIn = false;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @UpdateTimestamp
    private OffsetDateTime updatedAt;

    private OffsetDateTime cancelledAt;

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Payment payment;

    public enum BookingStatus  { pending, confirmed, cancelled, completed, no_show }
    public enum PaymentStatus  { unpaid, paid, refunded, failed }
}
