-- Tourist Inn Booking Management System Schema

CREATE DATABASE IF NOT EXISTS tourist_inn_db;
USE tourist_inn_db;

-- Drop existing tables in reverse order of dependencies
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS PAYMENTS;
DROP TABLE IF EXISTS BOOKING_ROOMS;
DROP TABLE IF EXISTS BOOKINGS;
DROP TABLE IF EXISTS ROOMS;
DROP TABLE IF EXISTS GUESTS;
DROP TABLE IF EXISTS ROOM_TYPES;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. ROOM_TYPES
CREATE TABLE ROOM_TYPES (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    max_occupancy INT NOT NULL
);

-- 2. GUESTS
CREATE TABLE IF NOT EXISTS GUESTS (
    guest_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    id_proof_number VARCHAR(50)
);

-- 3. ROOMS
CREATE TABLE IF NOT EXISTS ROOMS (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    type_id INT,
    status ENUM('Available', 'Occupied', 'Maintenance', 'Cleaning') DEFAULT 'Available',
    FOREIGN KEY (type_id) REFERENCES ROOM_TYPES(type_id) ON DELETE SET NULL
);

-- 4. BOOKINGS
CREATE TABLE IF NOT EXISTS BOOKINGS (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    booking_status ENUM('Confirmed', 'Pending', 'Cancelled', 'Completed') DEFAULT 'Pending',
    total_amount DECIMAL(10, 2),
    FOREIGN KEY (guest_id) REFERENCES GUESTS(guest_id) ON DELETE CASCADE
);

-- 5. BOOKING_ROOMS (Junction Table)
CREATE TABLE IF NOT EXISTS BOOKING_ROOMS (
    booking_id INT,
    room_id INT,
    price_at_booking DECIMAL(10, 2),
    PRIMARY KEY (booking_id, room_id),
    FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES ROOMS(room_id) ON DELETE CASCADE
);

-- 6. PAYMENTS
CREATE TABLE IF NOT EXISTS PAYMENTS (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES BOOKINGS(booking_id) ON DELETE CASCADE
);

-- Initial Data for Room Types
INSERT INTO ROOM_TYPES (type_name, base_price, max_occupancy) VALUES
('Single', 1500.00, 1),
('Double', 2500.00, 2),
('Suite', 5000.00, 4);

-- Initial Data for Rooms
INSERT INTO ROOMS (room_number, type_id, status) VALUES
('101', 1, 'Available'),
('102', 1, 'Available'),
('201', 2, 'Available'),
('202', 2, 'Available'),
('301', 3, 'Available');
