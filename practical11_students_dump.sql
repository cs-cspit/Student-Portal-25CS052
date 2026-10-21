-- MySQL dump 10.13  Distrib 26.7.0, for macos27.0 (arm64)
--
-- Host: localhost    Database: campusly
-- ------------------------------------------------------
-- Server version	26.7.0

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
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `student_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Active','Inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES (1,'Jay Navadiya','jay@campusly.com','CE','Active'),(2,'jayyyy','jayyyy@campusly.com','CSE','Active'),(3,'Aarav Patel','25cs003@charusat.edu.in','CE','Active'),(4,'Ananya Sharma','25ce004@charusat.edu.in','CE','Active'),(5,'Rohan Mehta','25it005@charusat.edu.in','IT','Inactive'),(6,'Priya Desai','25cs006@charusat.edu.in','CSE','Active'),(7,'Vikram Joshi','25ce007@charusat.edu.in','CE','Active'),(8,'Sneha Shah','25it008@charusat.edu.in','IT','Active'),(9,'Dev Dave','25ec009@charusat.edu.in','EC','Active'),(10,'Diya Trivedi','25cs010@charusat.edu.in','CSE','Active'),(11,'Harsh Panchal','25ce011@charusat.edu.in','CE','Active'),(12,'Ishan Parekh','25it012@charusat.edu.in','IT','Active'),(13,'Kavya Soni','25cs013@charusat.edu.in','CSE','Active'),(14,'Meera Vora','25ce014@charusat.edu.in','CE','Active'),(15,'Neel Shukla','25ec015@charusat.edu.in','EC','Active'),(16,'Riya Pandya','25it016@charusat.edu.in','IT','Active'),(17,'Siddharth Rawal','25cs017@charusat.edu.in','CSE','Active'),(18,'Tanvi Bhatt','25ce018@charusat.edu.in','CE','Active'),(19,'Varun Prajapati','25it019@charusat.edu.in','IT','Active'),(20,'Yash Solanki','25ec020@charusat.edu.in','EC','Active'),(23,'Kavish Parekh','25cs021@charusat.edu.in','CSE','Active'),(24,'Kavya Patel','kavya.patel@charusat.edu.in','CSE','Active'),(27,'Aditya Verma','25cs026@charusat.edu.in','CSE','Inactive'),(29,'Aditya Verma','aditya.verma300@charusat.edu.in','CSE','Active');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-21 14:51:42
