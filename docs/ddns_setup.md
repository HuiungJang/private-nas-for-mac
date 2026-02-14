# DDNS Setup (for VPN-first Remote Access)

This project expects WireGuard access via `wg-easy`.
To keep remote access stable when your public IP changes, use DDNS and set `WG_HOST` to the DDNS hostname.

## 1) Choose a DDNS Provider

### Option A) DuckDNS (fastest)
- Create a subdomain: `<name>.duckdns.org`
- Keep it updated via your router DDNS feature or a small updater on the Mac.

Example `.env`:
```bash
WG_HOST=<name>.duckdns.org
```

### Option B) Cloudflare (most robust)
- Use your own domain in Cloudflare.
- Create an A record (e.g., `nas.example.com`).
- Run a DDNS updater using a scoped API token.

Example `.env`:
```bash
WG_HOST=nas.example.com
```

## 2) Router Port Forwarding
- Forward **UDP 51820** to your Mac.
- Never expose `51821/tcp` publicly.

## 3) Validate
1. Connect WireGuard from cellular network.
2. Confirm handshake (`wg show`).
3. Access NAS via VPN route.
