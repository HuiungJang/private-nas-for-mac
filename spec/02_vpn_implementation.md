# VPN Implementation Specification

**Parent Document:** [00_master_spec.md](./00_master_spec.md)
**Version:** 1.0.0
**Date:** 2026-01-04

---

## 1. Overview
The **Private NAS for Mac** relies on a "VPN-First" security model. Instead of hardening the Web Application against the entire public internet, we reduce the attack surface by placing the entire application behind a VPN (Virtual Private Network). 

**WireGuard** is chosen for its high performance, simplicity, and ease of containerization.

---

## 2. Architecture & Components

### 2.1 VPN Server
We will utilize the **`wg-easy`** (or similar) Docker image. It combines:
- **WireGuard** (Kernel/User-space implementation).
- **Web UI** for managing clients (peers).
- **Automatic Config Generation** (QR Codes / `.conf` files).

### 2.2 Network Flow
1.  **Public Internet:** Only the WireGuard UDP port (default: `51820`) is exposed on the Mac Host's router/firewall.
2.  **Connection:** User's device (Phone/Laptop) initiates a handshake with the Mac Host IP.
3.  **Tunnel:** Once authenticated via private keys, the device joins the `10.8.0.x` (example) subnet.
4.  **Access:** The device can now access the NAS Web UI at the internal Docker IP or a DNS alias (e.g., `http://10.8.0.1` or `http://nas.local`).

### 2.3 Docker Configuration
The VPN container acts as the gateway.

```yaml
services:
  wg-easy:
    image: ghcr.io/wg-easy/wg-easy
    container_name: nas-vpn
    environment:
      - WG_HOST=YOUR_PUBLIC_IP_OR_DDNS
      - PASSWORD=ADMIN_PASSWORD
      - WG_DEFAULT_ADDRESS=10.8.0.x
      - WG_DEFAULT_DNS=1.1.1.1
    volumes:
      - ./config/wireguard:/etc/wireguard
    ports:
      - "51820:51820/udp" # The ONLY public port
      - "51821:51821/tcp" # Web UI for Admin (Internal access only recommendation)
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    sysctls:
      - net.ipv4.ip_forward=1
      - net.ipv4.conf.all.src_valid_mark=1
```

---

## 3. Integration with Admin Dashboard

Since `wg-easy` provides its own UI, we have two options for the "VPN Management" feature in our NAS Admin Dashboard:

### 3.1 Option A: Iframe / Link (Phase 1)
- The NAS Admin Dashboard simply links to the `wg-easy` UI (running on port 51821).
- **Pros:** Zero development effort.
- **Cons:** Separate login required; disjointed UX.

### 3.2 Option B: API Integration (Phase 2)
- The NAS Backend communicates with the `wg-easy` API (if available) or manipulates the configuration files directly.
- **Features:**
    - "Create Device": Backend calls VPN service to generate a peer.
    - "Revoke Device": Backend removes peer.
    - "Show QR": Backend fetches the config/QR and displays it in the NAS UI.

**Decision:** We will aim for **Option A** for the initial prototype, but architect the System Settings page to support **Option B** later.

---

## 4. User Experience (UX)

### 4.1 Setup (One-time)
1.  Admin sets up Docker containers.
2.  Admin accesses VPN UI (locally) to generate a config for their own phone/laptop.
3.  Admin scans QR code with WireGuard App.
4.  Admin activates VPN.

### 4.2 Daily Usage
1.  User opens WireGuard App -> "Connect".
2.  User opens Browser -> Bookmarked NAS URL (e.g., `http://10.8.0.2`).
3.  User logs in to NAS.

### 4.3 Sharing
1.  **Scenario:** User wants to share a file with a friend.
2.  **Problem:** Friend is not on VPN.
3.  **Solution:**
    - Admin creates a temporary VPN config for the friend.
    - OR, Friend must physically come to the network.
    - *Note:* This is a trade-off of the "VPN Only" security model. True public sharing is disabled.

---

## 5. Security Considerations

- **DDNS:** Since residential IPs change, a DDNS (Dynamic DNS) sidecar or router config is needed for `WG_HOST`.
- **Port Forwarding:** The user must manually forward UDP 51820 on their router to the Mac.
- **Key Rotation:** WireGuard keys should be rotated periodically (manual process in Phase 1).
