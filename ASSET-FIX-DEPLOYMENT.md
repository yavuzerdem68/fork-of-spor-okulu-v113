# Fixed Asset Loading - Plesk Deployment Guide

## Issue Fixed
The 404 errors for static assets (JS, CSS files) have been resolved by:
1. Fixing `assetPrefix` and `basePath` in `next.config.wordpress.mjs`
2. Updating `.htaccess` to properly handle static asset routing
3. Allowing `manifest.json` access for PWA functionality

## Updated Deployment Steps

### 1. Build Application with Fixed Configuration

**For Windows PowerShell:**
```powershell
# Clean previous build
Remove-Item -Recurse -Force out/, .next/ -ErrorAction SilentlyContinue

# Install dependencies
npm install

# Build for WordPress/static hosting with fixed paths
npm run build:wordpress
```

**For Unix/Linux/Mac:**
```bash
# Clean previous build
rm -rf out/ .next/

# Install dependencies
npm install

# Build for WordPress/static hosting with fixed paths
npm run build:wordpress
```

### 2. Verify Build Output
After building, check that your `out/` directory contains:
- `index.html`
- `_next/` directory with static assets
- `manifest.json`
- All page HTML files
- Static assets in correct subdirectories

### 3. Upload to Plesk
1. Open Plesk File Manager
2. Navigate to `httpdocs` or `public_html`
3. **Important**: If `spor-okulu` folder exists, delete it completely first
4. Create new `spor-okulu` folder
5. Upload ALL contents from `out/` directory
6. Upload the updated `.htaccess` file

### 4. File Structure Verification
Your hosting should look like this:
```
httpdocs/spor-okulu/
├── .htaccess (updated version)
├── index.html
├── manifest.json
├── _next/
│   ├── static/
│   │   ├── css/
│   │   ├── js/
│   │   └── media/
│   └── ...
├── athletes.html
├── dashboard.html
└── ... (all other pages)
```

### 5. Test Deployment
Visit: `https://yourdomain.com/spor-okulu/`

Check browser console - there should be no 404 errors for:
- JavaScript files (webpack, framework, main, etc.)
- CSS files
- manifest.json

## Key Changes Made

### next.config.wordpress.mjs
- Fixed `assetPrefix: '/spor-okulu'` (always applied)
- Fixed `basePath: '/spor-okulu'` (always applied)

### .htaccess
- Improved static asset handling
- Added specific rule for `_next/` directory
- Allowed `manifest.json` access
- Better file existence checks

## Troubleshooting

### If you still get 404 errors:
1. **Clear browser cache** completely
2. **Check file permissions** in Plesk:
   - Files: 644
   - Directories: 755
3. **Verify Apache modules** are enabled:
   - mod_rewrite
   - mod_headers
4. **Check Plesk logs** for any server errors

### Common Issues:
- **Old cached files**: Clear browser cache and hard refresh (Ctrl+F5)
- **Incomplete upload**: Ensure ALL files from `out/` directory are uploaded
- **Wrong directory**: Make sure files are in `httpdocs/spor-okulu/` not just `httpdocs/`

### Testing Checklist:
- [ ] Main page loads without errors
- [ ] No 404 errors in browser console
- [ ] CSS styling is applied correctly
- [ ] JavaScript functionality works
- [ ] Navigation between pages works
- [ ] PWA manifest loads correctly

## Next Steps After Successful Deployment
1. Test all major features (login, athlete management, payments)
2. Configure WordPress API endpoints if needed
3. Set up SSL certificate if not already configured
4. Configure any necessary CORS settings for API calls