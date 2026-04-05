const pool = require('../config/db');

exports.getAllGuests = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM GUESTS');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getGuestById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM GUESTS WHERE guest_id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Guest not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createGuest = async (req, res) => {
    const { first_name, last_name, email, phone, id_proof_number } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO GUESTS (first_name, last_name, email, phone, id_proof_number) VALUES (?, ?, ?, ?, ?)',
            [first_name, last_name, email, phone, id_proof_number]
        );
        res.status(201).json({ guest_id: result.insertId, message: 'Guest created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateGuest = async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, email, phone, id_proof_number } = req.body;
    try {
        await pool.query(
            'UPDATE GUESTS SET first_name = ?, last_name = ?, email = ?, phone = ?, id_proof_number = ? WHERE guest_id = ?',
            [first_name, last_name, email, phone, id_proof_number, id]
        );
        res.json({ message: 'Guest updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteGuest = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM GUESTS WHERE guest_id = ?', [id]);
        res.json({ message: 'Guest deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
