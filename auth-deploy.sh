#!/bin/bash

yum update -y

#install nodejs 24.x and npm
curl -fsSL https://rpm.nodesource.com/setup_24.x | bash -
yum install -y nodejs git

#verify installation
node -v
npm -v

#install pm2 globally
npm install -g pm2

#install (mariadb) mysql compatiple server
dnf install -y mariadb105-server
systemctl enable mariadb
systemctl start mariadb

# Wait a few seconds to ensure MySQL is ready
sleep 5

mysql -u root <<EOF
CREATE DATABASE IF NOT EXISTS ppms;
CREATE USER IF NOT EXISTS 'ppmsuser'@'localhost' IDENTIFIED BY '';
GRANT ALL PRIVILEGES ON ppms.* TO 'ppmsuser'@'localhost';
FLUSH PRIVILEGES;
EOF

# Clone repo
cd /home/ec2-user
git clone https://github.com/ShakyaMohanty/ppms.git
cd ppms/ppms-auth

npm install

cat <<EOF > .env
PORT=8080
DB_HOST=localhost
DB_USER=ppmsuser
DB_PASSWORD=
DB_NAME=ppms
NODE_ENV=development
RESEND_API_KEY=re_LWhR3gAt_kLDg4mJwReFaR4LeHwpXXaPn
EOF

npm run create-tables

sudo -u ec2-user pm2 start /home/ec2-user/ppms/ppms-auth/src/server.js --name ppms-auth --cwd /home/ec2-user/ppms/ppms-auth
sudo -u ec2-user pm2 save
sudo -u ec2-user pm2 startup systemd -u ec2-user --hp /home/ec2-user