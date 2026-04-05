document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.page-section');
    const roomList = document.getElementById('room-list');
    const bookingList = document.getElementById('booking-list');
    const guestList = document.getElementById('guest-list');
    
    // Stats Elements
    const totalRoomsEl = document.getElementById('total-rooms');
    const availableRoomsEl = document.getElementById('available-rooms');
    const activeBookingsEl = document.getElementById('active-bookings');

    // Modal Elements
    const bookingModal = document.getElementById('booking-modal');
    const btnNewBooking = document.getElementById('btn-new-booking');
    const closeModal = document.querySelector('.close');
    const bookingForm = document.getElementById('booking-form');
    const guestSelect = document.getElementById('guest-select');
    const roomSelect = document.getElementById('room-select');

    // Guest Modal Elements
    const guestModal = document.getElementById('guest-modal');
    const btnAddGuest = document.getElementById('btn-add-guest');
    const closeGuestModal = document.querySelector('.close-guest');
    const guestForm = document.getElementById('guest-form');

    // Room Modal Elements
    const roomModal = document.getElementById('room-modal');
    const btnAddRoom = document.getElementById('btn-add-room');
    const closeRoomModal = document.querySelector('.close-room');
    const roomForm = document.getElementById('room-form');
    const roomTypeSelect = document.getElementById('room_type');

    // Navigation Logic
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.section;
            
            navLinks.forEach(nl => nl.classList.remove('active'));
            link.classList.add('active');
            
            sections.forEach(sec => {
                if (sec.id === target) {
                    sec.classList.remove('hidden');
                    loadSectionData(target);
                } else {
                    sec.classList.add('hidden');
                }
            });
        });
    });

    async function loadSectionData(section) {
        switch(section) {
            case 'dashboard':
                updateStats();
                break;
            case 'rooms':
                renderRooms();
                break;
            case 'bookings':
                renderBookings();
                break;
            case 'guests':
                renderGuests();
                break;
        }
    }

    // Stats Logic
    async function updateStats() {
        try {
            const rooms = await API.getRooms();
            const available = await API.getAvailableRooms();
            const bookings = await API.getBookings();
            
            totalRoomsEl.textContent = rooms.length;
            availableRoomsEl.textContent = available.length;
            activeBookingsEl.textContent = bookings.filter(b => b.booking_status === 'Confirmed').length;
        } catch (err) {
            console.error('Error updating stats:', err);
        }
    }

    // Rooms Logic
    async function renderRooms() {
        roomList.innerHTML = '<p>Loading rooms...</p>';
        try {
            const rooms = await API.getRooms();
            roomList.innerHTML = rooms.map(room => `
                <div class="room-card ${room.status.toLowerCase()}">
                    <h3>Room ${room.room_number}</h3>
                    <p>${room.type_name}</p>
                    <span class="room-status status-${room.status}">${room.status}</span>
                    <p><strong>₹${room.base_price}</strong> / night</p>
                    ${room.status === 'Cleaning' ? 
                        `<button class="btn btn-success btn-sm" onclick="markReady(${room.room_id})">Mark Ready</button>` : ''}
                </div>
            `).join('');
        } catch (err) {
            roomList.innerHTML = '<p>Error loading rooms.</p>';
        }
    }

    window.markReady = async (id) => {
        if (confirm('Mark this room as Available?')) {
            await API.updateRoomStatus(id, 'Available');
            renderRooms();
            updateStats();
        }
    };

    // Bookings Logic
    async function renderBookings() {
        bookingList.innerHTML = '<tr><td colspan="7">Loading bookings...</td></tr>';
        try {
            const bookings = await API.getBookings();
            bookingList.innerHTML = bookings.map(b => `
                <tr>
                    <td>#${b.booking_id}</td>
                    <td>${b.first_name} ${b.last_name}</td>
                    <td>${new Date(b.check_in_date).toLocaleDateString()}</td>
                    <td>${new Date(b.check_out_date).toLocaleDateString()}</td>
                    <td><span class="room-status status-${b.booking_status}">${b.booking_status}</span></td>
                    <td>₹${b.total_amount}</td>
                    <td>
                        ${b.booking_status === 'Confirmed' ? `
                            <button class="btn btn-success btn-sm" onclick="handleCheckout(${b.booking_id})">Checkout</button>
                            <button class="btn btn-danger btn-sm" onclick="handleCancel(${b.booking_id})">Cancel</button>
                        ` : '-'}
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            bookingList.innerHTML = '<tr><td colspan="7">Error loading bookings.</td></tr>';
        }
    }

    window.handleCheckout = async (id) => {
        if (confirm('Proceed with checkout? Room will be set to Cleaning.')) {
            await API.checkOut(id);
            renderBookings();
        }
    };

    window.handleCancel = async (id) => {
        if (confirm('Are you sure you want to cancel this booking?')) {
            await API.cancelBooking(id);
            renderBookings();
        }
    };

    // Guests Logic
    let editingGuestId = null;

    async function renderGuests() {
        guestList.innerHTML = '<tr><td colspan="5">Loading guests...</td></tr>';
        try {
            const guests = await API.getGuests();
            guestList.innerHTML = guests.map(g => `
                <tr>
                    <td>#${g.guest_id}</td>
                    <td>${g.first_name} ${g.last_name}</td>
                    <td>${g.email}</td>
                    <td>${g.phone || 'N/A'}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="handleEditGuest(${g.guest_id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-danger btn-sm" onclick="handleDeleteGuest(${g.guest_id})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            guestList.innerHTML = '<tr><td colspan="5">Error loading guests.</td></tr>';
        }
    }

    window.handleEditGuest = async (id) => {
        editingGuestId = id;
        try {
            const guests = await API.getGuests();
            const guest = guests.find(g => g.guest_id === id);
            
            if (guest) {
                document.getElementById('first_name').value = guest.first_name;
                document.getElementById('last_name').value = guest.last_name;
                document.getElementById('email').value = guest.email;
                document.getElementById('phone').value = guest.phone || '';
                document.getElementById('id_proof').value = guest.id_proof_number || '';
                
                guestModal.querySelector('h3').textContent = 'Update Guest Details';
                guestModal.querySelector('button[type="submit"]').textContent = 'Update Guest';
                guestModal.style.display = 'block';
            }
        } catch (err) {
            alert('Error fetching guest details');
        }
    };

    window.handleDeleteGuest = async (id) => {
        if (confirm('Are you sure you want to delete this guest? This will also delete all their bookings.')) {
            try {
                await API.deleteGuest(id);
                renderGuests();
            } catch (err) {
                alert('Failed to delete guest');
            }
        }
    };

    // Modal Logic
    btnNewBooking.addEventListener('click', async () => {
        bookingModal.style.display = 'block';
        // Populate guests and available rooms
        const guests = await API.getGuests();
        const rooms = await API.getAvailableRooms();
        
        guestSelect.innerHTML = '<option value="">Select a guest</option>' + 
            guests.map(g => `<option value="${g.guest_id}">${g.first_name} ${g.last_name}</option>`).join('');
            
        roomSelect.innerHTML = rooms.map(r => `<option value="${r.room_id}">${r.room_number} - ${r.type_name} (₹${r.base_price})</option>`).join('');
    });

    closeModal.onclick = () => bookingModal.style.display = 'none';

    bookingForm.onsubmit = async (e) => {
        e.preventDefault();
        const selectedRooms = Array.from(roomSelect.selectedOptions).map(opt => parseInt(opt.value));
        
        const data = {
            guest_id: parseInt(guestSelect.value),
            room_ids: selectedRooms,
            check_in_date: document.getElementById('check-in').value,
            check_out_date: document.getElementById('check-out').value
        };

        try {
            const result = await API.createBooking(data);
            if (result.error) {
                alert('Error: ' + result.error);
            } else {
                alert('Booking Confirmed! Total: ₹' + result.total_amount);
                bookingModal.style.display = 'none';
                bookingForm.reset();
                updateStats();
            }
        } catch (err) {
            alert('Failed to create booking');
        }
    };

    // Guest Modal Logic
    btnAddGuest.addEventListener('click', () => {
        editingGuestId = null;
        guestForm.reset();
        guestModal.querySelector('h3').textContent = 'Register New Guest';
        guestModal.querySelector('button[type="submit"]').textContent = 'Register Guest';
        guestModal.style.display = 'block';
    });

    closeGuestModal.onclick = () => {
        guestModal.style.display = 'none';
        editingGuestId = null;
    };

    guestForm.onsubmit = async (e) => {
        e.preventDefault();
        const guestData = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            id_proof_number: document.getElementById('id_proof').value
        };

        try {
            let result;
            if (editingGuestId) {
                result = await API.updateGuest(editingGuestId, guestData);
            } else {
                result = await API.createGuest(guestData);
            }

            if (result.error) {
                alert('Error: ' + result.error);
            } else {
                alert(editingGuestId ? 'Guest Updated Successfully!' : 'Guest Registered Successfully!');
                guestModal.style.display = 'none';
                guestForm.reset();
                editingGuestId = null;
                if (!document.getElementById('guests').classList.contains('hidden')) {
                    renderGuests();
                }
            }
        } catch (err) {
            alert('Failed to save guest');
        }
    };

    // Room Modal Logic
    btnAddRoom.addEventListener('click', async () => {
        roomForm.reset();
        roomModal.style.display = 'block';
        
        try {
            const types = await API.getRoomTypes();
            roomTypeSelect.innerHTML = types.map(t => `<option value="${t.type_id}">${t.type_name} (₹${t.base_price})</option>`).join('');
        } catch (err) {
            console.error('Error loading room types:', err);
        }
    });

    closeRoomModal.onclick = () => {
        roomModal.style.display = 'none';
    };

    roomForm.onsubmit = async (e) => {
        e.preventDefault();
        const roomData = {
            room_number: document.getElementById('room_number').value,
            type_id: parseInt(roomTypeSelect.value),
            status: document.getElementById('room_status').value
        };

        try {
            const result = await API.createRoom(roomData);
            if (result.error) {
                alert('Error: ' + result.error);
            } else {
                alert('Room added successfully!');
                roomModal.style.display = 'none';
                roomForm.reset();
                renderRooms();
                updateStats();
            }
        } catch (err) {
            alert('Failed to add room');
        }
    };

    // Global window click to handle all modals
    window.onclick = (e) => { 
        if (e.target == bookingModal) bookingModal.style.display = 'none';
        if (e.target == guestModal) guestModal.style.display = 'none';
        if (e.target == roomModal) roomModal.style.display = 'none';
    };

    // Initial Load
    updateStats();
});
