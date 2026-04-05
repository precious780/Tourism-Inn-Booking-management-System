const BASE_URL = 'http://localhost:5000/api';

const API = {
    // Rooms
    async getRooms() {
        const res = await fetch(`${BASE_URL}/rooms`);
        return res.json();
    },
    async getRoomTypes() {
        const res = await fetch(`${BASE_URL}/rooms/types`);
        return res.json();
    },
    async getAvailableRooms() {
        const res = await fetch(`${BASE_URL}/rooms/available`);
        return res.json();
    },
    async createRoom(roomData) {
        const res = await fetch(`${BASE_URL}/rooms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(roomData)
        });
        return res.json();
    },
    async updateRoomStatus(id, status) {
        const res = await fetch(`${BASE_URL}/rooms/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return res.json();
    },

    // Guests
    async getGuests() {
        const res = await fetch(`${BASE_URL}/guests`);
        return res.json();
    },
    async createGuest(guestData) {
        const res = await fetch(`${BASE_URL}/guests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(guestData)
        });
        return res.json();
    },
    async updateGuest(id, guestData) {
        const res = await fetch(`${BASE_URL}/guests/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(guestData)
        });
        return res.json();
    },
    async deleteGuest(id) {
        const res = await fetch(`${BASE_URL}/guests/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    // Bookings
    async getBookings() {
        const res = await fetch(`${BASE_URL}/bookings`);
        return res.json();
    },
    async createBooking(bookingData) {
        const res = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        return res.json();
    },
    async cancelBooking(id) {
        const res = await fetch(`${BASE_URL}/bookings/${id}/cancel`, {
            method: 'PUT'
        });
        return res.json();
    },
    async checkOut(id) {
        const res = await fetch(`${BASE_URL}/bookings/${id}/checkout`, {
            method: 'PUT'
        });
        return res.json();
    }
};
