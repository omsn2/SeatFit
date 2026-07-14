package com.seatfit.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments",
       indexes = {
           @Index(name = "idx_payments_booking", columnList = "booking_id"),
           @Index(name = "idx_payments_status",  columnList = "status")
       })
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PaymentMethod method;

    @Column(length = 100)
    private String razorpayOrderId;

    @Column(length = 100)
    private String razorpayPaymentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.created;

    private OffsetDateTime paidAt;
    private OffsetDateTime refundedAt;

    @Column(precision = 10, scale = 2)
    private BigDecimal refundAmount;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @UpdateTimestamp
    private OffsetDateTime updatedAt;

    public enum PaymentMethod { upi, card, netbanking, wallet, cash, waived }
    public enum PaymentStatus { created, captured, failed, refunded }
}
