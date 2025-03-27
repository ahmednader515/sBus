const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Calendar = require('../models/Calendar');
const Ticket = require('../models/Ticket');
const Seat = require('../models/Seat');
const Package = require('../models/Package');
const mongoose = require('mongoose');

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

        const seats = Array.from({ length: numberOfSeats }, (_, i) => ({
            seatNumber: i + 1,
            event: newEvent._id
        }));

        const packages = Array.from({ length: 10 }, (_, i) => ({
            event: newEvent._id,
            packageNumber: i + 1
        }));

        await Promise.all([
            Seat.insertMany(seats, { ordered: false }),
            Package.insertMany(packages, { ordered: false })
        ]);

        req.flash('success', 'تم اضافة ميعاد جديد بنجاح');
        
        console.log('Event created, redirecting...');

        // Direct redirect instead of setImmediate
        res.redirect(`/events/calendars/${calendar}`);
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
        const tickets = await Ticket.find({event: eventId});
        const fullTickets = await Ticket.find({event: eventId, type: 'تذكرة كاملة'})
        const halfTickets = await Ticket.find({event: eventId, type: 'نصف تذكرة'})
        const ownerTickets = await Ticket.find({event: eventId, type: 'حجز مالك'})
        const cancelledTickets = await Ticket.find({event: eventId, type: 'ملغية'})
        const transferedTickets = await Ticket.find({transferedFrom: eventId, isTransfered: true});
        const changedSeatTickets = await Ticket.find({event: eventId, isSeatChanged: true})
        const packages = await Package.find({event: eventId});

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
        res.render('events/event/show-event', { event, tickets, seatsWithTickets, seats, currentUserId: req.user._id, currentUser: req.user, fullTickets, halfTickets,  cancelledTickets, ownerTickets, transferedTickets, changedSeatTickets, packages });

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

router.get('/packages/:eventId/:packageNumber', async(req, res) => {
    const { eventId, packageNumber } = req.params;
    const  createdBy = req.user;

    try {
        const packages = await Package.find({ event: eventId });
        res.render('events/event/packages', {createdBy, eventId, packageNumber, packages});
    } catch(error) {
        console.error(error);
        req.flash('error', 'حدث خطأ أثناء استرجاع الطرود');
        res.redirect('/some-error-page');
    }
});

router.post('/packages/new-package', async (req, res) => {
    const { 
        date,
        billNumber,
        senderName,
        senderPhoneNumber,
        senderCardNumber,
        recieverName,
        recieverPhoneNumber,
        packageContents,
        price,
        createdBy,
        notice,
        eventId,
        packageNumber
     } = req.body;
    
    try {

        const existingPackages = await Package.find({});
        const serialNumber = (existingPackages.length + 1).toString().padStart(5, '0');

        const newPackage = new Package({
            date,
            packageNumber: packageNumber,
            event: eventId,
            billNumber,
            senderName,
            senderPhoneNumber,
            senderCardNumber,
            recieverName,
            recieverPhoneNumber,
            packageContents,
            price,
            createdBy: createdBy, // Ensure it maps to created_by correctly
            notice,
            serial: serialNumber,
        });

        await newPackage.save();
        req.flash('success', 'تم انشاء طرد جديد بنجاح');
        res.redirect(`/events/show-event/${eventId}`);
    } catch (error) {
        console.error(error);
        req.flash('error', 'حدث خطأ أثناء إنشاء الطرد');
        res.redirect(`/events/show-event/${eventId}`);
    }
});

router.get('/packages/transferDate/:eventId/:packageNumber', async(req, res) => {
    const { eventId, packageNumber } = req.params;

    try {

        // Validate eventId
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            req.flash('error', 'Invalid Event ID');
            return res.redirect('back');
        }

        const currentEvent = await Event.findById(eventId);

        // Find the package using mongoose.Types.ObjectId
        const package = await Package.findOne({
            packageNumber: packageNumber,
            event: currentEvent._id
        });
        const events = await Event.find({});


        // If Package not found, return an error
        if (!package) {
            req.flash('error', 'Package not found');
            return res.redirect('back');
        }

        // Render the cancel-ticket.ejs view and pass the ticket details
        res.render('events/packages/transfer-date', { package, events, eventId });
    } catch (err) {
        console.error('Error fetching package for transfering:', err);
        req.flash('error', 'Server error while fetching ticket');
    }
});

router.post('/packages/transferDate/:eventId/:packageNumber', async (req, res) => {
    const { newEventId, senderName, senderPhoneNumber, price, transfer } = req.body;
    const { eventId, packageNumber } = req.params;  // Get the package details from the request params

    try {
        // Fetch the package based on the provided eventId and packageNumber
        const package = await Package.findOne({ event: eventId, packageNumber: packageNumber });

        // If package not found, send an error
        if (!package) {
            req.flash('error', 'Package not found');
            return res.redirect('back');
        }

        // Verify the details entered match the package details
        if (
            package.senderName === senderName &&
            package.senderPhoneNumber === senderPhoneNumber &&
            package.price === price
        ) {
            // Fetch the new event using the newEventId
            const newEvent = await Event.findById(newEventId);
            if (!newEvent) {
                req.flash('error', 'Invalid event selected.');
                return res.redirect('back');
            }

            // Update the package with the new event and date
            package.event = newEventId;
            package.date = newEvent.date;  // Set the package date to the new event's date
            package.notice = transfer;
            package.isTransfered = true;

            await package.save();  // Save the updated package

            req.flash('success', 'تم نقل الطرد إلى ميعاد الجديد بنجاح');
            res.redirect(`/events/show-event/${newEventId}`);
        } else {
            // If validation fails, send an error message
            req.flash('error', 'بيانات غير صحيحة. الرجاء التأكد من صحة البيانات المدخلة.');
            res.redirect(`/events/packages/transferDate/${eventId}/${packageNumber}`); // Redirect back to the form
        }
    } catch (err) {
        console.error('Error transferring package:', err);
        res.status(500).send('Server error while transferring package');
    }
});

module.exports = router;
