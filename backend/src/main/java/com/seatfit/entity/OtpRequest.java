package com.seatfit.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "otp_requests",
       indexes = {
           @Index(name = "idx_otp_phone",   columnList = "phone"),
           @Index(name = "idx_otp_expires", columnList = "expires_at")
       })
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String otpHash;

    @Column(nullable = false)
    private OffsetDateTime expiresAt;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isUsed = false;

    @Column(nullable = false)
    @Builder.Default
    private Integer attemptNo = 1;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();
}
