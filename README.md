# 🍽️ Restaurant Management for ERPNext

A complete **Restaurant Billing & Order Management** app built for **ERPNext v15 / Frappe v15**.  
Covers dine-in & parcel orders, table management, KOT & bill printing, revenue analytics, and ERPNext Sales Invoice integration.

> Inspired by [amutaher/Restaurant-Billing-System](https://github.com/amutaher/Restaurant-Billing-System) — rebuilt as a native Frappe/ERPNext app.

## 🚀 Features

### 🛒 Order Management
- Create and manage **Dine-in** and **Parcel** orders
- Interactive **POS page** for fast order-taking
- Menu items grouped by category with search/filter
- Quantity controls and real-time total calculation
- Special instructions / notes per order

### 🪑 Table Management
- Visual table grid with **color-coded status** (Available / Occupied / Reserved)
- Automatic table occupation when dine-in order is placed
- One-click **Clear Table** to complete order and free table
- Seating capacity tracking

### 🖨️ Printing
- **KOT (Kitchen Order Ticket)** — compact format for kitchen display
- **Bill/Receipt** — professional receipt with restaurant branding
- Both printable directly from the browser

### 📊 Revenue Analytics
- **Script Report** with date range filters and order type filters
- Bar charts showing revenue and order trends
- Summary cards: Total Revenue, Orders, Dine-in/Parcel split, Avg Order Value
- Built-in Excel/CSV export

### 💳 ERPNext Integration
- **Auto-create Sales Invoice** when order is completed (enabled by default)
- Links restaurant orders to ERPNext accounting
- Toggle on/off via Restaurant Settings

### 📤 Export & Sharing
- **Excel export** of revenue reports
- **WhatsApp** daily revenue summary sharing

## 📦 Installation

```bash
# Navigate to your bench directory
cd ~/frappe-bench

# Get the app
bench get-app https://github.com/YOUR_USERNAME/restaurant_management.git

# Install on your site
bench --site your-site.local install-app restaurant_management

# Run migrations
bench --site your-site.local migrate

# Clear cache
bench --site your-site.local clear-cache
bench build
```

## 🏗️ Setup

1. **Restaurant Settings** — Configure restaurant name, address, currency symbol, and feature toggles
2. **Menu Items** — Add your dishes with categories, prices, and images
3. **Tables** — 10 tables are created by default; add more as needed
4. **Start Taking Orders** — Open the **Restaurant POS** page from the workspace

## 📋 DocTypes

| DocType | Description |
|---------|-------------|
| **Restaurant Settings** | Singleton — restaurant config and feature toggles |
| **Restaurant Table** | Table with number, status, capacity |
| **Restaurant Menu Item** | Dish with name, group, price, availability |
| **Restaurant Order** | Order with type, table, items, totals, status |
| **Restaurant Order Item** | Child table — line items in an order |

## 🖥️ Pages & Reports

| Name | Type | Description |
|------|------|-------------|
| **Restaurant POS** | Page | Interactive order-taking interface |
| **Restaurant Revenue** | Script Report | Revenue analytics with charts |

## 👤 Customer User Guide

This guide explains how your customers can use the self-ordering and reservation features powered by this app. All customer pages are accessible via QR codes or direct URLs — **no login required**.

---

### 📱 1. Self-Ordering via QR Code

Every table in your restaurant gets a unique QR code. When customers scan it, they land on a mobile-optimized ordering page.

**How it works for customers:**

1. **Scan the QR code** at their table (or access `/restaurant/order?table=TABLE_ID`)
2. **Browse the menu** — items are grouped by category with a search bar
3. **Add items** to their cart by tapping the **+** button on any item
4. **Tap "View Cart"** to review their order
5. **Enter their details:**
   - Name (optional)
   - Mobile number (required)
   - Special instructions (optional)
6. **Tap "Place Order"** — the order is sent to the kitchen instantly

> **Tip:** Print the QR codes page at `/restaurant/qrcodes` and place them on each table.

#### Order Types
| Type | How It Works |
|------|-------------|
| **Dine In** | Auto-selected when scanning a table QR code. Order is linked to the table. |
| **Takeaway (Parcel)** | Customer selects branch and places a parcel order for pickup. |
| **Delivery** | Customer selects branch, enters delivery address, and optionally detects their current location via GPS. |

---

### 🚚 2. Delivery Ordering

For delivery orders, customers get enhanced features:

- **Address Detection** — Tap "Detect My Current Location" to auto-fill their delivery address using GPS + reverse geocoding (OpenStreetMap Nominatim)
- **Branch Selection** — Choose which restaurant branch to order from
- **Live Tracking** — Once the order is out for delivery, customers can track the delivery boy in real-time on a map

---

### 📦 3. Order Status Tracking

After placing an order, customers are redirected to a **live order status page** at `/restaurant/status?order=ORDER_ID`.

**What customers see:**

✅ **Status Timeline** — Visual step-by-step progress:
- 📝 In Progress
- 🔥 Preparing
- ✅ Ready
- 🍽️ Served (Dine In) / 🛵 Out for Delivery (Delivery)
- 🎉 Completed

📋 **Order Details** — Item list with quantities, prices, and total amount

💳 **Payment Status** — Badge showing Paid / Unpaid

➕ **Add More Items** — Customers can add items to their active, unpaid order directly from the status page

🔄 **Auto-Refresh** — The page refreshes every 8 seconds so customers see the latest status without reloading

---

### 🗺️ 4. Live Delivery Tracking

For delivery orders with status **"Out for Delivery"**, customers see a **live map** with:

- 🛵 **Delivery Boy** — Real-time GPS position of the delivery rider
- 🏪 **Restaurant** — Location of the branch
- 🏠 **Customer** — Their delivery address

The map auto-fits to show all locations and updates in real-time as the delivery boy moves.

---

### 💳 5. UPI Payment

Customers can pay directly from their phone:

1. When the order is **Served** (Dine In) or **Delivered** (Delivery), a **"Pay Now"** card appears on the status page
2. Tapping the UPI link opens their preferred UPI app (Google Pay, PhonePe, Paytm, etc.)
3. Payment is pre-filled with the exact amount and merchant name
4. Once paid, the cashier confirms the payment and the status updates accordingly

> **Setup:** Configure your UPI ID and merchant name in **Restaurant Settings**.
> **Note:** The status page auto-refreshes every 8 seconds, so customers see payment confirmation and status updates automatically.

---

### 🪑 6. Table Reservation

Customers can book a table in advance at `/restaurant/book`.

**Booking flow:**

1. **Select Date & Guests** — Choose the date and number of guests
2. **Choose Branch** — Pick from available branches (optional)
3. **Check Availability** — See available time slots with remaining table count
4. **Pick a Time Slot** — Tap an available slot to select it
5. **Enter Details** — Name, phone, email (optional), and special requests
6. **Confirm Booking** — Reservation is instantly confirmed

**Confirmation page shows:**
- 🎉 Reservation ID
- 📅 Date & Time
- 👥 Number of guests
- 🪑 Assigned table number & seating capacity

---

### 🖨️ 7. QR Codes Page

Restaurant staff can access `/restaurant/qrcodes` to:

- View QR codes for **all tables**
- **Print** all QR codes at once (printer-friendly layout, 2 per page)
- Place printed QR codes on each table for self-ordering

Each QR code encodes the table-specific ordering URL, so customers are automatically assigned to their table.

---

### 🔗 Direct URLs Reference

| Page | URL | Description |
|------|-----|-------------|
| **Welcome** | `/restaurant` | Welcome page prompting QR scan |
| **Menu & Order** | `/restaurant/order?table=TABLE_ID` | Self-ordering page (with table auto-assignment) |
| **Add to Order** | `/restaurant/order?table=TABLE_ID&order=ORDER_ID` | Add more items to an existing order |
| **Order Status** | `/restaurant/status?order=ORDER_ID` | Live order tracking & payment |
| **Book a Table** | `/restaurant/book` | Table reservation form |
| **QR Codes** | `/restaurant/qrcodes` | Print-ready table QR codes |

---

### ⚙️ Restaurant Staff Tips

- **Print QR codes** and laminate them for each table
- **Turn on UPI** in Restaurant Settings to enable digital payments
- **Set up branches** if you have multiple locations — customers can order from their nearest branch
- **Assign delivery boys** from the POS to enable live tracking for delivery orders
- **Customize your menu** with images for a better customer experience

## 📜 License

MIT License — see [license.txt](license.txt)
