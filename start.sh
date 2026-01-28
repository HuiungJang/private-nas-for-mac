#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Private NAS Setup ===${NC}"

# 1. Check Docker
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker Desktop first."
    exit 1
fi

# 2. Setup Environment Variables
if [ ! -f .env ]; then
    echo "Creating .env file..."

    # Try to detect public IP
    DEFAULT_HOST=$(curl -s ifconfig.me || echo "localhost")

    read -p "Enter your Public IP/Hostname for VPN [${DEFAULT_HOST}]: " WG_HOST
    WG_HOST=${WG_HOST:-$DEFAULT_HOST}

    read -p "Enter VPN Admin Password [admin123]: " WG_PASSWORD
    WG_PASSWORD=${WG_PASSWORD:-admin123}

            echo "Generating password hash..."

            RAW_HASH=$(docker run --rm --entrypoint node ghcr.io/wg-easy/wg-easy -e 'console.log(require("bcryptjs").hashSync(process.argv[1], 10))' "$WG_PASSWORD")

            WG_PASSWORD_HASH=$(echo "$RAW_HASH" | sed 's/\$/\$\$/g')

            

            # Detect OS for default volume path

            if [[ "$OSTYPE" == "darwin"* ]]; then

                DEFAULT_VOLUMES="/Volumes"

            else

                DEFAULT_VOLUMES="/mnt"

            fi

            

            read -p "Enter Host Path to share [${DEFAULT_VOLUMES}]: " HOST_VOLUMES_PATH

            HOST_VOLUMES_PATH=${HOST_VOLUMES_PATH:-$DEFAULT_VOLUMES}

            

            cat > .env <<EOF

        WG_HOST=${WG_HOST}

        WG_PASSWORD_HASH=${WG_PASSWORD_HASH}

        HOST_VOLUMES_PATH=${HOST_VOLUMES_PATH}

        EOF

        

    
    echo -e "${GREEN}.env created!${NC}"
else
    echo -e "${GREEN}.env exists, skipping setup.${NC}"
fi

# 3. Start Services
echo -e "${BLUE}Starting Services...${NC}"
docker-compose up -d --build

echo -e "${GREEN}=== Setup Complete ===${NC}"
echo -e "Frontend: http://localhost"
echo -e "VPN Admin: http://localhost:51821 (Password: Check .env)"
echo -e "WireGuard Port: 51820/udp"
