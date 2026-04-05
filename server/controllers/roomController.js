const pool = require('../config/db');

exports.getAllRooms = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT r.*, rt.type_name, rt.base_price, rt.max_occupancy 
            FROM ROOMS r 
            JOIN ROOM_TYPES rt ON r.type_id = rt.type_id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAvailableRooms = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT r.*, rt.type_name, rt.base_price, rt.max_occupancy 
            FROM ROOMS r 
            JOIN ROOM_TYPES rt ON r.type_id = rt.type_id
            WHERE r.status = 'Available'
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateRoomStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    try {
        const [result] = await pool.query(
            "UPDATE ROOMS SET status = ? WHERE room_id = ?",
            [status, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        res.json({ message: `Room status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createRoom = async (req, res) => {
    const { room_number, type_id, status } = req.body;
    
    if (!room_number || !type_id) {
        return res.status(400).json({ error: 'Room number and type are required' });
    }

    try {
        const [result] = await pool.query(
            "INSERT INTO ROOMS (room_number, type_id, status) VALUES (?, ?, ?)",
            [room_number, type_id, status || 'Available']
        );
        res.status(201).json({ 
            message: 'Room created successfully',
            room_id: result.insertId 
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Room number already exists' });
        }
        res.status(500).json({ error: err.message });
    }
};

exports.getRoomTypes = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM ROOM_TYPES");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
