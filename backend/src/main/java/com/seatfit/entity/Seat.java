package com.seatfit.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "seats",
       uniqueConstraints = @UniqueConstraint(columnNames = {"centre_id", "label"}),
       indexes = @Index(name = "idx_seats_centre", columnList = "centre_id"))
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "centre_id", nullable = false)
    @JsonIgnore   // never serialize the back-reference — avoids LazyInitializationException
    private Centre centre;

    // Transient field populated by the availability query result
    @Transient
    @Builder.Default
    private String availability = "available";

    @Column(nullable = false, length = 20)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SeatType seatType = SeatType.standard;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SeatStatus status = SeatStatus.available;

    @Column(nullable = false)
    private Integer rowNumber;

    @Column(nullable = false)
    private Integer colNumber;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public enum SeatType { standard, window, corner, private_ }
    public enum SeatStatus { available, blocked, removed }
}
