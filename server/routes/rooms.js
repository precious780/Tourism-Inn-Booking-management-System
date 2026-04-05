const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.get('/', roomController.getAllRooms);
router.get('/types', roomController.getRoomTypes);
router.get('/available', roomController.getAvailableRooms);
router.post('/', roomController.createRoom);
router.put('/:id/status', roomController.updateRoomStatus);

module.exports = router;
