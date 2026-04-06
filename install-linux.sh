#!/bin/bash

echo "========================================="
echo " StreamVault - Linux Setup Script"
echo "========================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to detect Linux distribution
detect_distro() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        echo $ID
    else
        echo "unknown"
    fi
}

DISTRO=$(detect_distro)
echo "📊 Detected Linux distribution: $DISTRO"
echo ""

# Check if Docker is installed
if ! command_exists docker; then
    echo "❌ Docker is not installed!"
    echo ""
    echo "Installing Docker..."
    
    case $DISTRO in
        ubuntu|debian)
            sudo apt-get update
            sudo apt-get install -y \
                apt-transport-https \
                ca-certificates \
                curl \
                gnupg \
                lsb-release
            
            # Add Docker's official GPG key
            curl -fsSL https://download.docker.com/linux/$DISTRO/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
            
            # Set up stable repository
            echo \
              "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$DISTRO \
              $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            
            # Install Docker Engine
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io
            ;;
            
        fedora|rhel|centos)
            sudo dnf -y install dnf-plugins-core
            sudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
            sudo dnf install -y docker-ce docker-ce-cli containerd.io
            ;;
            
        arch)
            sudo pacman -S docker
            ;;
            
        *)
            echo "⚠️  Unsupported distribution: $DISTRO"
            echo "Please install Docker manually: https://docs.docker.com/engine/install/"
            exit 1
            ;;
    esac
    
    # Start and enable Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    echo "✅ Docker installed successfully!"
else
    echo "✅ Docker is already installed"
fi

# Check if docker-compose is installed
if ! command_exists docker-compose; then
    echo ""
    echo "❌ docker-compose is not installed!"
    echo "Installing docker-compose..."
    
    case $DISTRO in
        ubuntu|debian)
            sudo apt-get install -y docker-compose
            ;;
            
        fedora|rhel|centos)
            sudo dnf install -y docker-compose
            ;;
            
        arch)
            sudo pacman -S docker-compose
            ;;
            
        *)
            # Install using pip as fallback
            sudo pip3 install docker-compose
            ;;
    esac
    
    echo "✅ docker-compose installed successfully!"
else
    echo "✅ docker-compose is already installed"
fi

# Add current user to docker group
echo ""
echo "🔐 Adding current user to docker group..."
sudo usermod -aG docker $USER

echo ""
echo "========================================="
echo " ✅ Setup Complete!"
echo "========================================="
echo ""
echo "⚠️  IMPORTANT: You need to log out and log back in"
echo "    for Docker permissions to take effect!"
echo ""
echo "After logging back in, run:"
echo "  cd $(pwd)"
echo "  chmod +x *.sh"
echo "  ./start.sh"
echo ""