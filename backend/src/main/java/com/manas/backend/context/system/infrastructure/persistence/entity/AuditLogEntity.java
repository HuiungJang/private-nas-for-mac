package com.manas.backend.context.system.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
public class AuditLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String targetResource;

    private String traceId;

    private String ipAddress;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(nullable = false)
    private String status;

    public AuditLogEntity(UUID userId, String action, String targetResource, String traceId, String ipAddress,
            Instant timestamp, String status) {
        this.userId = userId;
        this.action = action;
        this.targetResource = targetResource;
        this.traceId = traceId;
        this.ipAddress = ipAddress;
        this.timestamp = timestamp;
        this.status = status;
    }

}
