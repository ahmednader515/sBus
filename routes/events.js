const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Calendar = require('../models/Calendar');
const Ticket = require('../models/Ticket');
const Seat = require('../models/Seat');

// Render the calendar page
router.get('/', (req, res) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
  
    res.render('events/calendar/calendar', { year, month });
});
  

router.get('/add-event', async (req, res) => {
    try {
      const calendars = await Calendar.find({}); 
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      res.render('events/event/add-event', { calendars });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching calendars.');
    }
});

router.get('/event/:date', async (req, res) => {
    try {
        const { date } = req.params;
        const { type, calendarId } = req.query; // Ensure 'type' and 'calendarId' are passed in the query

        // Query to find events matching the date, type, and calendarId
        const events = await Event.find({
            date: date,           // Match the date (e.g., '2024-09-21')
            type: type,           // Filter by type ('going' or 'return')
            calendar: calendarId   // Ensure it belongs to the correct calendar
        });

        // If events are found, send them back in the response
        res.json({ events });
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).json({ error: 'An error occurred while fetching events' });
    }
});

router.get('/month/:year/:month', async (req, res) => {
    try {
        const { year, month } = req.params;
        const { calendarId } = req.query; // Get the calendar ID from the query

        // Get the first and last day of the month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, parseInt(month) + 1, 0);

        // Query to find events within the month for the specific calendar
        const events = await Event.find({
            date: {
                $gte: firstDay.toISOString().split('T')[0],
                $lte: lastDay.toISOString().split('T')[0],
            },
            calendar: calendarId // Filter by calendar ID
        });

        res.json({ events });
    } catch (err) {
        console.error('Error fetching events for the month:', err);
        res.status(500).json({ error: 'An error occurred while fetching events for the month' });
    }
});

// Add Event Route
router.post('/add-event', async (req, res) => {
    const {
        date,
        time,
        event,
        driverName,
        driverPhoneNumber,
        busPlateNumber,
        busPhoneNumber,
        notice,
        calendar,
        type,
        numberOfSeats
    } = req.body;

    try {
        // Create a new event
        const newEvent = new Event({
            date,
            time,
            name: event,
            calendar,
            notice,
            type,
            driverName,
            driverPhoneNumber,
            busPlateNumber,
            busPhoneNumber,
            numberOfSeats
        });

        await newEvent.save();

        // Create seats based on the number of seats selected
        for (let i = 1; i <= numberOfSeats; i++) {
            const newSeat = new Seat({
                seatNumber: i,
                event: newEvent._id
            });
            await newSeat.save();
        }

        req.flash('success', 'تم اضافة ميعاد جديد بنجاح');
        res.redirect('/events/calendars/' + calendar);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating event or seats.');
    }
});

// Edit Event Route
router.get('/edit-event/:id', (req, res) => {
    const eventId = req.params.id;

    Event.findById(eventId)
    .then(event => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');

        res.render('events/event/edit-event', { event });
    })
    .catch(err => console.log(err));
});

router.get('/edit-calendar/:id', (req, res) => {
    const calendarId = req.params.id;

    Calendar.findById(calendarId)
    .then(calendar => {
        // Set cache control headers to prevent caching of the edit page
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');

        res.render('events/calendar/edit-calendar', { calendar });
    })
    .catch(err => console.log(err));
});

// Update Event Route
router.post('/update-event/:id', (req, res) => {
    const eventId = req.params.id;
    const { event, date ,description, time, type, numberOfSeats } = req.body;

    Event.findByIdAndUpdate(eventId, { name: event, date, description, time, type, numberOfSeats }, { new: true })
    .then(editedEvent => {
        req.flash('success', 'تم تعديل الميعاد بنجاح');
        res.redirect(`/events/calendars/${editedEvent.calendar}`);
    })
    .catch(err => console.log(err));
});

router.post('/update-calendar/:id', (req, res) => {
    const calendarId = req.params.id;
    const { calendar, description } = req.body;

    Calendar.findByIdAndUpdate(calendarId, { name: calendar, description }, { new: true })
    .then(() => {
        req.flash('success', 'تم تعديل التقويم بنجاح');
        res.redirect(`/events/calendars`);  // Redirect to the calendar list after successful edit
    })
    .catch(err => console.log(err));
});


// Delete Event Route
router.post('/delete-event/:id', (req, res) => {
    const eventId = req.params.id;

    Event.findByIdAndDelete(eventId)
    .then(deletedEvent => {
        req.flash('success', 'تم مسح الميعاد بنجاح');
        res.redirect(`/events/calendars/${deletedEvent.calendar}`);
    })
    .catch(err => console.log(err));
});

router.post('/delete-calendar/:id', (req, res) => {
    const calendarId = req.params.id;

    Calendar.findByIdAndDelete(calendarId)
    .then(() => {
        req.flash('success', 'تم مسح التقويم بنجاح');
        res.redirect(`/events/calendars`);
    })
    .catch(err => console.log(err));
});

// Route to render the calendar creation form
router.get('/add-calendar', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.render('events/calendar/add-calendar');
});

// Route to handle the calendar creation form submission
router.post('/add-calendar', (req, res) => {
    const { name, description } = req.body;

    const newCalendar = new Calendar({
        name,
        description,
    });

    newCalendar.save()
        .then(() => {
            req.flash('success', 'تم انشاء التقويم بنجاح');
            res.redirect('/events/calendars');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Error creating the calendar.');
        });
});

router.get('/calendars', async (req, res) => {
    const calendars = await Calendar.find({});

    res.render('events/calendar/index-calendar', {calendars: calendars})
})

router.get('/calendars/:id', async (req, res) => {
    const  id = req.params.id;
    const  calendar = await Calendar.findById(id)
    res.render('events/calendar/calendar', {calendar: calendar})
})

function getSeatClass(seat, seatsWithTickets) {
    const ticket = seatsWithTickets[seat.seatNumber];
    if (ticket && ticket.status !== 'cancelled') {
        switch (ticket.type) {
            case 'تذكرة كاملة':
                return 'seat-full';
            case 'نصف تذكرة':
                return 'seat-half';
            case 'حجز مالك':
                return 'seat-owner';
            default:
                return '';
        }
    } else if (!ticket && seat.isReserved) {
        return 'seat-temporary';
    }
    return '';
}

router.get('/show-event/:eventId', async (req, res) => {
    const { eventId } = req.params;

    try {
        const event = await Event.findById(eventId);
        const tickets = await Ticket.find({ event: eventId });

        if (!event) {
            return res.status(404).send('Event not found');
        }

        // Fetch seats associated with the event
        const seats = await Seat.find({ event: eventId });

        // Map seats to the corresponding ticket if they exist
        const seatsWithTickets = {};
        tickets.forEach(ticket => {
            seatsWithTickets[ticket.seatNumber] = ticket;
        });

        seats.forEach(seat => {
            seat.seatClass = getSeatClass(seat, seatsWithTickets);
        });

        // Format the time to AM/PM format
        const formattedTime = new Date(`1970-01-01T${event.time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        });

        event.formattedTime = formattedTime; // Add formatted time to the event object

        // Pass seatsWithTickets and seats to the view
        res.render('events/event/show-event', { event, tickets, seats, currentUserId: req.user._id, currentUser: req.user });
    } catch (err) {
        console.error('Error fetching event, tickets, or seats:', err);
        res.status(500).send('Server error while fetching event, tickets, or seats');
    }
});

// Route to toggle seat reservation
router.post('/toggle-reserve/:seatId', async (req, res) => {
    const { seatId } = req.params;
    const userId = req.user._id; // Assuming req.user contains the logged-in user information

    try {
        // Find the seat
        const seat = await Seat.findById(seatId);

        if (!seat) {
            return res.status(404).json({ error: 'Seat not found' });
        }

        // Check if the seat is reserved by another user
        if (seat.isReserved && seat.reservedBy && !seat.reservedBy.equals(userId)) {
            return res.status(403).json({ error: 'You are not allowed to unreserve this seat' });
        }

        // Toggle the reservation status and set the user if reserved
        seat.isReserved = !seat.isReserved;
        seat.reservedBy = seat.isReserved ? userId : null;

        await seat.save();

        res.json({ success: true, isReserved: seat.isReserved });
    } catch (err) {
        console.error('Error toggling seat reservation:', err);
        res.status(500).json({ error: 'An error occurred while toggling reservation' });
    }
});



module.exports = router;
