CREATE TABLE audit_logs
(
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID         NOT NULL,
    action          VARCHAR(50)  NOT NULL,
    target_resource VARCHAR(255) NOT NULL,
    trace_id        VARCHAR(36),
    ip_address      VARCHAR(45),
    timestamp       TIMESTAMP    NOT NULL,
    status          VARCHAR(20)  NOT NULL
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs (timestamp);
CREATE INDEX idx_audit_logs_trace_id ON audit_logs (trace_id);
