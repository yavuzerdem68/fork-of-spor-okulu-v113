# Plesk Deployment Guide for Sports School CRM

## Prerequisites
- Node.js installed locally
- Access to Plesk control panel
- Domain configured in Plesk

## Step 1: Build Application Locally
```bash
# Install dependencies
npm install

# Build for WordPress/static hosting
npm run build:wordpress
```

## Step 2: Prepare Files
After building, you'll have an `out` directory with these files:
- `index.html` (main entry point)
- `_next/` directory (static assets)
- All page HTML files
- `.htaccess` file (copy manually)

## Step 3: Upload via Plesk File Manager

### Method 1: Manual Upload
1. Open Plesk control panel
2. Go to "Files" or "File Manager"
3. Navigate to `httpdocs` or `public_html`
4. Create folder: `spor-okulu`
5. Upload all contents from `out/` directory
6. Upload `.htaccess` file to `spor-okulu/` folder

### Method 2: FTP Upload
If you prefer FTP:
1. Use Plesk FTP credentials
2. Connect to your server
3. Navigate to `httpdocs/spor-okulu/`
4. Upload all files from `out/` directory
5. Upload `.htaccess` file

### Method 3: Plesk Git (if available)
1. Go to "Git" in Plesk
2. Add repository: your GitHub repo URL
3. Set deployment path: `httpdocs/spor-okulu`
4. Configure build commands:
   ```bash
   npm install
   npm run build:wordpress
   cp -r out/* ./
   cp .htaccess ./
   ```

## Step 4: Configure WordPress API (if needed)
If using WordPress backend:
1. Ensure WordPress site is accessible
2. Install necessary WordPress plugins for REST API
3. Configure CORS if needed

## Step 5: Test Deployment
Visit: `https://yourdomain.com/spor-okulu/`

## Troubleshooting

### Common Issues:
1. **404 Errors**: Check .htaccess file is uploaded and mod_rewrite is enabled
2. **Assets Not Loading**: Verify `_next/static/` directory is uploaded correctly
3. **Routing Issues**: Ensure .htaccess rewrite rules are working

### File Permissions:
- HTML files: 644
- Directories: 755
- .htaccess: 644

### Plesk-Specific Settings:
- Enable "Allow web statistics programs to access logs"
- Ensure PHP is enabled (if using WordPress backend)
- Check Apache modules: mod_rewrite, mod_headers

## Maintenance
To update the application:
1. Make changes locally
2. Run `npm run build:wordpress`
3. Upload new files from `out/` directory
4. Clear any caches in Plesk

## Support
- Check Plesk logs for errors
- Verify domain DNS settings
- Test on staging subdomain first