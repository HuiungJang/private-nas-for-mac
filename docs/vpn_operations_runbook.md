# VPN Operations Runbook

## 1) Key Rotation (Periodic)
- Recommended cadence: every 90 days (or immediately after suspected compromise).
- Steps:
  1. Open wg-easy admin UI (local-only port).
  2. Revoke old peer keys for target devices.
  3. Generate new peer configuration.
  4. Distribute new QR/`.conf` securely.
  5. Confirm tunnel reconnect from each client.

## 2) Lost/Stolen Device Response
- Objective: revoke access in minutes.
- Steps:
  1. Identify peer name/device in wg-easy.
  2. Revoke peer immediately.
  3. Verify device cannot reconnect.
  4. Rotate high-risk credentials if compromise suspected.
  5. Record incident and timestamp.

## 3) Upgrade Procedure (Pinned Version)
- `WG_EASY_VERSION` is pinned in `.env`.
- Steps:
  1. Review upstream changelog.
  2. Update `WG_EASY_VERSION` explicitly.
  3. `docker-compose pull && docker-compose up -d`.
  4. Validate peer connectivity and admin UI.
  5. Rollback by restoring previous version value if needed.

## 4) VPN Proxy Validation (VPN-only entrypoint)

If you use the VPN-only proxy entrypoint (`nas-vpn-proxy`), validate reachability from inside the VPN namespace:

```bash
bash scripts/check_vpn_proxy.sh
```

Expected:
- `/` -> 200
- `/api/admin/system/health` -> 401/403 (unauth) or 200 (auth)

## 5) Post-Change Validation Checklist
- [ ] UDP 51820 reachable only as intended.
- [ ] 51821 admin UI not publicly exposed.
- [ ] VPN client can access NAS services.
- [ ] Unauthorized client cannot connect.
- [ ] Change record updated.

## 6) Emergency Contacts / Notes
- Keep this section updated with operator-specific procedures.
