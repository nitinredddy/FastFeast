# FASTFEAST — Project Report

**Team:** Nitin Pradeepkumar Reddy (PES2UG23CS401), Poorva Tejas Reddy (PES2UG23CS416)  
**Course:** DBMS Mini Project (UE23CS351A)  
**Date:** 17 November 2025

---

## 1. Title / Cover Page

FastFeast — Food Ordering & Management System

Team: Nitin Pradeepkumar Reddy (PES2UG23CS401), Poorva Tejas Reddy (PES2UG23CS416)

Course: DBMS Mini Project (UE23CS351A)

Date: 17 November 2025

---

## 2. Short Abstract

FastFeast is a full-stack food ordering system with role-based users (admin, customer, staff). The project demonstrates a production-style separation between a React-based frontend (admin and user apps), and a Node.js + Express backend using MySQL for persistence. The database uses stored procedures, functions and triggers to encapsulate transactional logic such as creating orders with multiple items, calculating totals, updating order status with validation, logging status changes, and updating inventory atomically.

---

## 3. User Requirement Specification (Review-1 ready)

### Functional Requirements
- User registration and authentication (customers, staff, admin).
- Customers can browse menu, add items to a cart, and place orders including multiple items.
- Orders have an amount calculated server-side and stored; each order tracks a per-day `order_no`.
- Customers can view/cancel their orders subject to business rules.
- Admin can manage menu items (create/update/delete/toggle availability) and view inventory.
- Inventory is automatically decremented when an order is placed.
- Admin dashboard displays total orders, active menu items, and daily revenue.
- Customers can leave feedback for menu items.
- Order status workflow is enforced via stored procedures to ensure valid transitions.

### Non-functional Requirements
- Secure password storage (bcrypt).
- Cookie-based JWT authentication (HTTP-only cookies).
- Data integrity via foreign keys, checks, and transactions.
- Atomic operations for order creation through stored procedures.

### Acceptance Criteria (for Review-1)
- DDL scripts create the required tables and constraints.
- Stored procedures, functions and triggers implemented and tested.
- Backend endpoints call stored procedures correctly.
- Simple admin and user UIs available for CRUD workflows.

---

## 4. Software / Tools / Programming Languages Used
- Backend: Node.js (ES modules), Express.js
- Database: MySQL (fastfeast.sql provided at project root)
- DB driver: mysql2 (used as `pool.query` in backend)
- Authentication: bcrypt, jsonwebtoken
- Frontend: React + Vite + Tailwind CSS (two apps: `admin/` and `user/`)
- HTTP client: axios
- Environment management: dotenv
- Development environment: macOS (zsh), VS Code
- Version control: Git / GitHub

---

## 5. ER Diagram (ASCII)

Legend: PK = primary key, FK = foreign key

Entities and relationships:

- User (user_id PK)
- Menu (item_id PK)
- Orders (order_id PK) — FK user_id -> User.user_id
- OrderItem (order_id PK, item_id PK) — FK order_id -> Orders.order_id, FK item_id -> Menu.item_id
- Inventory (item_id PK) — FK item_id -> Menu.item_id
- Feedback (feedback_id PK) — FK user_id -> User.user_id, FK item_id -> Menu.item_id
- OrderLogs (log_id PK) — FK order_id -> Orders.order_id

ASCII diagram (compact):

User(user_id PK) 1---N Orders(order_id PK, user_id FK)
Menu(item_id PK) 1---N OrderItem(order_id PK, item_id PK)
Orders(order_id) 1---N OrderItem(order_id, item_id)
Menu(item_id) 1---1 Inventory(item_id)
User(user_id) 1---N Feedback(feedback_id)
Menu(item_id) 1---N Feedback(feedback_id)
Orders(order_id) 1---N OrderLogs(log_id)

(If you want an image version, I can generate a PNG/SVG on request.)

---

## 6. Relational Schema (finalized)

User
- user_id INT AUTO_INCREMENT PRIMARY KEY
- name VARCHAR(100) NOT NULL
- email VARCHAR(100) UNIQUE NOT NULL
- password VARCHAR(255) NOT NULL
- phone VARCHAR(15)
- role ENUM('admin','customer','staff') DEFAULT 'customer'
- address VARCHAR(255)

Menu
- item_id INT AUTO_INCREMENT PRIMARY KEY
- name VARCHAR(100) NOT NULL
- cost DECIMAL(10,2) NOT NULL
- category VARCHAR(100)
- availability BOOLEAN DEFAULT TRUE

Orders
- order_id INT AUTO_INCREMENT PRIMARY KEY
- user_id INT (FK -> User.user_id)
- amount DECIMAL(10,2)
- payment_mode VARCHAR(50)
- order_date DATETIME DEFAULT CURRENT_TIMESTAMP
- pickup_time TIME
- status ENUM('pending','preparing','ready','completed','cancelled') DEFAULT 'pending'
- order_no INT -- daily sequential number

OrderItem
- order_id INT (FK -> Orders.order_id)
- item_id INT (FK -> Menu.item_id)
- quantity INT DEFAULT 1
- PRIMARY KEY (order_id, item_id)

Inventory
- item_id INT PRIMARY KEY (FK -> Menu.item_id)
- stock_quantity INT DEFAULT 0
- last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

Feedback
- feedback_id INT AUTO_INCREMENT PRIMARY KEY
- user_id INT (FK -> User.user_id)
- item_id INT (FK -> Menu.item_id)
- content TEXT
- feedback_date DATETIME DEFAULT CURRENT_TIMESTAMP

OrderLogs
- log_id INT AUTO_INCREMENT PRIMARY KEY
- order_id INT (FK -> Orders.order_id)
- old_status VARCHAR(20)
- new_status VARCHAR(20)
- changed_at DATETIME DEFAULT CURRENT_TIMESTAMP

---

## 7. Key DDL Commands (representative extracts)

The complete DDL and DB logic is in `fastfeast.sql` at the repository root. Below are the main table creation snippets (representative):

CREATE TABLE User (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  role ENUM('admin','customer','staff') DEFAULT 'customer',
  address VARCHAR(255)
);

CREATE TABLE Menu (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  availability BOOLEAN DEFAULT TRUE,
  category VARCHAR(100)
);

CREATE TABLE Orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  amount DECIMAL(10,2),
  payment_mode VARCHAR(50),
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  pickup_time TIME,
  status ENUM('pending','preparing','ready','completed','cancelled') DEFAULT 'pending',
  order_no INT,
  FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE OrderItem (
  order_id INT,
  item_id INT,
  quantity INT DEFAULT 1,
  PRIMARY KEY (order_id, item_id),
  FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES Menu(item_id)
);

CREATE TABLE Inventory (
  item_id INT PRIMARY KEY,
  stock_quantity INT DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES Menu(item_id)
);

CREATE TABLE Feedback (
  feedback_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  item_id INT,
  content TEXT,
  feedback_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES User(user_id),
  FOREIGN KEY (item_id) REFERENCES Menu(item_id)
);

CREATE TABLE OrderLogs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);

CREATE VIEW daily_revenue_view AS
SELECT DATE(order_date) AS order_day, SUM(amount) AS total_revenue
FROM Orders
WHERE status = 'completed'
GROUP BY DATE(order_date);

---

## 8. CRUD Operation Screenshots — How to capture them

I cannot capture screenshots directly, but here are exact endpoints and commands you can run and screenshot for Review-1. Replace host/port if your backend runs somewhere else.

Base assumptions: backend at http://localhost:5000

1) Register (POST /api/auth/register)
- Request body:
```json
{ "name":"Test User", "email":"test@example.com", "password":"pass123", "phone":"9999999999" }
```
- curl:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"pass123","phone":"9999999999"}'
```

2) Login (POST /api/auth/login) — capture Set-Cookie header
```bash
curl -i -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'
```

3) Create Order (POST /api/orders) — send cookie or authorization header as required
```bash
curl -b cookie.txt -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[{"item_id":1,"quantity":2}],"payment_mode":"UPI"}'
```

4) Get Order (GET /api/orders/:id)
```bash
curl http://localhost:5000/api/orders/1
```

5) Admin: Add menu item (POST /api/menu), Update (PUT /api/menu/:id), Delete (DELETE /api/menu/:id)

6) Verify inventory change — select from Inventory table via MySQL client or an API endpoint if present.

For UI screenshots: start the frontend dev servers for `admin/` and `user/` and capture pages mentioned in section 9 (Menu Manager, Dashboard, Cart, Orders, etc.).

---

## 9. List of functionalities/features and associated frontend files

User-facing features
- Browse Menu — `user/src/pages/Home.jsx`, `user/src/components/MenuCard.jsx`
- Cart management — `user/src/pages/Cart.jsx`, `user/src/components/CartItem.jsx`
- Place Order — `user/src/pages/Cart.jsx`
- My Orders — `user/src/pages/Orders.jsx`
- Login/Register — `user/src/pages/Login.jsx`, `user/src/pages/Register.jsx`
- Feedback submission — `user/src/pages/Feedback.jsx`

Admin-facing features
- Dashboard — `admin/src/pages/Dashboard.jsx`
- Menu Manager (Add/Edit/Delete) — `admin/src/pages/MenuManager.jsx`
- Inventory — `admin/src/pages/Inventory.jsx`
- Orders Panel (update status) — `admin/src/pages/OrdersPanel.jsx`
- Feedback view — `admin/src/pages/Feedback.jsx`

---

## 10. Triggers, Procedures/Functions, Nested query, Join, Aggregate queries

### Function: calculate_order_total
```sql
DELIMITER //
CREATE FUNCTION calculate_order_total(p_order_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE total DECIMAL(10,2);
    SELECT SUM(m.cost * oi.quantity)
    INTO total
    FROM OrderItem oi
    JOIN Menu m ON oi.item_id = m.item_id
    WHERE oi.order_id = p_order_id;
    RETURN COALESCE(total, 0);
END //
DELIMITER ;
```

### Procedure: create_order_with_items
```sql
DELIMITER //
CREATE PROCEDURE create_order_with_items(
    IN p_user_id INT,
    IN p_payment_mode VARCHAR(50),
    IN p_pickup_time TIME,
    IN p_items_json JSON
)
BEGIN
    DECLARE p_amount DECIMAL(10,2) DEFAULT 0;
    DECLARE p_order_id INT;
    DECLARE p_order_no INT;
    DECLARE today DATE;

    SET today = CURDATE();

    SELECT COUNT(*) + 1 INTO p_order_no
    FROM Orders
    WHERE DATE(order_date) = today;

    INSERT INTO Orders (user_id, amount, payment_mode, pickup_time, order_no, status)
    VALUES (p_user_id, 0, p_payment_mode, p_pickup_time, p_order_no, 'preparing');

    SET p_order_id = LAST_INSERT_ID();

    INSERT INTO OrderItem (order_id, item_id, quantity)
    SELECT p_order_id, jt.item_id, jt.quantity
    FROM JSON_TABLE(p_items_json, '$[*]'
        COLUMNS (
            item_id INT PATH '$.item_id',
            quantity INT PATH '$.quantity'
        )
    ) AS jt;

    SELECT calculate_order_total(p_order_id) INTO p_amount;

    UPDATE Orders SET amount = p_amount WHERE order_id = p_order_id;

    SELECT p_order_id AS order_id, p_order_no AS order_no, p_amount AS amount;
END //
DELIMITER ;
```

### Procedure: update_order_status
```sql
DELIMITER //
CREATE PROCEDURE update_order_status(IN p_order_id INT, IN p_new_status VARCHAR(20))
BEGIN
    DECLARE current_status VARCHAR(20);

    SELECT status INTO current_status FROM Orders WHERE order_id = p_order_id;

    IF current_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order not found';
    END IF;

    IF (
        (current_status = 'preparing' AND p_new_status IN ('ready', 'completed')) OR
        (current_status = 'ready' AND p_new_status = 'completed')
    ) THEN
        UPDATE Orders SET status = p_new_status WHERE order_id = p_order_id;
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = CONCAT('Invalid status transition from ', current_status, ' to ', p_new_status);
    END IF;
END //
DELIMITER ;
```

### Trigger: after_order_insert (decrement inventory)
```sql
DELIMITER //
CREATE TRIGGER after_order_insert
AFTER INSERT ON OrderItem
FOR EACH ROW
BEGIN
    UPDATE Inventory
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE item_id = NEW.item_id;
END //
DELIMITER ;
```

### Trigger: after_order_status_update (log status changes)
```sql
DELIMITER //
CREATE TRIGGER after_order_status_update
AFTER UPDATE ON Orders
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO OrderLogs (order_id, old_status, new_status, changed_at)
        VALUES (OLD.order_id, OLD.status, NEW.status, NOW());
    END IF;
END //
DELIMITER ;
```

### Sample nested/join/aggregate queries
- Get items for an order with name and cost:
```sql
SELECT m.name, oi.quantity, m.cost
FROM OrderItem oi
JOIN Menu m ON oi.item_id = m.item_id
WHERE oi.order_id = ?;
```
- Total spent per user:
```sql
SELECT user_id, SUM(amount) AS total_spent
FROM Orders
GROUP BY user_id;
```
- daily_revenue_view (already in DDL): groups SUM(amount) by DATE(order_date)

---

## 11. Code snippets for invoking Procedures/Functions/Triggers

### Node.js (mysql2) examples from `backend/src/controllers`

Create order (calls `create_order_with_items`):
```js
const itemsJson = JSON.stringify(items);
const [resultSets] = await pool.query(
  "CALL create_order_with_items(?, ?, ?, ?)",
  [user_id, payment_mode, pickup_time, itemsJson]
);
const orderInfo = resultSets[0]?.[0];
res.status(201).json({
  message: "Order placed successfully",
  order_id: orderInfo?.order_id,
  order_no: orderInfo?.order_no,
  amount: orderInfo?.amount
});
```

Get orders by date (admin) — calls `get_orders_by_date` which returns two result-sets:
```js
const [resultSets] = await pool.query("CALL get_orders_by_date(?)", [date]);
const orders = resultSets[0];
const totalRevenue = resultSets[1]?.[0]?.totalRevenue || 0;
res.json({ date, totalRevenue, orders });
```

Update order status (calls `update_order_status`):
```js
await pool.query("CALL update_order_status(?, ?)", [id, status]);
res.json({ message: "Order status updated successfully" });
```

### MySQL CLI examples
- Create order:
```sql
CALL create_order_with_items(6, 'UPI', '12:30:00', '[{"item_id":1,"quantity":2},{"item_id":3,"quantity":1}]');
```
- Get user orders:
```sql
CALL get_user_orders(6);
```
- Update order status:
```sql
CALL update_order_status(10, 'ready');
```

---

## 12. SQL file

The full SQL used in the project (DDL + procedures + triggers + views) is at the repository root: `fastfeast.sql`.

Path in repository: `/Users/nitinreddy/Desktop/fastfeast/fastfeast.sql`

If you want a cleaned single-file copy named `backend/sql/fastfeast_full.sql` or a version with all omitted lines restored, I can generate and add it to the repo.

---

## 13. GitHub repo link

Repository: nitinreddy / FastFeast
Likely URL: https://github.com/nitinreddy/FastFeast

(Please confirm — if you'd like, I can prepare a release-ready `README.md` or push instructions.)

---

## How to run locally (short checklist)

1. Import DB:
```bash
mysql -u root -p < fastfeast.sql
```

2. Prepare backend `.env` containing (example):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpw
DB_NAME=fastfeast
JWT_SECRET=some_secure_secret
NODE_ENV=development
```

3. Start backend:
```bash
cd backend
npm install
npm run dev # or node src/server.js depending on package.json scripts
```

4. Start frontends:
```bash
cd admin
npm install
npm run dev

cd ../user
npm install
npm run dev
```

5. Use curl/Postman to exercise API endpoints listed in section 8 and capture screenshots.

---

## Files of interest (quick pointers)
- `fastfeast.sql` — full DB DDL and logic (root)
- `backend/src/controllers/` — `orderController.js`, `menuController.js`, `authController.js`, `feedbackController.js`, `adminController.js`
- `backend/src/config/db.js` — DB pool configuration
- `admin/` — admin frontend code
- `user/` — user frontend code

---

## Next steps I can do for you
- Produce a cleaned `backend/sql/fastfeast_full.sql` with all final DDL and procedures (I can add it to repo).
- Generate an image (PNG/SVG) of the ER diagram and add it to the repo.
- Create a Postman collection or a small test script to exercise all endpoints and produce example responses for screenshots.
- Produce a PDF version of this report (I can export Markdown to PDF if you want).

Tell me which of the above you'd like next and I'll proceed.
