const pool = require('../config/db');

exports.getAllBookings = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT b.*, g.first_name, g.last_name 
            FROM BOOKINGS b 
            JOIN GUESTS g ON b.guest_id = g.guest_id
            ORDER BY b.check_in_date DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBookingById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`
            SELECT b.*, g.first_name, g.last_name, g.email, g.phone 
            FROM BOOKINGS b 
            JOIN GUESTS g ON b.guest_id = g.guest_id
            WHERE b.booking_id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const [rooms] = await pool.query(`
            SELECT r.*, br.price_at_booking, rt.type_name 
            FROM BOOKING_ROOMS br
            JOIN ROOMS r ON br.room_id = r.room_id
            JOIN ROOM_TYPES rt ON r.type_id = rt.type_id
            WHERE br.booking_id = ?
        `, [id]);

        res.json({ ...rows[0], rooms });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createBooking = async (req, res) => {
    const { guest_id, check_in_date, check_out_date, room_ids } = req.body;
    
    if (!guest_id || !check_in_date || !check_out_date || !room_ids || !Array.isArray(room_ids)) {
        return res.status(400).json({ error: 'Missing required fields or room_ids is not an array' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Deduplicate room IDs to prevent primary key errors in BOOKING_ROOMS
        const uniqueRoomIds = [...new Set(room_ids)];

        // 1. Get room details and calculate total
        let totalAmount = 0;
        const roomDetails = [];
        for (const roomId of uniqueRoomIds) {
            const [rows] = await connection.query(`
                SELECT r.*, rt.base_price 
                FROM ROOMS r 
                JOIN ROOM_TYPES rt ON r.type_id = rt.type_id 
                WHERE r.room_id = ? AND r.status = 'Available'
            `, [roomId]);

            if (rows.length === 0) {
                throw new Error(`Room ${roomId} is not available.`);
            }
            totalAmount += parseFloat(rows[0].base_price);
            roomDetails.push({ room_id: roomId, price: rows[0].base_price });
        }

        // Adjust total by number of days
        const start = new Date(check_in_date);
        const end = new Date(check_out_date);
        const diffTime = end - start;
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        totalAmount *= diffDays;

        // 2. Create booking record
        const [bookingResult] = await connection.query(
            'INSERT INTO BOOKINGS (guest_id, check_in_date, check_out_date, total_amount, booking_status) VALUES (?, ?, ?, ?, ?)',
            [guest_id, check_in_date, check_out_date, totalAmount, 'Confirmed']
        );
        const bookingId = bookingResult.insertId;

        // 3. Insert into BOOKING_ROOMS and update room status
        for (const room of roomDetails) {
            await connection.query(
                'INSERT INTO BOOKING_ROOMS (booking_id, room_id, price_at_booking) VALUES (?, ?, ?)',
                [bookingId, room.room_id, room.price]
            );
            await connection.query(
                "UPDATE ROOMS SET status = 'Occupied' WHERE room_id = ?",
                [room.room_id]
            );
        }

        await connection.commit();
        res.status(201).json({ booking_id: bookingId, total_amount: totalAmount, message: 'Booking confirmed' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

exports.cancelBooking = async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get rooms associated with this booking
        const [rooms] = await connection.query('SELECT room_id FROM BOOKING_ROOMS WHERE booking_id = ?', [id]);

        // 2. Update booking status
        await connection.query('UPDATE BOOKINGS SET booking_status = ? WHERE booking_id = ?', ['Cancelled', id]);

        // 3. Set rooms back to Available
        for (const room of rooms) {
            await connection.query("UPDATE ROOMS SET status = 'Available' WHERE room_id = ?", [room.room_id]);
        }

        await connection.commit();
        res.json({ message: 'Booking cancelled successfully' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

exports.checkOut = async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get rooms associated with this booking
        const [rooms] = await connection.query('SELECT room_id FROM BOOKING_ROOMS WHERE booking_id = ?', [id]);

        // 2. Update booking status
        await connection.query('UPDATE BOOKINGS SET booking_status = ? WHERE booking_id = ?', ['Completed', id]);

        // 3. Set rooms to Cleaning (standard practice after checkout)
        for (const room of rooms) {
            await connection.query("UPDATE ROOMS SET status = 'Cleaning' WHERE room_id = ?", [room.room_id]);
        }

        await connection.commit();
        res.json({ message: 'Checked out successfully. Rooms are now being cleaned.' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};
