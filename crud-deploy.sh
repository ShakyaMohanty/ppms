#!/bin/bash

# Update system
dnf update -y

# Install Node.js 24 and Git
curl -fsSL https://rpm.nodesource.com/setup_24.x | bash -
dnf install -y nodejs git

# Verify
node -v
npm -v

# Install PM2 globally
npm install -g pm2

# Clone repository
cd /home/ec2-user
git clone https://github.com/ShakyaMohanty/ppms.git

# Go to CRUD service
cd /home/ec2-user/ppms/ppms-crud

# Install dependencies
npm install

# Create environment file
cat <<EOF > /home/ec2-user/ppms/ppms-crud/.env
PORT=8000
AUTH_SERVICE_URL=http://10.1.5.249:8080
DB_HOST=localhost
DB_USER=ppmsuser
DB_PASSWORD=
DB_NAME=ppms
RESEND_API_KEY=re_LWhR3gAt_kLDg4mJwReFaR4LeHwpXXaPn
NODE_ENV=development
EOF

# Start service with PM2 as ec2-user
sudo -u ec2-user -i pm2 start /home/ec2-user/ppms/ppms-crud/src/server.js \
  --name ppms-crud \
  --cwd /home/ec2-user/ppms/ppms-crud

# Save PM2 process list
sudo -u ec2-user -i pm2 save

# Enable PM2 on system startup
sudo -u ec2-user -i pm2 startup systemd -u ec2-user --hp /home/ec2-user