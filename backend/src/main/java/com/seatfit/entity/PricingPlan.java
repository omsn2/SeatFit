package com.seatfit.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "pricing_plans",
       indexes = @Index(name = "idx_pricing_centre", columnList = "centre_id"))
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PricingPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "centre_id", nullable = false)
    @JsonIgnoreProperties({"seats","shifts","pricingPlans","users"})
    private Centre centre;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PlanType planType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    public enum PlanType { per_shift, daily, weekly, monthly }
}
