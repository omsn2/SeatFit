package com.seatfit.repository;

import com.seatfit.entity.Centre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CentreRepository extends JpaRepository<Centre, UUID> {

    /**
     * Eager-fetch shifts + pricingPlans in one query.
     * Works because the collections are now Set<> (not List<>),
     * which avoids Hibernate's MultipleBagFetchException.
     */
    @Query("""
        SELECT DISTINCT c FROM Centre c
        LEFT JOIN FETCH c.shifts
        LEFT JOIN FETCH c.pricingPlans
        WHERE c.isActive = true
        """)
    List<Centre> findActiveCentresWithDetails();

    @Query("""
        SELECT c FROM Centre c
        LEFT JOIN FETCH c.shifts
        LEFT JOIN FETCH c.pricingPlans
        WHERE c.id = :id
        """)
    Optional<Centre> findByIdWithDetails(@Param("id") UUID id);
}
