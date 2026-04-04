-- MySQL dump 10.13  Distrib 9.4.0, for macos15.4 (arm64)
--
-- Host: localhost    Database: fastfeast
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary view structure for view `daily_revenue_view`
--

DROP TABLE IF EXISTS `daily_revenue_view`;
/*!50001 DROP VIEW IF EXISTS `daily_revenue_view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `daily_revenue_view` AS SELECT 
 1 AS `order_day`,
 1 AS `total_orders`,
 1 AS `total_revenue`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `Feedback`
--

DROP TABLE IF EXISTS `Feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Feedback` (
  `feedback_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `item_id` int DEFAULT NULL,
  `content` text,
  `feedback_date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`feedback_id`),
  KEY `user_id` (`user_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`),
  CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `Menu` (`item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Feedback`
--

LOCK TABLES `Feedback` WRITE;
/*!40000 ALTER TABLE `Feedback` DISABLE KEYS */;
INSERT INTO `Feedback` VALUES (1,125,36,'too chocolaty','2026-04-04 01:49:02');
/*!40000 ALTER TABLE `Feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Inventory`
--

DROP TABLE IF EXISTS `Inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Inventory` (
  `item_id` int NOT NULL,
  `stock_quantity` int DEFAULT '0',
  `last_updated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_id`),
  CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `Menu` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Inventory`
--

LOCK TABLES `Inventory` WRITE;
/*!40000 ALTER TABLE `Inventory` DISABLE KEYS */;
INSERT INTO `Inventory` VALUES (48,10,'2026-04-03 23:11:17');
/*!40000 ALTER TABLE `Inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Menu`
--

DROP TABLE IF EXISTS `Menu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Menu` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `availability` tinyint(1) DEFAULT '1',
  `category` varchar(50) DEFAULT 'Uncategorized',
  PRIMARY KEY (`item_id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Menu`
--

LOCK TABLES `Menu` WRITE;
/*!40000 ALTER TABLE `Menu` DISABLE KEYS */;
INSERT INTO `Menu` VALUES (1,'Idli (2 pcs)',25.00,1,'Breakfast'),(2,'Vada (2 pcs)',30.00,1,'Breakfast'),(3,'Masala Dosa',45.00,1,'Breakfast'),(4,'Plain Dosa',40.00,1,'Breakfast'),(5,'Upma',25.00,1,'Breakfast'),(6,'Poori Bhaji',40.00,1,'Breakfast'),(7,'Pongal',35.00,1,'Breakfast'),(8,'Paratha with Curd',35.00,1,'Breakfast'),(9,'Veg Meals',70.00,1,'Lunch'),(10,'South Indian Thali',90.00,1,'Lunch'),(11,'North Indian Thali',100.00,1,'Lunch'),(12,'Chapati with Curry',45.00,1,'Lunch'),(13,'Veg Biryani',80.00,1,'Lunch'),(14,'Curd Rice',50.00,1,'Lunch'),(15,'Tomato Rice',45.00,1,'Lunch'),(16,'Fried Rice',75.00,1,'Lunch'),(17,'Paneer Butter Masala with Rice',110.00,1,'Lunch'),(18,'Dal Tadka with Jeera Rice',85.00,1,'Lunch'),(19,'Samosa (2 pcs)',25.00,1,'Snacks'),(20,'Aloo Bonda',20.00,1,'Snacks'),(21,'Cutlet',25.00,1,'Snacks'),(22,'Paneer Roll',45.00,1,'Snacks'),(23,'Veg Sandwich',40.00,1,'Snacks'),(24,'Grilled Cheese Sandwich',50.00,1,'Snacks'),(25,'French Fries',40.00,1,'Snacks'),(26,'Maggie Noodles',35.00,1,'Snacks'),(27,'Masala Maggie',40.00,1,'Snacks'),(28,'Tea',15.00,1,'Beverages'),(29,'Coffee',20.00,1,'Beverages'),(30,'Cold Coffee',35.00,1,'Beverages'),(31,'Lassi',30.00,1,'Beverages'),(32,'Butter Milk',20.00,1,'Beverages'),(33,'Fresh Lime Soda',25.00,1,'Beverages'),(34,'Mango Milkshake',40.00,1,'Beverages'),(35,'Banana Milkshake',60.00,1,'Beverages'),(36,'Chocolate Milkshake',45.00,1,'Beverages'),(37,'Mineral Water Bottle',20.00,1,'Beverages'),(38,'Gulab Jamun (2 pcs)',30.00,1,'Desserts'),(39,'Rasgulla (2 pcs)',35.00,1,'Desserts'),(40,'Ice Cream Cup',40.00,1,'Desserts'),(41,'Fruit Salad',45.00,1,'Desserts'),(42,'Payasam',35.00,1,'Desserts'),(43,'Brownie with Ice Cream',70.00,1,'Desserts'),(44,'Dal chawal',120.00,1,'Lunch'),(45,'obmd',50.00,1,'Breakfast'),(47,'sambhar rice',50.00,1,'Lunch'),(48,'Strawberry milkshake',70.00,1,'Beverages');
/*!40000 ALTER TABLE `Menu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `OrderItem`
--

DROP TABLE IF EXISTS `OrderItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `OrderItem` (
  `order_id` int NOT NULL,
  `item_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  PRIMARY KEY (`order_id`,`item_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `orderitem_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `Orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `orderitem_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `Menu` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `OrderItem`
--

LOCK TABLES `OrderItem` WRITE;
/*!40000 ALTER TABLE `OrderItem` DISABLE KEYS */;
INSERT INTO `OrderItem` VALUES (1,6,1),(1,29,1),(1,36,2),(2,32,1),(2,35,1),(2,36,1),(3,32,1),(3,35,1),(4,29,1),(5,29,1),(5,32,1),(5,36,1),(6,29,1),(6,34,1),(6,36,1),(7,32,1),(7,35,1),(7,36,1),(8,3,1),(8,29,1),(8,36,2),(9,1,1),(9,33,1),(10,32,1),(10,36,1),(11,10,1),(11,17,1),(12,32,1),(12,33,1),(13,32,1),(13,33,1),(14,32,1),(14,36,1),(15,30,1),(15,35,1),(15,37,1),(16,31,1),(16,32,1),(16,33,1),(17,1,1),(17,13,1),(17,32,1),(17,36,1),(18,32,1),(18,35,1),(19,29,1),(19,32,1),(19,36,1),(20,32,1),(20,35,1),(20,36,1),(21,32,1),(21,35,1),(21,36,1),(22,32,1),(22,35,1),(22,36,1),(23,32,1),(23,33,1),(23,35,1),(24,28,1),(24,32,1),(24,33,1),(25,30,1),(25,35,1),(25,37,1),(26,1,1),(26,33,1),(26,35,1),(27,4,3),(27,28,1),(27,31,1),(27,32,1),(28,28,1),(28,32,1),(28,33,1),(29,30,1),(29,33,1),(29,35,1),(30,32,1),(30,35,1),(31,4,1),(31,8,1),(32,29,1),(32,32,1),(32,36,1),(33,1,1),(33,3,1),(33,45,1),(34,32,1),(34,35,1),(35,31,1),(35,32,1),(35,36,1),(36,33,1),(36,35,1),(36,36,1),(37,32,1),(37,36,1),(38,32,2),(38,36,1),(39,32,1),(39,36,1),(40,32,1),(40,35,1),(41,17,1),(41,18,1);
/*!40000 ALTER TABLE `OrderItem` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_order_insert` AFTER INSERT ON `orderitem` FOR EACH ROW BEGIN
    UPDATE Inventory
    SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity)
    WHERE item_id = NEW.item_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `OrderLogs`
--

DROP TABLE IF EXISTS `OrderLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `OrderLogs` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int DEFAULT NULL,
  `old_status` varchar(20) DEFAULT NULL,
  `new_status` varchar(20) DEFAULT NULL,
  `changed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`log_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `orderlogs_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `Orders` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `OrderLogs`
--

LOCK TABLES `OrderLogs` WRITE;
/*!40000 ALTER TABLE `OrderLogs` DISABLE KEYS */;
INSERT INTO `OrderLogs` VALUES (1,20,'preparing','completed','2025-11-12 23:11:35'),(2,23,'preparing','completed','2025-11-12 23:43:12'),(3,21,'preparing','completed','2025-11-12 23:43:15'),(4,22,'preparing','completed','2025-11-12 23:43:16'),(5,24,'preparing','completed','2025-11-12 23:45:31'),(6,25,'preparing','completed','2025-11-12 23:45:33'),(7,26,'preparing','completed','2025-11-12 23:51:29'),(8,27,'preparing','completed','2025-11-12 23:51:30'),(9,28,'preparing','cancelled','2025-11-13 00:57:24'),(10,29,'preparing','cancelled','2025-11-13 01:00:43'),(11,30,'preparing','completed','2025-11-13 01:03:27'),(12,31,'preparing','completed','2025-11-13 01:30:13'),(13,32,'preparing','cancelled','2025-11-17 13:25:09'),(14,33,'preparing','completed','2025-11-17 13:27:59'),(15,34,'preparing','completed','2025-11-17 13:31:28'),(16,35,'preparing','cancelled','2025-11-17 13:33:27'),(17,37,'preparing','completed','2026-01-08 21:18:27'),(18,38,'preparing','ready','2026-04-03 21:55:29'),(19,38,'ready','completed','2026-04-03 21:55:31'),(20,39,'preparing','completed','2026-04-03 22:44:38'),(21,40,'pending','preparing','2026-04-04 02:15:16'),(22,40,'preparing','completed','2026-04-04 11:22:24'),(23,41,'pending','cancelled','2026-04-04 11:40:08');
/*!40000 ALTER TABLE `OrderLogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Orders`
--

DROP TABLE IF EXISTS `Orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `payment_mode` varchar(50) DEFAULT NULL,
  `order_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `pickup_time` time DEFAULT NULL,
  `status` enum('pending','preparing','ready','completed','cancelled') DEFAULT 'pending',
  `order_no` int DEFAULT NULL,
  `canteen_id` int DEFAULT '1',
  `payment_status` enum('pending','paid','failed','cancelled') DEFAULT 'pending',
  `razorpay_order_id` varchar(255) DEFAULT NULL,
  `razorpay_payment_id` varchar(255) DEFAULT NULL,
  `razorpay_signature` varchar(255) DEFAULT NULL,
  `payment_expires_at` datetime DEFAULT NULL,
  `payment_verified_at` datetime DEFAULT NULL,
  `payment_failure_reason` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `uq_orders_razorpay_order_id` (`razorpay_order_id`),
  UNIQUE KEY `uq_orders_razorpay_payment_id` (`razorpay_payment_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Orders`
--

LOCK TABLES `Orders` WRITE;
/*!40000 ALTER TABLE `Orders` DISABLE KEYS */;
INSERT INTO `Orders` VALUES (1,12,150.00,'UPI','2025-11-07 01:16:27',NULL,'pending',NULL,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(2,12,100.00,'UPI','2025-11-07 08:03:46',NULL,'pending',NULL,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(3,12,55.00,'UPI','2025-11-07 09:34:04',NULL,'pending',NULL,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(4,12,20.00,'UPI','2025-11-07 10:52:33',NULL,'ready',NULL,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(5,12,85.00,'UPI','2025-11-07 21:12:17',NULL,'completed',NULL,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(6,6,105.00,'UPI','2025-11-07 21:53:22',NULL,'completed',NULL,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(7,6,100.00,'UPI','2025-11-07 22:00:47',NULL,'completed',NULL,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(8,6,155.00,'UPI','2025-11-08 12:30:00',NULL,'completed',1,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(9,6,50.00,'UPI','2025-11-08 13:46:05',NULL,'completed',2,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(10,6,65.00,'UPI','2025-11-08 13:51:59',NULL,'completed',3,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(11,6,200.00,'UPI','2025-11-08 14:15:01',NULL,'completed',4,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(12,6,45.00,'UPI','2025-11-08 14:16:12',NULL,'completed',5,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(13,6,45.00,'UPI','2025-11-08 14:59:57',NULL,'completed',6,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(14,6,65.00,'UPI','2025-11-08 15:23:19',NULL,'completed',7,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(15,13,90.00,'UPI','2025-11-08 15:23:56',NULL,'completed',8,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(16,6,75.00,'UPI','2025-11-09 16:42:51',NULL,'completed',1,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(17,14,170.00,'UPI','2025-11-10 12:59:20',NULL,'completed',1,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(18,14,55.00,'UPI','2025-11-10 13:02:42',NULL,'completed',2,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(19,15,85.00,'UPI','2025-11-10 13:21:03',NULL,'preparing',3,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(20,15,0.00,'UPI','2025-11-12 23:09:47',NULL,'completed',1,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(21,15,0.00,'UPI','2025-11-12 23:09:50',NULL,'completed',2,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(22,15,0.00,'UPI','2025-11-12 23:12:31',NULL,'completed',3,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(23,15,80.00,'UPI','2025-11-12 23:42:58',NULL,'completed',4,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(24,15,60.00,'UPI','2025-11-12 23:43:30',NULL,'completed',5,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(25,15,90.00,'UPI','2025-11-12 23:45:17',NULL,'completed',6,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(26,15,85.00,'UPI','2025-11-12 23:50:31',NULL,'completed',7,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(27,15,185.00,'UPI','2025-11-12 23:51:13',NULL,'completed',8,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(28,15,60.00,'UPI','2025-11-13 00:52:36',NULL,'cancelled',1,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(29,15,100.00,'UPI','2025-11-13 01:00:26',NULL,'cancelled',2,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(30,15,60.00,'UPI','2025-11-13 01:03:13',NULL,'completed',3,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(31,15,75.00,'UPI','2025-11-13 01:06:58',NULL,'completed',4,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(32,16,85.00,'UPI','2025-11-17 13:21:02',NULL,'cancelled',1,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(33,16,120.00,'UPI','2025-11-17 13:27:43',NULL,'completed',2,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(34,16,70.00,'UPI','2025-11-17 13:30:49',NULL,'completed',3,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(35,16,95.00,'UPI','2025-11-17 13:31:50',NULL,'cancelled',4,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(36,16,120.00,'UPI','2025-11-18 09:17:20',NULL,'preparing',1,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(37,120,65.00,'UPI','2026-01-08 21:18:11',NULL,'completed',1,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(38,125,85.00,'UPI','2026-04-03 21:54:39',NULL,'completed',1,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(39,126,65.00,'UPI','2026-04-03 22:37:57',NULL,'completed',2,1,'pending',NULL,NULL,NULL,NULL,NULL,NULL),(40,122,80.00,'Razorpay','2026-04-04 02:13:08',NULL,'completed',1,1,'paid','order_SZ9jCJtjhr7Xn8','pay_SZ9l1yCUOBg8KT','82c3b71e312b7c9e7daba62f3daa3d897c6510a708dd32bc90b0466cb02be1e4','2026-04-04 02:28:08','2026-04-04 02:15:16',NULL),(41,122,195.00,'Razorpay','2026-04-04 11:39:49',NULL,'cancelled',2,1,'failed','order_SZJNnXF9UyfGp8',NULL,NULL,'2026-04-04 11:54:49',NULL,'You have entered an incorrect CVV number. Try again.');
/*!40000 ALTER TABLE `Orders` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_order_status_update` AFTER UPDATE ON `orders` FOR EACH ROW BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO OrderLogs (order_id, old_status, new_status)
        VALUES (NEW.order_id, OLD.status, NEW.status);
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `role` enum('admin','customer','staff') DEFAULT 'customer',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=128 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES (1,'Nitin Reddy','nitin@example.com','$2b$10$HYwo.3IIQ7hx8xhbMAk1TeUAmL2jOyF1YNvZ7VPtWdvxinb6vGfDa','9876543210','customer'),(2,'Santosh Malhotra','santosh@example.com','$2b$10$HgWkxCNoUapa5r886h/p2eu1nOruovXDvSLivbQ9C/NBOpUxBkBEe','9876543201','admin'),(3,'Staff 1','staff1@example.com','$2b$10$bsyFxwYhSQMnWD4iJob8QO4F.F4n4bPdAYKXSL3D/Ifih5IXZwC2u','9876543021','staff'),(4,'Staff 2','staff2@example.com','$2b$10$ykPCFY4miVXB2TKf/TUAr.ydpXMUjX1Uj7cCe28OVHeVab1rIA47i','9876540321','staff'),(5,'Staff 3','staff3@example.com','$2b$10$XIpv3xk3U0DkfTKZN4kP.e6JTv3r0NoCBZvBPHcP6ycJkYlbwZbWS','9876504321','staff'),(6,'Nitin Reddy','nitinreddy095@gmail.com','$2b$10$UCQ5xjsKffsO4Xp/sPhAN.C1F0dsWb5REVNM51lm5lGlz5chomT06','9021049917','customer'),(7,'Pavan Saxena','meetpavansaxena@gmail.com','$2b$10$AIgFwuUcooDUI1f3kElIje0J6hHidmOzjFWqMv.Ayz1V2PRlCXGB6','','customer'),(8,'Canteen Admin','admin@fastfeast.com','$2b$10$hashedpasswordhere','9876543210','admin'),(10,'Canteen Admin','admin123@fastfeast.com','admin123','9876543210','admin'),(11,'Canteen Admin','admin1234@fastfeast.com','$2b$10$3xdY30MML0/ImuIearSo0.BH3RYVKlXiH9PZtUJZgbnDS.PM0Vhlu','9876543210','admin'),(12,'Nitin Reddy','nitin@fastfeast.com','$2b$10$I4HlbbinogRBKDIvg/Y8H.oG/f3qzn4ZbR8TXkAvWHgmgWbzxVBeu','','admin'),(13,'Poorva Tejas Reddt','poorva@ex.com','$2b$10$C6rH2Eo4mWbUqmqSvGIglu/xnlFEzVeukKb.U.H7Z4zSLsRKxYd2.','','customer'),(14,'poorva','poorva@gmail.com','$2b$10$0uqDd3r0.E1MoPNw5E3aEOBO1LGO9reTT.uQdYV0U8MGLu5a7EHDq','','customer'),(15,'user','user@gmail.com','$2b$10$bD6d4mk0sTM7CEhoQSosTuT0Vmu8V9DmsR3Qci2EEIb3mDDOgv7Ny','','customer'),(16,'vinodha','vinodha@gmail.com','$2b$10$WIXzDfAwPwJSjblQKRHht.kXRorAmqMQ4vIcUGGB/Ir5uWyBIyKOO','','customer'),(17,'mighty raju','raju@gmail.com','$2b$10$DPpD0lglc1x35kGPb.Uzl.z2mdXsNnbjesf51GEp96xuK4S7ljs.G','12345','customer'),(120,'Harshith','harshith@gmail.com','$2a$10$2lbFjx83pl5JnSfNmLL6.Os3cJTHVuN0WemAoraMOPj.imTUZdK62','9021','admin'),(121,'nitin','nitin12345@mail.com','$2b$10$8wgdywqlQWY60KmGtvT.I.pENjxDb0vnhl6Awsrw2zqhTOZd0cA.6','','customer'),(122,'Nitin Reddy','nitinreddy0956@gmail.com','$2b$10$RnFG3oahQqidZh7JB.4Nl.rdSSWRCCMhfXLEjbS40pGJKq4gaqG6.','09021049917','customer'),(125,'admin','admin12345@gmail.com','$2a$10$O70qP3RSJ6ROYhLxp7eB4.8FeTuft4ip5nzqMOAxW6QV7JJ9UdIQi','9021','admin'),(126,'Nitin Reddy','pes2ug23cs401@pesu.pes.edu','$2b$10$Bl6AFon6lLKY8BthEnmF3ePzMLJptB/zD6W8492B0YxDVIxDEk20q','7758850549','customer'),(127,'Nitin Reddy','killer@gmail.com','$2b$10$IYbgX6i6xpDWR6TSNh0Pi.zmoqsJFzG/8y0me1x7H7ADYmsBzkx3u','9021049917','customer');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `user_orders_view`
--

DROP TABLE IF EXISTS `user_orders_view`;
/*!50001 DROP VIEW IF EXISTS `user_orders_view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `user_orders_view` AS SELECT 
 1 AS `user_id`,
 1 AS `customer_name`,
 1 AS `order_id`,
 1 AS `order_no`,
 1 AS `amount`,
 1 AS `status`,
 1 AS `payment_mode`,
 1 AS `order_date`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `daily_revenue_view`
--

/*!50001 DROP VIEW IF EXISTS `daily_revenue_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `daily_revenue_view` AS select cast(`orders`.`order_date` as date) AS `order_day`,count(`orders`.`order_id`) AS `total_orders`,sum(`orders`.`amount`) AS `total_revenue` from `orders` where (`orders`.`status` = 'completed') group by cast(`orders`.`order_date` as date) order by `order_day` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `user_orders_view`
--

/*!50001 DROP VIEW IF EXISTS `user_orders_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `user_orders_view` AS select `u`.`user_id` AS `user_id`,`u`.`name` AS `customer_name`,`o`.`order_id` AS `order_id`,`o`.`order_no` AS `order_no`,`o`.`amount` AS `amount`,`o`.`status` AS `status`,`o`.`payment_mode` AS `payment_mode`,`o`.`order_date` AS `order_date` from (`orders` `o` join `user` `u` on((`o`.`user_id` = `u`.`user_id`))) order by `o`.`order_date` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-04 12:01:58
