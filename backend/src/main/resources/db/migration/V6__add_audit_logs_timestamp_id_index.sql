CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp_id_desc
    ON audit_logs (timestamp DESC, id DESC);
