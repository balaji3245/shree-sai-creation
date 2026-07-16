const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

function getBase64Image(filePath) {
  try {
    const bitmap = fs.readFileSync(filePath);
    return `data:image/png;base64,${bitmap.toString('base64')}`;
  } catch (err) {
    console.error("Error reading image:", filePath);
    return "";
  }
}

// Convert Logo
const logoImg = getBase64Image(path.join(__dirname, '../../public/logo.png'));

// Convert Screenshots
const signinImg = getBase64Image(path.join(__dirname, 'screenshots/signin.png'));
const shopImg = getBase64Image(path.join(__dirname, 'screenshots/shop.png'));
const pdpImg = getBase64Image(path.join(__dirname, 'screenshots/pdp.png'));
const checkoutImg = getBase64Image(path.join(__dirname, 'screenshots/checkout.png'));
const adminImg = getBase64Image(path.join(__dirname, 'screenshots/admin.png'));
const wishlistImg = getBase64Image(path.join(__dirname, 'screenshots/wishlist.png'));
const contactImg = getBase64Image(path.join(__dirname, 'screenshots/contact.png'));
const accountImg = getBase64Image(path.join(__dirname, 'screenshots/account.png'));
const cartImg = getBase64Image(path.join(__dirname, 'screenshots/cart.png'));
const homeImg = getBase64Image(path.join(__dirname, 'screenshots/home.png'));
const assistantImg = getBase64Image(path.join(__dirname, 'screenshots/assistant.png'));

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@300;400;600&display=swap');
    
    body {
      font-family: 'Inter', sans-serif;
      background-color: #0a0a0a;
      color: #faf8f5;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    .page-break { page-break-before: always; }
    
    .cover-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
      background: radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%);
      padding: 50px;
      box-sizing: border-box;
    }
    .cover-logo { width: 120px; margin-bottom: 30px; }
    .cover-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 48px;
      color: #C5A880;
      letter-spacing: 2px;
      margin: 0;
      text-transform: uppercase;
    }
    .cover-subtitle {
      font-size: 14px;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #faf8f5;
      margin-top: 20px;
      opacity: 0.8;
    }
    .cover-date { margin-top: auto; font-size: 12px; color: #888; letter-spacing: 2px; text-transform: uppercase; }

    .content-page {
      padding: 50px;
      background-color: #0a0a0a;
    }
    
    h1 {
      font-family: 'Cormorant Garamond', serif;
      color: #C5A880;
      font-size: 36px;
      border-bottom: 1px solid rgba(197, 168, 128, 0.3);
      padding-bottom: 10px;
      margin-top: 0;
      font-weight: 600;
    }
    h2 {
      font-family: 'Cormorant Garamond', serif;
      color: #faf8f5;
      font-size: 28px;
      margin-top: 40px;
      margin-bottom: 20px;
      font-weight: 400;
    }
    h3 {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: #C5A880;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 30px;
    }
    
    p { color: #ccc; font-size: 14px; font-weight: 300; }
    
    pre {
      background: #111;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.1);
      overflow-x: auto;
      font-size: 12px;
      color: #c9d1d9;
      page-break-inside: avoid;
    }
    code { font-family: "Consolas", monospace; }
    
    img.screenshot {
      width: 100%;
      border: 1px solid rgba(197, 168, 128, 0.3);
      border-radius: 12px;
      margin: 20px 0;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      display: block;
      max-height: 400px;
      object-fit: cover;
      object-position: top;
    }
    
    .endpoint {
      background-color: #1a1a1a;
      color: #faf8f5;
      padding: 10px 15px;
      border-radius: 6px;
      display: inline-block;
      font-weight: 600;
      margin-bottom: 10px;
      font-family: monospace;
      font-size: 14px;
      border-left: 3px solid #C5A880;
    }
    .method-get { color: #61affe; }
    .method-post { color: #49cc90; }
    .method-put { color: #fca130; }
    .method-patch { color: #50e3c2; }
    .method-delete { color: #e53935; }
    
    .api-desc {
      background: rgba(255,255,255,0.02);
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 20px;
      font-size: 13px;
    }
    
    ul li { color: #ccc; font-size: 13px; margin-bottom: 5px; }

    /* TOC */
    .toc-list { list-style: none; padding: 0; }
    .toc-list li {
      font-size: 16px;
      margin-bottom: 15px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px border rgba(255,255,255,0.05);
      padding-bottom: 5px;
    }
    .toc-list li span:last-child { color: #C5A880; }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-page">
    <img src="${logoImg}" alt="Logo" class="cover-logo" />
    <h1 class="cover-title">Backend Integration<br/>Architecture</h1>
    <div class="cover-subtitle">Complete API Documentation & UI Mapping</div>
    <div class="cover-date">Prepared for Shree Sai Creation • July 2026</div>
  </div>

  <div class="page-break"></div>
  <div class="content-page">
    <h1>Table of Contents</h1>
    <ul class="toc-list">
      <li><span>1. Authentication & Security</span> <span>01</span></li>
      <li><span>2. Catalog & Discovery</span> <span>02</span></li>
      <li><span>3. Product Details</span> <span>03</span></li>
      <li><span>4. Session & Cart</span> <span>04</span></li>
      <li><span>5. Checkout & Payments</span> <span>05</span></li>
      <li><span>6. Wishlist System</span> <span>06</span></li>
      <li><span>7. User Dashboard</span> <span>07</span></li>
      <li><span>8. AI Assistant Integration</span> <span>08</span></li>
      <li><span>9. Contact & Inquiries</span> <span>09</span></li>
      <li><span>10. Newsletter Engine</span> <span>10</span></li>
      <li><span>11. Admin Operations</span> <span>11</span></li>
    </ul>
  </div>

  <div class="page-break"></div>
  <div class="content-page">
    <h2>1. Authentication Module</h2>
    <p>Manages user registration and secure login via JWT tokens.</p>
    <img src="${signinImg}" alt="Sign In Page" class="screenshot" />

    <h3>Endpoints</h3>
    <div class="api-desc">
      <div class="endpoint"><span class="method-post">POST</span> /api/auth/register</div>
      <p>Register a new user (Customer or Admin).</p>
      <div class="endpoint"><span class="method-post">POST</span> /api/auth/login</div>
      <p>Authenticate credentials and return a JWT.</p>
    </div>
  </div>

  <div class="page-break"></div>
  <div class="content-page">
    <h2>2. Product Catalog (Shop)</h2>
    <p>Dynamic product fetching, filtering (category, material, finish, price), pagination, and search.</p>
    <img src="${shopImg}" alt="Shop Page" class="screenshot" />

    <h3>Endpoints</h3>
    <div class="api-desc">
      <div class="endpoint"><span class="method-get">GET</span> /api/products</div>
      <p>Fetch a paginated list of products. Supports query params: <code>?page=1&limit=12&category=Chandelier&material=Brass</code>.</p>
    </div>
  </div>

  <div class="page-break"></div>
  <div class="content-page">
    <h2>3. Product Details Page (PDP)</h2>
    <p>Detailed view of a single product.</p>
    <img src="${pdpImg}" alt="Product Details Page" class="screenshot" />

    <h3>Endpoints</h3>
    <div class="api-desc">
      <div class="endpoint"><span class="method-get">GET</span> /api/products/:slug</div>
      <p>Fetch complete details of a single product.</p>
    </div>
  </div>

  <div class="page-break"></div>
  <div class="content-page">
    <h2>4. Cart & Session Sync</h2>
    <p>Syncs the user's shopping cart with the backend database so it persists across devices.</p>
    <img src="${cartImg}" alt="Shopping Cart" class="screenshot" />

    <h3>Endpoints</h3>
    <div class="api-desc">
      <div class="endpoint"><span class="method-get">GET</span> /api/cart</div>
      <p>Fetch the current user's saved cart.</p>
      <div class="endpoint"><span class="method-put">PUT</span> /api/cart</div>
      <p>Sync local cart array to backend.</p>
    </div>
  </div>

  <div class="page-break"></div>
  <div class="content-page">
    <h2>5. Order Processing & Checkout</h2>
    <p>Submit cart and user details to create a formal order and process payment. Supported methods: Visa, Mastercard, Stripe, PayPal, and Cash on Delivery (COD).</p>
    <img src="${checkoutImg}" alt="Checkout Page" class="screenshot" />

    <h3>Endpoints</h3>
    <div class="api-desc">
      <div class="endpoint"><span class="method-post">POST</span> /api/orders</div>
      <p>Submit a new order. Requires customer address, items array, and total amount.</p>
    </div>
  </div>

  <div class="page-break"></div>
  <div class="content-page">
    <h2>6. Wishlist Management</h2>
    <p>Allows users to save products for later.</p>
    <img src="${wishlistImg}" alt="Wishlist Page" class="screenshot" />

    <h3>Endpoints</h3>
    <div class="api-desc">
      <div class="endpoint"><span class="method-get">GET</span> /api/wishlist</div>
      <p>Fetch the user's wishlist items.</p>
      <div class="endpoint"><span class="method-post">POST</span> /api/wishlist/:productId</div>
      <p>Add an item to the wishlist.</p>
      <div class="endpoint"><span class="method-delete">DELETE</span> /api/wishlist/:productId</div>
      <p>Remove an item from the wishlist.</p>
    </div>
  </div>

  <div class="page-break"></div>
  <div class="content-page">
    <h2>7. User Profile & Order History</h2>
    <p>Account dashboard to view past orders and profile details.</p>
    <img src="${accountImg}" alt="Account Page" class="screenshot" />

    <h3>Endpoints</h3>
    <div class="api-desc">
      <div class="endpoint"><span class="method-get">GET</span> /api/user/profile</div>
      <p>Fetch profile details.</p>
      <div class="endpoint"><span class="method-get">GET</span> /api/user/orders</div>
      <p>Fetch past orders for the logged-in user.</p>
    </div>
  </div>

  <div class="page-break"></div>
  <div class="content-page">
    <h2>8. AI Assistant Integration</h2>
    <p>Virtual Assistant backend for fielding queries about lighting specifications and recommendations.</p>
    <img src="${assistantImg}" alt="AI Assistant Chat" class="screenshot" />

    <h3>Endpoints</h3>
    <div class="api-desc">
      <div class="endpoint"><span class="method-post">POST</span> /api/assistant/chat</div>
      <p>Submit user message and receive AI response contextually aware of catalog.</p>
<pre><code>{
  "message": "Do you have any brass chandeliers?",
  "history": []
}</code></pre>
    </div>
  </div>

  <div class="page-break"></div>
  <div class="content-page">
    <h2>9. Contact & Inquiries</h2>
    <p>Submitting general inquiries or custom design requests.</p>
    <img src="${contactImg}" alt="Contact Page" class="screenshot" />

    <h3>Endpoints</h3>
    <div class="api-desc">
      <div class="endpoint"><span class="method-post">POST</span> /api/contact</div>
      <p>Submit contact form data.</p>
    </div>
  </div>

  <div class="page-break"></div>
  <div class="content-page">
    <h2>10. Newsletter Subscription</h2>
    <p>Subscribing to the mailing list for updates (Footer Integration).</p>
    <img src="${homeImg}" alt="Home Page" class="screenshot" />

    <h3>Endpoints</h3>
    <div class="api-desc">
      <div class="endpoint"><span class="method-post">POST</span> /api/newsletter/subscribe</div>
      <p>Subscribe email address.</p>
<pre><code>{ "email": "customer@example.com" }</code></pre>
    </div>
  </div>

  <div class="page-break"></div>
  <div class="content-page">
    <h2>11. Admin Management Dashboard</h2>
    <p>Secure routes to manage products and fulfill orders.</p>
    <img src="${adminImg}" alt="Admin Dashboard" class="screenshot" />

    <h3>Endpoints</h3>
    <div class="api-desc">
      <div class="endpoint"><span class="method-get">GET</span> /api/admin/dashboard-stats</div>
      <p>Returns metrics: Total Sales, Active Orders, Revenue.</p>
      <div class="endpoint"><span class="method-post">POST</span> /api/admin/products</div>
      <p>Create a new product.</p>
      <div class="endpoint"><span class="method-patch">PATCH</span> /api/admin/products/:id</div>
      <p>Update a product.</p>
      <div class="endpoint"><span class="method-delete">DELETE</span> /api/admin/products/:id</div>
      <p>Delete a product.</p>
      <div class="endpoint"><span class="method-patch">PATCH</span> /api/admin/orders/:id/status</div>
      <p>Update the fulfillment status of an order.</p>
    </div>
  </div>

</body>
</html>
`;

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  const outputPath = path.join(__dirname, '../../Backend_Integration_Report.pdf');
  await page.pdf({ 
    path: outputPath, 
    format: 'A4',
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 } // No margins for full bleed dark theme
  });

  await browser.close();
  console.log('Premium PDF generated successfully at:', outputPath);
})();
