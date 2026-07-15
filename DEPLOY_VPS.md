# Deploying Shree Sai Creation on Hostinger VPS KVM 2

This guide outlines how to deploy your Next.js application on a Linux VPS (Ubuntu/Debian) using **Node.js**, **PM2** (Process Manager), and **Nginx** (Reverse Proxy with SSL).

---

## Step 1: Connect to your VPS
Open your terminal and SSH into your Hostinger VPS:
```bash
ssh root@YOUR_VPS_IP
```
*(Replace `YOUR_VPS_IP` with your actual Hostinger VPS IP address found in the hPanel).*

---

## Step 2: Install Node.js & Git
Run the following commands to update system packages and install Node.js (v20 LTS):
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Git
sudo apt install git curl build-essential -y

# Install Node.js LTS (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify the installation:
```bash
node -v
npm -v
```

---

## Step 3: Install PM2 (Process Manager)
PM2 keeps your Next.js application running in the background and restarts it if the server reboots.
```bash
sudo npm install -y -g pm2
```

---

## Step 4: Clone and Setup the Project
Clone your repository onto the VPS (e.g., in the `/var/www/` directory):
```bash
cd /var/www
git clone https://github.com/balaji3245/shree-sai-creation.git
cd shree-sai-creation
```

Install dependencies and build the Next.js app:
```bash
npm install
npm run build
```

---

## Step 5: Start the App with PM2
Launch the Next.js production server using PM2:
```bash
pm2 start npm --name "shree-sai-creation" -- start
```

Ensure PM2 starts automatically on server reboot:
```bash
pm2 startup
# Copy and run the command printed in the terminal output of the above command, then run:
pm2 save
```

To check application status:
```bash
pm2 status
```

---

## Step 6: Configure Nginx as a Reverse Proxy
Nginx will route incoming requests on port 80/443 (HTTP/HTTPS) to Next.js running internally on port 3000.

1. Install Nginx:
   ```bash
   sudo apt install nginx -y
   ```

2. Create a configuration file for your domain:
   ```bash
   sudo nano /etc/nginx/sites-available/shreesaicreation.com
   ```

3. Paste the following configuration (replace `shreesaicreation.com` with your actual domain):
   ```nginx
   server {
       listen 80;
       server_name shreesaicreation.com www.shreesaicreation.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. Enable the site and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/shreesaicreation.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## Step 7: Secure the Site with SSL (HTTPS)
Use Let's Encrypt and Certbot to install a free SSL certificate:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d shreesaicreation.com -d www.shreesaicreation.com
```
*Follow the on-screen prompts to configure SSL redirection.*

---

## Step 8: Updating code in the future
Whenever you push updates to GitHub, run this script on your VPS to deploy them:
```bash
cd /var/www/shree-sai-creation
git pull
npm install
npm run build
pm2 restart shree-sai-creation
```

---

## Step 9: Redirecting Multiple Domains to Main Domain (.com) [Option 1]
If you have multiple domains (e.g. `.com.au`, `.org`, `.online`) and want all of them to redirect to the primary `https://shreesaicreation.com` domain for better SEO:

1. **DNS Setup**: Point all domains (A records) to your VPS IP (`145.79.11.35`).
2. **SSL Setup for all domains**: Run this command on your VPS (select `E` or `2` to expand the existing certificate):
   ```bash
   certbot --nginx -d shreesaicreation.com -d www.shreesaicreation.com -d shreesaicreation.com.au -d www.shreesaicreation.com.au -d shreesaicreation.org -d www.shreesaicreation.org -d shreesaicreation.online -d www.shreesaicreation.online
   ```
3. **Setup Nginx Redirect**: Open Nginx config file:
   ```bash
   nano /etc/nginx/sites-available/default
   ```
   Modify or add the server blocks for the secondary domains (`.com.au`, `.org`, `.online`) so that they return a 301 redirect. 
   
   For example, replace their `location /` blocks with:
   ```nginx
   location / {
       return 301 https://shreesaicreation.com$request_uri;
   }
   ```
   This ensures that all traffic, queries, and page paths automatically forward to the exact same page on the primary `.com` website securely.

4. **Restart Nginx**:
   ```bash
   nginx -t
   systemctl restart nginx
   ```

