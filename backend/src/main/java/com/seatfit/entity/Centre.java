package com.seatfit.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.*;

@Entity
@Table(name = "centres")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Centre {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false)
    private Integer totalSeats;

    @Column(nullable = false)
    private LocalTime openTime;

    @Column(nullable = false)
    private LocalTime closeTime;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private List<Object> photos = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @UpdateTimestamp
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "centre", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("centre")
    @com.fasterxml.jackson.annotation.JsonIgnore          // 40 seats in every list call is too heavy
    @Builder.Default
    private Set<Seat> seats = new HashSet<>();

    @OneToMany(mappedBy = "centre", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("centre")
    @Builder.Default
    private Set<Shift> shifts = new HashSet<>();

    @OneToMany(mappedBy = "centre", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("centre")
    @Builder.Default
    private Set<PricingPlan> pricingPlans = new HashSet<>();
}
