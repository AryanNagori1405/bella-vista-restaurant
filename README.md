# Bella Vista – Full-Stack Restaurant Management Website

A responsive, full-stack restaurant website built using **React, Node.js, Express.js, and SQLite**. The application provides an online food-ordering experience, shopping cart management, table reservations, and restaurant analytics through a RESTful API.

## 🚀 Live Demo

**Experience Bella Vista here:**

👉 [Bella Vista – Live Website](https://bella-vista-official.netlify.app/)

Explore the restaurant menu, add dishes to your cart, and try the table reservation experience.

## Technology Stack

- **Frontend:** React 18, JavaScript, HTML5, CSS3
- **Build Tool:** Vite
- **Backend:** Node.js, Express.js
- **Database:** SQLite
- **Database Library:** better-sqlite3
- **API Communication:** REST APIs, Fetch API, JSON
- **Storage:** LocalStorage
- **External API:** TheMealDB

## Key Features

### 1. Interactive Shopping Cart
- Add, increase, decrease, and remove food items.
- Manage cart state using React Context API and useReducer.
- Persist cart data using LocalStorage.
- Automatically calculate subtotal, 5% GST, and total amount.
- Slide-in cart drawer with keyboard accessibility and checkout validation.

### 2. Dynamic Menu Management
- Fetch menu items through backend REST APIs.
- Static JSON fallback when the backend is unavailable.
- Filter items by category and vegetarian preference.
- Search functionality with debouncing.

### 3. Online Food Ordering
- Customer checkout with name and mobile number validation.
- Server-side price verification to prevent client-side price manipulation.
- Store orders and individual order items in SQLite.
- Use database transactions to ensure reliable order processing.

### 4. Table Reservation System
- Reservation form with client-side and server-side validation.
- Automatic table assignment based on guest capacity.
- Prevent double bookings using database constraints.
- Store and retrieve upcoming reservations.

### 5. Restaurant Analytics
- Retrieve recent customer orders.
- Display top-selling dishes and their revenue.
- Generate daily reservation and guest statistics using SQL aggregation queries.

### 6. Responsive User Experience
- Mobile-first responsive design using CSS Grid and Flexbox.
- Dark and light theme support.
- Accessible navigation, form validation, and keyboard interactions.
- Reduced-motion support and optimized UI interactions.

## Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/menu` | Retrieve restaurant menu |
| POST | `/api/orders` | Create a customer order |
| GET | `/api/orders` | Retrieve recent orders |
| GET | `/api/orders/top-dishes` | Retrieve best-selling dishes |
| POST | `/api/reservations` | Create a table reservation |
| GET | `/api/reservations` | Retrieve upcoming reservations |
| GET | `/api/stats` | Retrieve restaurant statistics |

## Database Design

The application uses SQLite with a relational database structure consisting of five tables:

- `categories` – Stores menu categories.
- `menu_items` – Stores food item details and pricing.
- `orders` – Stores customer order information.
- `order_items` – Stores individual items associated with each order.
- `restaurant_tables` – Stores restaurant table details.
- `reservations` – Stores customer reservation information.

**Database features:**
- Foreign key relationships.
- CHECK constraints for data validation.
- UNIQUE constraints to prevent duplicate table bookings.
- Indexes to optimize database lookups.
- Transaction-based order processing for data consistency.

## Technical Highlights

- Implemented RESTful APIs using Node.js and Express.js.
- Used parameterized SQL queries to protect against SQL injection.
- Implemented server-side price calculation to prevent price manipulation.
- Used database transactions to maintain order consistency.
- Managed complex frontend state using React Context API and useReducer.
- Optimized rendering using React.memo and useMemo.
- Implemented debounced search to reduce unnecessary processing.
- Integrated an external API with timeout handling, loading states, and retry functionality.
- Added client-side fallback functionality using static JSON and LocalStorage for demo deployments.

## Running the Project Locally

**1. Build the frontend**

```bash
cd client
npm install
npm run build
```

**2. Start the backend**

```bash
cd ../server
npm install
npm start
```

Application URL: `http://localhost:3000`

**Development mode**

```bash
# Terminal 1 – Backend
cd server
npm start

# Terminal 2 – Frontend
cd client
npm run dev
```

Frontend: `http://localhost:5173`

## Deployment

Configured for static frontend deployment using Netlify. The application supports a demo mode without a backend, using static menu data and LocalStorage for order and reservation storage.

## Project Objective

To develop a complete restaurant management experience that demonstrates frontend development, backend API integration, relational database design, secure data handling, state management, and responsive web development.