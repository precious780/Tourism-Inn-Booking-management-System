const express = require('express');
const cors = require('cors');
require('dotenv').config();

const guestRoutes = require('./routes/guests');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/guests', guestRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
    res.send('Tourist Inn Booking API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
