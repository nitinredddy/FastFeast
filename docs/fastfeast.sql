DROP DATABASE IF EXISTS fastfeast;
CREATE DATABASE fastfeast;
USE fastfeast;

CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role ENUM('admin', 'customer', 'staff') DEFAULT 'customer'
);

CREATE TABLE Menu (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    availability BOOLEAN DEFAULT TRUE,
    CHECK (cost > 0)
);

CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    order_no INT,
    amount DECIMAL(10,2),
    payment_mode VARCHAR(50),
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    pickup_time TIME,
    status ENUM('pending', 'preparing', 'ready', 'completed', 'cancelled') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES User(user_id)
);

CREATE TABLE OrderItem (
    order_id INT,
    item_id INT,
    quantity INT DEFAULT 1,
    PRIMARY KEY (order_id, item_id),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES Menu(item_id),
    CHECK (quantity > 0)
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

CREATE TABLE Inventory (
    item_id INT PRIMARY KEY,
    stock_quantity INT DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES Menu(item_id),
    CHECK (stock_quantity >= 0)
);

CREATE TABLE OrderLogs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);

INSERT INTO User (name, email, password, phone, role)
VALUES (
    'FastFeast Admin',
    'admin@fastfeast.local',
    '$2b$10$bTVn9ffqdwF.4DTweqxkNeg7q7yINZ9p9mQKceqzFs5e3IC875Iwm',
    '9999999999',
    'admin'
);

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

    SELECT COUNT(*) + 1
    INTO p_order_no
    FROM Orders
    WHERE DATE(order_date) = today;

    INSERT INTO Orders (user_id, amount, payment_mode, pickup_time, order_no, status)
    VALUES (p_user_id, 0, p_payment_mode, p_pickup_time, p_order_no, 'pending');

    SET p_order_id = LAST_INSERT_ID();

    INSERT INTO OrderItem (order_id, item_id, quantity)
    SELECT p_order_id, jt.item_id, jt.quantity
    FROM JSON_TABLE(
        p_items_json,
        '$[*]' COLUMNS (
            item_id INT PATH '$.item_id',
            quantity INT PATH '$.quantity'
        )
    ) AS jt;

    SELECT calculate_order_total(p_order_id) INTO p_amount;

    UPDATE Orders
    SET amount = p_amount
    WHERE order_id = p_order_id;

    SELECT p_order_id AS order_id, p_order_no AS order_no, p_amount AS amount;
END //

CREATE PROCEDURE update_order_status(IN p_order_id INT, IN p_new_status VARCHAR(20))
BEGIN
    DECLARE current_status VARCHAR(20);
    DECLARE error_message VARCHAR(255);

    SELECT status
    INTO current_status
    FROM Orders
    WHERE order_id = p_order_id;

    IF current_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order not found';
    END IF;

    IF (
        (current_status = 'pending' AND p_new_status IN ('preparing', 'cancelled')) OR
        (current_status = 'preparing' AND p_new_status IN ('ready', 'cancelled')) OR
        (current_status = 'ready' AND p_new_status = 'completed')
    ) THEN
        UPDATE Orders
        SET status = p_new_status
        WHERE order_id = p_order_id;
    ELSE
        SET error_message = CONCAT('Invalid status transition from ', current_status, ' to ', p_new_status);
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = error_message;
    END IF;
END //

CREATE PROCEDURE cancel_order(IN p_order_id INT)
BEGIN
    DECLARE current_status VARCHAR(20);

    SELECT status
    INTO current_status
    FROM Orders
    WHERE order_id = p_order_id;

    IF current_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Order not found';
    END IF;

    IF current_status IN ('pending', 'preparing') THEN
        UPDATE Orders
        SET status = 'cancelled'
        WHERE order_id = p_order_id;
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Only pending or preparing orders can be cancelled';
    END IF;
END //

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

CREATE PROCEDURE get_orders_by_date(IN p_date DATE)
BEGIN
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

    SELECT COALESCE(SUM(amount), 0) AS totalRevenue
    FROM Orders
    WHERE DATE(order_date) = p_date AND status = 'completed';
END //

CREATE TRIGGER after_order_insert
AFTER INSERT ON OrderItem
FOR EACH ROW
BEGIN
    UPDATE Inventory
    SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity)
    WHERE item_id = NEW.item_id;
END //

CREATE TRIGGER after_menu_insert
AFTER INSERT ON Menu
FOR EACH ROW
BEGIN
    INSERT INTO Inventory (item_id, stock_quantity)
    VALUES (NEW.item_id, 0);
END //

CREATE TRIGGER after_order_status_update
AFTER UPDATE ON Orders
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO OrderLogs (order_id, old_status, new_status)
        VALUES (NEW.order_id, OLD.status, NEW.status);
    END IF;
END //

CREATE FUNCTION CalculateDiscount(p_amount DECIMAL(10,2))
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    IF p_amount >= 500 THEN
        RETURN ROUND(p_amount * 0.10, 2);
    ELSEIF p_amount >= 250 THEN
        RETURN ROUND(p_amount * 0.05, 2);
    END IF;

    RETURN 0;
END //

CREATE PROCEDURE GetUserTotalSpent(IN p_user_id INT)
BEGIN
    SELECT
        p_user_id AS user_id,
        COALESCE(SUM(amount), 0) AS total_spent
    FROM Orders
    WHERE user_id = p_user_id
      AND status = 'completed';
END //

DELIMITER ;

CREATE OR REPLACE VIEW daily_revenue_view AS
SELECT
    DATE(order_date) AS order_day,
    COUNT(order_id) AS total_orders,
    SUM(amount) AS total_revenue
FROM Orders
WHERE status = 'completed'
GROUP BY DATE(order_date)
ORDER BY order_day DESC;

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
