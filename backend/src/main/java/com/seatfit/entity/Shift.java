package com.seatfit.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "shifts",
       indexes = @Index(name = "idx_shifts_centre", columnList = "centre_id"))
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shift {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "centre_id", nullable = false)
    @JsonIgnoreProperties({"seats","shifts","pricingPlans","users"})
    private Centre centre;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ShiftType shiftType;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public enum ShiftType { morning, evening, full_day, night, custom }
}
