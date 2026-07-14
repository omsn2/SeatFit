package com.seatfit.repository;

import com.seatfit.entity.OtpRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpRequestRepository extends JpaRepository<OtpRequest, UUID> {

    @Query("SELECT o FROM OtpRequest o WHERE o.phone = :phone AND o.isUsed = false AND o.expiresAt > :now ORDER BY o.createdAt DESC")
    Optional<OtpRequest> findLatestValid(String phone, OffsetDateTime now);

    @Query("SELECT COUNT(o) FROM OtpRequest o WHERE o.phone = :phone AND o.createdAt > :since")
    long countRequestsSince(String phone, OffsetDateTime since);

    @Modifying
    @Query("UPDATE OtpRequest o SET o.isUsed = true WHERE o.phone = :phone AND o.isUsed = false")
    void invalidateAllForPhone(String phone);

    @Modifying
    @Query("DELETE FROM OtpRequest o WHERE o.expiresAt < :cutoff")
    void deleteExpired(OffsetDateTime cutoff);
}
