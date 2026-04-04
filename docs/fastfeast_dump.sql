USE fastfeast;

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM Feedback;
DELETE FROM OrderLogs;
DELETE FROM OrderItem;
DELETE FROM Payments;
DELETE FROM Inventory;
DELETE FROM Orders;
DELETE FROM Menu;
DELETE FROM User;
DELETE FROM BusinessSettings;

ALTER TABLE Feedback AUTO_INCREMENT = 1;
ALTER TABLE OrderLogs AUTO_INCREMENT = 1;
ALTER TABLE Orders AUTO_INCREMENT = 1;
ALTER TABLE Payments AUTO_INCREMENT = 1;
ALTER TABLE Menu AUTO_INCREMENT = 1;
ALTER TABLE User AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- Demo login notes for seeded admin accounts:
-- admin@fastfeast.com  -> password: Admin@123
-- admin123@fastfeast.com -> password: Admin@123
-- admin12345@gmail.com -> password: admin12345
-- These values are documented here for local/demo imports only.
INSERT INTO User (user_id, name, email, password, phone, role) VALUES
(1,'Nitin Reddy','nitin@example.com','$2b$10$HYwo.3IIQ7hx8xhbMAk1TeUAmL2jOyF1YNvZ7VPtWdvxinb6vGfDa','9876543210','customer'),
(2,'Santosh Malhotra','santosh@example.com','$2b$10$HgWkxCNoUapa5r886h/p2eu1nOruovXDvSLivbQ9C/NBOpUxBkBEe','9876543201','admin'),
(3,'Staff 1','staff1@example.com','$2b$10$bsyFxwYhSQMnWD4iJob8QO4F.F4n4bPdAYKXSL3D/Ifih5IXZwC2u','9876543021','staff'),
(4,'Staff 2','staff2@example.com','$2b$10$ykPCFY4miVXB2TKf/TUAr.ydpXMUjX1Uj7cCe28OVHeVab1rIA47i','9876540321','staff'),
(5,'Staff 3','staff3@example.com','$2b$10$XIpv3xk3U0DkfTKZN4kP.e6JTv3r0NoCBZvBPHcP6ycJkYlbwZbWS','9876504321','staff'),
(6,'Nitin Reddy','nitinreddy095@gmail.com','$2b$10$UCQ5xjsKffsO4Xp/sPhAN.C1F0dsWb5REVNM51lm5lGlz5chomT06','9021049917','customer'),
(7,'Pavan Saxena','meetpavansaxena@gmail.com','$2b$10$AIgFwuUcooDUI1f3kElIje0J6hHidmOzjFWqMv.Ayz1V2PRlCXGB6','','customer'),
(8,'Canteen Admin','admin@fastfeast.com','$2b$10$bTVn9ffqdwF.4DTweqxkNeg7q7yINZ9p9mQKceqzFs5e3IC875Iwm','9876543210','admin'),
(10,'Canteen Admin','admin123@fastfeast.com','$2b$10$bTVn9ffqdwF.4DTweqxkNeg7q7yINZ9p9mQKceqzFs5e3IC875Iwm','9876543210','admin'),
(11,'Canteen Admin','admin1234@fastfeast.com','$2b$10$3xdY30MML0/ImuIearSo0.BH3RYVKlXiH9PZtUJZgbnDS.PM0Vhlu','9876543210','admin'),
(12,'Nitin Reddy','nitin@fastfeast.com','$2b$10$I4HlbbinogRBKDIvg/Y8H.oG/f3qzn4ZbR8TXkAvWHgmgWbzxVBeu','','admin'),
(13,'Poorva Tejas Reddy','poorva@ex.com','$2b$10$C6rH2Eo4mWbUqmqSvGIglu/xnlFEzVeukKb.U.H7Z4zSLsRKxYd2.','','customer'),
(14,'poorva','poorva@gmail.com','$2b$10$0uqDd3r0.E1MoPNw5E3aEOBO1LGO9reTT.uQdYV0U8MGLu5a7EHDq','','customer'),
(15,'user','user@gmail.com','$2b$10$bD6d4mk0sTM7CEhoQSosTuT0Vmu8V9DmsR3Qci2EEIb3mDDOgv7Ny','','customer'),
(16,'vinodha','vinodha@gmail.com','$2b$10$WIXzDfAwPwJSjblQKRHht.kXRorAmqMQ4vIcUGGB/Ir5uWyBIyKOO','','customer'),
(17,'Mighty Raju','raju@gmail.com','$2b$10$DPpD0lglc1x35kGPb.Uzl.z2mdXsNnbjesf51GEp96xuK4S7ljs.G','9876543017','customer'),
(120,'Harshith','harshith@gmail.com','$2a$10$2lbFjx83pl5JnSfNmLL6.Os3cJTHVuN0WemAoraMOPj.imTUZdK62','9876543120','admin'),
(121,'nitin','nitin12345@mail.com','$2b$10$8wgdywqlQWY60KmGtvT.I.pENjxDb0vnhl6Awsrw2zqhTOZd0cA.6','','customer'),
(122,'Nitin Reddy','nitinreddy0956@gmail.com','$2b$10$RnFG3oahQqidZh7JB.4Nl.rdSSWRCCMhfXLEjbS40pGJKq4gaqG6.','09021049917','customer'),
(125,'Admin User','admin12345@gmail.com','$2a$10$O70qP3RSJ6ROYhLxp7eB4.8FeTuft4ip5nzqMOAxW6QV7JJ9UdIQi','9876543125','admin'),
(126,'Nitin Reddy','pes2ug23cs401@pesu.pes.edu','$2b$10$Bl6AFon6lLKY8BthEnmF3ePzMLJptB/zD6W8492B0YxDVIxDEk20q','7758850549','customer'),
(127,'Nitin Reddy','killer@gmail.com','$2b$10$IYbgX6i6xpDWR6TSNh0Pi.zmoqsJFzG/8y0me1x7H7ADYmsBzkx3u','9021049917','customer');

INSERT INTO Menu (item_id, name, cost, availability, category) VALUES
(1,'Idli (2 pcs)',25.00,1,'Breakfast'),
(2,'Vada (2 pcs)',30.00,1,'Breakfast'),
(3,'Masala Dosa',45.00,1,'Breakfast'),
(4,'Plain Dosa',40.00,1,'Breakfast'),
(5,'Upma',25.00,1,'Breakfast'),
(6,'Poori Bhaji',40.00,1,'Breakfast'),
(7,'Pongal',35.00,1,'Breakfast'),
(8,'Paratha with Curd',35.00,1,'Breakfast'),
(9,'Veg Meals',70.00,1,'Lunch'),
(10,'South Indian Thali',90.00,1,'Lunch'),
(11,'North Indian Thali',100.00,1,'Lunch'),
(12,'Chapati with Curry',45.00,1,'Lunch'),
(13,'Veg Biryani',80.00,1,'Lunch'),
(14,'Curd Rice',50.00,1,'Lunch'),
(15,'Tomato Rice',45.00,1,'Lunch'),
(16,'Fried Rice',75.00,1,'Lunch'),
(17,'Paneer Butter Masala with Rice',110.00,1,'Lunch'),
(18,'Dal Tadka with Jeera Rice',85.00,1,'Lunch'),
(19,'Samosa (2 pcs)',25.00,1,'Snacks'),
(20,'Aloo Bonda',20.00,1,'Snacks'),
(21,'Cutlet',25.00,1,'Snacks'),
(22,'Paneer Roll',45.00,1,'Snacks'),
(23,'Veg Sandwich',40.00,1,'Snacks'),
(24,'Grilled Cheese Sandwich',50.00,1,'Snacks'),
(25,'French Fries',40.00,1,'Snacks'),
(26,'Maggie Noodles',35.00,1,'Snacks'),
(27,'Masala Maggie',40.00,1,'Snacks'),
(28,'Tea',15.00,1,'Beverages'),
(29,'Coffee',20.00,1,'Beverages'),
(30,'Cold Coffee',35.00,1,'Beverages'),
(31,'Lassi',30.00,1,'Beverages'),
(32,'Butter Milk',20.00,1,'Beverages'),
(33,'Fresh Lime Soda',25.00,1,'Beverages'),
(34,'Mango Milkshake',40.00,1,'Beverages'),
(35,'Banana Milkshake',60.00,1,'Beverages'),
(36,'Chocolate Milkshake',45.00,1,'Beverages'),
(37,'Mineral Water Bottle',20.00,1,'Beverages'),
(38,'Gulab Jamun (2 pcs)',30.00,1,'Desserts'),
(39,'Rasgulla (2 pcs)',35.00,1,'Desserts'),
(40,'Ice Cream Cup',40.00,1,'Desserts'),
(41,'Fruit Salad',45.00,1,'Desserts'),
(42,'Payasam',35.00,1,'Desserts'),
(43,'Brownie with Ice Cream',70.00,1,'Desserts'),
(44,'Dal chawal',120.00,1,'Lunch'),
(45,'Onion Masala Dosa',50.00,1,'Breakfast'),
(47,'sambhar rice',50.00,1,'Lunch'),
(48,'Strawberry milkshake',70.00,1,'Beverages');

REPLACE INTO BusinessSettings (settings_id, ordering_enabled, payments_enabled, open_hour_start, open_hour_end)
VALUES (1, TRUE, TRUE, 8, 22);

INSERT INTO Orders (
  order_id, user_id, canteen_id, order_no, amount, payment_mode, order_date, pickup_time,
  status, payment_status, razorpay_order_id, razorpay_payment_id, razorpay_signature,
  payment_expires_at, payment_verified_at, payment_failure_reason
) VALUES
(1,12,1,NULL,150.00,'UPI','2025-11-07 01:16:27',NULL,'pending','pending',NULL,NULL,NULL,NULL,NULL,NULL),
(2,12,1,NULL,100.00,'UPI','2025-11-07 08:03:46',NULL,'pending','pending',NULL,NULL,NULL,NULL,NULL,NULL),
(3,12,1,NULL,55.00,'UPI','2025-11-07 09:34:04',NULL,'pending','pending',NULL,NULL,NULL,NULL,NULL,NULL),
(4,12,1,NULL,20.00,'UPI','2025-11-07 10:52:33',NULL,'ready','pending',NULL,NULL,NULL,NULL,NULL,NULL),
(5,12,1,NULL,85.00,'UPI','2025-11-07 21:12:17',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(6,6,1,NULL,105.00,'UPI','2025-11-07 21:53:22',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(7,6,1,NULL,100.00,'UPI','2025-11-07 22:00:47',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(8,6,1,1,155.00,'UPI','2025-11-08 12:30:00',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(9,6,1,2,50.00,'UPI','2025-11-08 13:46:05',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(10,6,1,3,65.00,'UPI','2025-11-08 13:51:59',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(11,6,1,4,200.00,'UPI','2025-11-08 14:15:01',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(12,6,1,5,45.00,'UPI','2025-11-08 14:16:12',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(13,6,1,6,45.00,'UPI','2025-11-08 14:59:57',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(14,6,1,7,65.00,'UPI','2025-11-08 15:23:19',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(15,13,1,8,90.00,'UPI','2025-11-08 15:23:56',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(16,6,1,1,75.00,'UPI','2025-11-09 16:42:51',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(17,14,1,1,170.00,'UPI','2025-11-10 12:59:20',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(18,14,1,2,55.00,'UPI','2025-11-10 13:02:42',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(19,15,1,3,85.00,'UPI','2025-11-10 13:21:03',NULL,'preparing','pending',NULL,NULL,NULL,NULL,NULL,NULL),
(20,15,1,1,0.00,'UPI','2025-11-12 23:09:47',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(21,15,1,2,0.00,'UPI','2025-11-12 23:09:50',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(22,15,1,3,0.00,'UPI','2025-11-12 23:12:31',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(23,15,1,4,80.00,'UPI','2025-11-12 23:42:58',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(24,15,1,5,60.00,'UPI','2025-11-12 23:43:30',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(25,15,1,6,90.00,'UPI','2025-11-12 23:45:17',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(26,15,1,7,85.00,'UPI','2025-11-12 23:50:31',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(27,15,1,8,185.00,'UPI','2025-11-12 23:51:13',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(28,15,1,1,60.00,'UPI','2025-11-13 00:52:36',NULL,'cancelled','cancelled',NULL,NULL,NULL,NULL,NULL,NULL),
(29,15,1,2,100.00,'UPI','2025-11-13 01:00:26',NULL,'cancelled','cancelled',NULL,NULL,NULL,NULL,NULL,NULL),
(30,15,1,3,60.00,'UPI','2025-11-13 01:03:13',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(31,15,1,4,75.00,'UPI','2025-11-13 01:06:58',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(32,16,1,1,85.00,'UPI','2025-11-17 13:21:02',NULL,'cancelled','cancelled',NULL,NULL,NULL,NULL,NULL,NULL),
(33,16,1,2,120.00,'UPI','2025-11-17 13:27:43',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(34,16,1,3,70.00,'UPI','2025-11-17 13:30:49',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(35,16,1,4,95.00,'UPI','2025-11-17 13:31:50',NULL,'cancelled','cancelled',NULL,NULL,NULL,NULL,NULL,NULL),
(36,16,1,1,120.00,'UPI','2025-11-18 09:17:20',NULL,'preparing','pending',NULL,NULL,NULL,NULL,NULL,NULL),
(37,120,1,1,65.00,'UPI','2026-01-08 21:18:11',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(38,125,1,1,85.00,'UPI','2026-04-03 21:54:39',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(39,126,1,2,65.00,'UPI','2026-04-03 22:37:57',NULL,'completed','paid',NULL,NULL,NULL,NULL,NULL,NULL),
(40,122,1,1,80.00,'Razorpay','2026-04-04 02:13:08',NULL,'completed','paid','order_SZ9jCJtjhr7Xn8','pay_SZ9l1yCUOBg8KT','82c3b71e312b7c9e7daba62f3daa3d897c6510a708dd32bc90b0466cb02be1e4','2026-04-04 02:28:08','2026-04-04 02:15:16',NULL),
(41,122,1,2,195.00,'Razorpay','2026-04-04 11:39:49',NULL,'cancelled','failed','order_SZJNnXF9UyfGp8',NULL,NULL,'2026-04-04 11:54:49',NULL,'You have entered an incorrect CVV number. Try again.');

INSERT INTO Feedback (feedback_id, user_id, item_id, content, feedback_date) VALUES
(1,125,36,'too chocolaty','2026-04-04 01:49:02');

INSERT INTO OrderItem (order_id, item_id, quantity) VALUES
(1,6,1),(1,29,1),(1,36,2),(2,32,1),(2,35,1),(2,36,1),(3,32,1),(3,35,1),(4,29,1),(5,29,1),(5,32,1),(5,36,1),(6,29,1),(6,34,1),(6,36,1),(7,32,1),(7,35,1),(7,36,1),(8,3,1),(8,29,1),(8,36,2),(9,1,1),(9,33,1),(10,32,1),(10,36,1),(11,10,1),(11,17,1),(12,32,1),(12,33,1),(13,32,1),(13,33,1),(14,32,1),(14,36,1),(15,30,1),(15,35,1),(15,37,1),(16,31,1),(16,32,1),(16,33,1),(17,1,1),(17,13,1),(17,32,1),(17,36,1),(18,32,1),(18,35,1),(19,29,1),(19,32,1),(19,36,1),(20,32,1),(20,35,1),(20,36,1),(21,32,1),(21,35,1),(21,36,1),(22,32,1),(22,35,1),(22,36,1),(23,32,1),(23,33,1),(23,35,1),(24,28,1),(24,32,1),(24,33,1),(25,30,1),(25,35,1),(25,37,1),(26,1,1),(26,33,1),(26,35,1),(27,4,3),(27,28,1),(27,31,1),(27,32,1),(28,28,1),(28,32,1),(28,33,1),(29,30,1),(29,33,1),(29,35,1),(30,32,1),(30,35,1),(31,4,1),(31,8,1),(32,29,1),(32,32,1),(32,36,1),(33,1,1),(33,3,1),(33,45,1),(34,32,1),(34,35,1),(35,31,1),(35,32,1),(35,36,1),(36,33,1),(36,35,1),(36,36,1),(37,32,1),(37,36,1),(38,32,2),(38,36,1),(39,32,1),(39,36,1),(40,32,1),(40,35,1),(41,17,1),(41,18,1);

INSERT INTO OrderLogs (log_id, order_id, old_status, new_status, changed_at) VALUES
(1,20,'preparing','completed','2025-11-12 23:11:35'),
(2,23,'preparing','completed','2025-11-12 23:43:12'),
(3,21,'preparing','completed','2025-11-12 23:43:15'),
(4,22,'preparing','completed','2025-11-12 23:43:16'),
(5,24,'preparing','completed','2025-11-12 23:45:31'),
(6,25,'preparing','completed','2025-11-12 23:45:33'),
(7,26,'preparing','completed','2025-11-12 23:51:29'),
(8,27,'preparing','completed','2025-11-12 23:51:30'),
(9,28,'preparing','cancelled','2025-11-13 00:57:24'),
(10,29,'preparing','cancelled','2025-11-13 01:00:43'),
(11,30,'preparing','completed','2025-11-13 01:03:27'),
(12,31,'preparing','completed','2025-11-13 01:30:13'),
(13,32,'preparing','cancelled','2025-11-17 13:25:09'),
(14,33,'preparing','completed','2025-11-17 13:27:59'),
(15,34,'preparing','completed','2025-11-17 13:31:28'),
(16,35,'preparing','cancelled','2025-11-17 13:33:27'),
(17,37,'preparing','completed','2026-01-08 21:18:27'),
(18,38,'preparing','ready','2026-04-03 21:55:29'),
(19,38,'ready','completed','2026-04-03 21:55:31'),
(20,39,'preparing','completed','2026-04-03 22:44:38'),
(21,40,'pending','preparing','2026-04-04 02:15:16'),
(22,40,'preparing','completed','2026-04-04 11:22:24'),
(23,41,'pending','cancelled','2026-04-04 11:40:08');

DELETE FROM Inventory;

INSERT INTO Inventory (item_id, stock_quantity, last_updated) VALUES
(1,18,'2026-04-04 12:01:58'),
(2,14,'2026-04-04 12:01:58'),
(3,10,'2026-04-04 12:01:58'),
(4,9,'2026-04-04 12:01:58'),
(5,12,'2026-04-04 12:01:58'),
(6,8,'2026-04-04 12:01:58'),
(7,7,'2026-04-04 12:01:58'),
(8,6,'2026-04-04 12:01:58'),
(9,15,'2026-04-04 12:01:58'),
(10,11,'2026-04-04 12:01:58'),
(11,9,'2026-04-04 12:01:58'),
(12,13,'2026-04-04 12:01:58'),
(13,10,'2026-04-04 12:01:58'),
(14,16,'2026-04-04 12:01:58'),
(15,12,'2026-04-04 12:01:58'),
(16,8,'2026-04-04 12:01:58'),
(17,5,'2026-04-04 12:01:58'),
(18,7,'2026-04-04 12:01:58'),
(19,20,'2026-04-04 12:01:58'),
(20,17,'2026-04-04 12:01:58'),
(21,14,'2026-04-04 12:01:58'),
(22,9,'2026-04-04 12:01:58'),
(23,11,'2026-04-04 12:01:58'),
(24,10,'2026-04-04 12:01:58'),
(25,13,'2026-04-04 12:01:58'),
(26,15,'2026-04-04 12:01:58'),
(27,12,'2026-04-04 12:01:58'),
(28,25,'2026-04-04 12:01:58'),
(29,22,'2026-04-04 12:01:58'),
(30,10,'2026-04-04 12:01:58'),
(31,11,'2026-04-04 12:01:58'),
(32,18,'2026-04-04 12:01:58'),
(33,16,'2026-04-04 12:01:58'),
(34,9,'2026-04-04 12:01:58'),
(35,8,'2026-04-04 12:01:58'),
(36,7,'2026-04-04 12:01:58'),
(37,30,'2026-04-04 12:01:58'),
(38,12,'2026-04-04 12:01:58'),
(39,10,'2026-04-04 12:01:58'),
(40,14,'2026-04-04 12:01:58'),
(41,9,'2026-04-04 12:01:58'),
(42,8,'2026-04-04 12:01:58'),
(43,6,'2026-04-04 12:01:58'),
(44,7,'2026-04-04 12:01:58'),
(45,8,'2026-04-04 12:01:58'),
(47,10,'2026-04-04 12:01:58'),
(48,10,'2026-04-03 23:11:17');

INSERT INTO Payments (
  order_id,
  user_id,
  provider,
  provider_order_id,
  provider_payment_id,
  provider_signature,
  amount,
  currency,
  status,
  refund_status,
  failure_reason,
  expires_at,
  verified_at
)
SELECT
  o.order_id,
  o.user_id,
  CASE
    WHEN o.payment_mode = 'Razorpay' THEN 'razorpay'
    ELSE LOWER(COALESCE(o.payment_mode, 'manual'))
  END AS provider,
  o.razorpay_order_id,
  o.razorpay_payment_id,
  o.razorpay_signature,
  COALESCE(o.amount, 0),
  'INR',
  CASE
    WHEN o.status = 'cancelled' AND COALESCE(o.payment_status, 'pending') = 'paid' THEN 'paid'
    WHEN o.status = 'cancelled' THEN 'cancelled'
    ELSE COALESCE(o.payment_status, 'paid')
  END AS status,
  'none',
  o.payment_failure_reason,
  o.payment_expires_at,
  o.payment_verified_at
FROM Orders o;

UPDATE Payments
SET status = 'refunded',
    refund_status = 'processed',
    refund_id = 'rfnd_ff_28',
    refund_amount = 60.00,
    refund_failure_reason = NULL,
    refunded_at = '2025-11-13 01:07:30'
WHERE order_id = 28;

UPDATE Payments
SET status = 'paid',
    refund_status = 'pending',
    refund_failure_reason = NULL
WHERE order_id = 29;

UPDATE Payments
SET status = 'paid',
    refund_status = 'failed',
    refund_failure_reason = 'Gateway timeout during refund retry'
WHERE order_id = 35;
