const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ROUTES = [
  { path: '/', name: 'home' },
  { path: '/signin', name: 'signin' },
  { path: '/shop', name: 'shop' },
  { path: '/shop/crystal-teardrop-chandelier', name: 'pdp' },
  { path: '/checkout', name: 'checkout' },
  { path: '/admin', name: 'admin' },
  { path: '/wishlist', name: 'wishlist' },
  { path: '/contact', name: 'contact' },
  { path: '/account', name: 'account' },
  { path: '/cart', name: 'cart' }
];

async function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

(async () => {
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  for (const route of ROUTES) {
    console.log(`Navigating to ${route.name}...`);
    try {
      await page.goto(`http://localhost:3001${route.path}`, { waitUntil: 'load', timeout: 60000 });
      // Wait extra 3.5 seconds for the custom LuxuryLoader and other framer-motion animations to finish
      console.log(`Waiting for animations on ${route.name}...`);
      await delay(3500);
      
      const screenshotPath = path.join(screenshotsDir, `${route.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Saved screenshot: ${screenshotPath}`);

      if (route.name === 'home') {
        console.log('Opening AI Assistant...');
        try {
          await page.click('button[aria-label="Toggle AI Assistant"]');
          await delay(1500);
          await page.screenshot({ path: path.join(screenshotsDir, 'assistant.png'), fullPage: false });
          console.log('Saved screenshot: assistant.png');
          // close it
          await page.click('button[aria-label="Toggle AI Assistant"]');
          await delay(500);
        } catch (e) {
          console.error("Could not capture AI assistant", e.message);
        }
      }

    } catch (err) {
      console.error(`Failed to capture ${route.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
})();
