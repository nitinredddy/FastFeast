-- ===========================================================
-- UE23CS351A DBMS MINI PROJECT
-- FASTFEAST DATABASE SYSTEM
-- Student: ->Nitin Pradeepkumar Reddy(PES2UG23CS401)	->Poorva Tejas Reddy(PES2UG23CS416)
-- ===========================================================

-- ===========================================================
-- REVIEW 1 & 2 SECTION
-- (Database, Tables, Inserts, Updates, Joins, Grouping)
-- ===========================================================

DROP DATABASE IF EXISTS fastfeast;
CREATE DATABASE fastfeast;
USE fastfeast;

-- -------------------------------
-- TABLE: User
-- -------------------------------
CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role ENUM('admin', 'customer', 'staff') DEFAULT 'customer'
);

-- -------------------------------
-- TABLE: Menu
-- -------------------------------
CREATE TABLE Menu (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    availability BOOLEAN DEFAULT TRUE
);

-- -------------------------------
-- TABLE: Orders
-- -------------------------------
CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    amount DECIMAL(10,2),
    payment_mode VARCHAR(50),
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    pickup_time TIME,
    status ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);


-- -------------------------------
-- TABLE: OrderItem
-- -------------------------------
CREATE TABLE OrderItem (
    order_id INT,
    item_id INT,
    quantity INT DEFAULT 1,
    PRIMARY KEY (order_id, item_id),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES Menu(item_id)
);

-- -------------------------------
-- TABLE: Feedback
-- -------------------------------
CREATE TABLE Feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    item_id INT,
    content TEXT,
    feedback_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (item_id) REFERENCES Menu(item_id)
);

-- -------------------------------
-- TABLE: Inventory
-- -------------------------------
CREATE TABLE Inventory (
    item_id INT,
    stock_quantity INT DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (item_id),
    FOREIGN KEY (item_id) REFERENCES Menu(item_id)
);

SELECT 
    o.order_id,
    o.amount,
    o.payment_mode,
    o.status,
    o.order_date,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'item_id', oi.item_id,
            'name', m.name,
            'quantity', oi.quantity
        )
    ) AS items
FROM Orders o
JOIN OrderItem oi ON o.order_id = oi.order_id
JOIN Menu m ON oi.item_id = m.item_id
WHERE o.user_id = 6  -- 👈 replace this with your actual user_id
GROUP BY o.order_id, o.amount, o.payment_mode, o.status, o.order_date
ORDER BY o.order_date DESC;

select* from Orders;
select* from User;

ALTER TABLE Orders ADD COLUMN order_no INT;

-- ===========================================================
-- ALTERATIONS & UPDATES (REVIEW 2 ADDITIONS)
-- ===========================================================
ALTER TABLE User ADD address VARCHAR(255);
ALTER TABLE Menu CHANGE price cost DECIMAL(10,2);

UPDATE Inventory SET stock_quantity = 40 WHERE item_id = 1;
SELECT * FROM Inventory;

-- ===========================================================
-- JOINS & GROUPING QUERIES (REVIEW 2)
-- ===========================================================
CREATE VIEW OrderDetails AS
SELECT 
    o.order_id,
    u.name AS customer_name,
    o.amount,
    o.payment_mode,
    o.status,
    o.order_date
FROM Orders o
JOIN User u ON o.user_id = u.user_id;

SELECT * FROM OrderDetails;
SELECT * FROM OrderDetails WHERE status = 'completed';

SELECT User.name, Orders.order_id, Orders.amount
FROM User
LEFT JOIN Orders ON User.user_id = Orders.user_id;

SELECT user_id, SUM(amount) AS total_spent
FROM Orders
GROUP BY user_id;

-- ===========================================================
-- 🚀 REVIEW 3 (UNIT 3) SECTION BEGINS HERE
-- ===========================================================
-- (Triggers, Procedures, Functions, Views, Analytical Queries)
-- ===========================================================

-- -------------------------------
-- ADD CHECK CONSTRAINTS
-- -------------------------------
ALTER TABLE Menu ADD CHECK (cost > 0);
ALTER TABLE OrderItem ADD CHECK (quantity > 0);
ALTER TABLE Inventory ADD CHECK (stock_quantity >= 0);

-- ===========================================================
-- 🚀 FASTFEAST: BACKEND-INTEGRATED DB LOGIC
-- (Triggers | Procedures | Functions | Views)
-- ===========================================================

-- ===========================================================
-- 🧮 FUNCTION: calculate_order_total
-- Calculates total price for an order (used internally)
-- ===========================================================
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


-- ===========================================================
-- 🧾 PROCEDURE 1: create_order_with_items
-- Inserts a new order and order items using a JSON array
-- ===========================================================
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

    -- Get today's order count
    SELECT COUNT(*) + 1 INTO p_order_no
    FROM Orders
    WHERE DATE(order_date) = today;

    -- Create new order
    INSERT INTO Orders (user_id, amount, payment_mode, pickup_time, order_no, status)
    VALUES (p_user_id, 0, p_payment_mode, p_pickup_time, p_order_no, 'preparing');

    SET p_order_id = LAST_INSERT_ID();

    -- Insert order items from JSON input
    INSERT INTO OrderItem (order_id, item_id, quantity)
    SELECT p_order_id, jt.item_id, jt.quantity
    FROM JSON_TABLE(p_items_json, '$[*]'
        COLUMNS (
            item_id INT PATH '$.item_id',
            quantity INT PATH '$.quantity'
        )
    ) AS jt;

    -- Calculate total
    SELECT calculate_order_total(p_order_id) INTO p_amount;

    -- Update order total
    UPDATE Orders SET amount = p_amount WHERE order_id = p_order_id;

    -- Return output
    SELECT p_order_id AS order_id, p_order_no AS order_no, p_amount AS amount;
END //
DELIMITER ;


-- ===========================================================
-- 🔁 PROCEDURE 2: update_order_status
-- Safely updates order status (valid transitions only)
-- ===========================================================
DELIMITER //
CREATE PROCEDURE update_order_status(IN p_order_id INT, IN p_new_status VARCHAR(20))
BEGIN
    DECLARE current_status VARCHAR(20);

    SELECT status INTO current_status FROM Orders WHERE order_id = p_order_id;

    IF current_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order not found';
    END IF;

    -- Allow only logical transitions
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


-- ===========================================================
-- 👤 PROCEDURE 3: get_user_orders
-- Returns all orders for a specific user (for “My Orders”)
-- ===========================================================
DELIMITER //
CREATE PROCEDURE get_user_orders(IN p_user_id INT)
BEGIN
    SELECT 
        o.order_id,
        o.order_no,
        o.amount,
        o.payment_mode,
        o.status,
        o.order_date,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'item_id', oi.item_id,
                'name', m.name,
                'quantity', oi.quantity
            )
        ) AS items
    FROM Orders o
    JOIN OrderItem oi ON o.order_id = oi.order_id
    JOIN Menu m ON oi.item_id = m.item_id
    WHERE o.user_id = p_user_id
    GROUP BY o.order_id, o.order_no, o.amount, o.payment_mode, o.status, o.order_date
    ORDER BY o.order_date DESC;
END //
DELIMITER ;


-- ===========================================================
-- 📅 PROCEDURE 4: get_orders_by_date
-- Fetches orders and total revenue for a specific day (admin)
-- ===========================================================
DELIMITER //
CREATE PROCEDURE get_orders_by_date(IN p_date DATE)
BEGIN
    -- Fetch orders
    SELECT 
        o.order_id,
        o.order_no,
        o.user_id,
        u.name AS customer_name,
        o.amount,
        o.status,
        o.payment_mode,
        o.order_date
    FROM Orders o
    JOIN User u ON o.user_id = u.user_id
    WHERE DATE(o.order_date) = p_date
    ORDER BY o.order_no ASC;

    -- Calculate total revenue for completed orders
    SELECT COALESCE(SUM(amount), 0) AS totalRevenue
    FROM Orders
    WHERE DATE(order_date) = p_date AND status = 'completed';
END //
DELIMITER ;


-- ===========================================================
-- ⚙️ TRIGGER 1: after_order_insert
-- Automatically decreases stock when new order item is added
-- ===========================================================
DELIMITER //
CREATE TRIGGER after_order_insert
AFTER INSERT ON OrderItem
FOR EACH ROW
BEGIN
    UPDATE Inventory
    SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity)
    WHERE item_id = NEW.item_id;
END //
DELIMITER ;


-- ===========================================================
-- ⚙️ TRIGGER 2: after_order_status_update
-- Logs order status changes into OrderLogs
-- ===========================================================
CREATE TABLE IF NOT EXISTS OrderLogs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);

DELIMITER //
CREATE TRIGGER after_order_status_update
AFTER UPDATE ON Orders
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO OrderLogs (order_id, old_status, new_status)
        VALUES (NEW.order_id, OLD.status, NEW.status);
    END IF;
END //
DELIMITER ;


-- ===========================================================
-- 👁️ VIEW 1: daily_revenue_view
-- Summarizes revenue per day for admin dashboard
-- ===========================================================
CREATE OR REPLACE VIEW daily_revenue_view AS
SELECT 
    DATE(order_date) AS order_day,
    COUNT(order_id) AS total_orders,
    SUM(amount) AS total_revenue
FROM Orders
WHERE status = 'completed'
GROUP BY DATE(order_date)
ORDER BY order_day DESC;


-- ===========================================================
-- 👁️ VIEW 2: user_orders_view
-- Provides user-wise order history for admin queries
-- ===========================================================
CREATE OR REPLACE VIEW user_orders_view AS
SELECT 
    u.user_id,
    u.name AS customer_name,
    o.order_id,
    o.order_no,
    o.amount,
    o.status,
    o.payment_mode,
    o.order_date
FROM Orders o
JOIN User u ON o.user_id = u.user_id
ORDER BY o.order_date DESC;

-- ===========================================================
-- ✅ END OF BACKEND-INTEGRATED SECTION
-- ===========================================================
