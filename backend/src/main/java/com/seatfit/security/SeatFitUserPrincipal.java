package com.seatfit.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

/**
 * Holds the authenticated user's identity — placed in the SecurityContext.
 * Avoids a DB hit on every request; all data came from the trusted JWT.
 */
@Getter
@AllArgsConstructor
public class SeatFitUserPrincipal {
    private final UUID userId;
    private final String role;
    private final UUID centreId;   // null for members; set for centre_admin
}
