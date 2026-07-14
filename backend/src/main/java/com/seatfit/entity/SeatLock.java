package com.seatfit.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "seat_locks",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_seat_lock",
           columnNames = {"seat_id", "shift_id", "lock_date"}
       ),
       indexes = {
           @Index(name = "idx_seat_locks_expires", columnList = "expires_at"),
           @Index(name = "idx_seat_locks_seat",    columnList = "seat_id, shift_id, lock_date")
       })
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatLock {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", nullable = false)
    private Seat seat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id", nullable = false)
    private Shift shift;

    @Column(nullable = false)
    private LocalDate lockDate;

    @Column(nullable = false)
    private OffsetDateTime expiresAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
