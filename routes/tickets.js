const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const Seat = require('../models/Seat');
const Setting = require('../models/Setting');

// Assuming your event model is imported and the route is defined correctly

// Route to render the add-ticket form
router.get('/add-full-ticket/:eventId', async (req, res) => {
    const { eventId } = req.params;
    const { seatNumber } = req.query;  // Getting seatNumber from query string

    try {
        const event = await Event.findById(eventId);
        const ticketSettings = await Setting.find({});

        if (!event) {
            return res.status(404).send('Event not found');
        }

        // Pass the eventId, seatNumber, and event date to the view
        res.render('events/tickets/add-full-ticket', { eventId, seatNumber, eventDate: event.date, eventTime: event.time, ticketSettings });
    } catch (err) {
        console.error('Error fetching event:', err);
        res.status(500).send('Server error while fetching event');
    }
});

router.get('/add-half-ticket/:eventId', async (req, res) => {
    const { eventId } = req.params;
    const { seatNumber } = req.query;  // Getting seatNumber from query string

    try {
        const event = await Event.findById(eventId);
        const ticketSettings = await Setting.find({});

        if (!event) {
            return res.status(404).send('Event not found');
        }

        // Pass the eventId, seatNumber, and event date to the view
        res.render('events/tickets/add-half-ticket', { eventId, seatNumber, eventDate: event.date, eventTime: event.time, ticketSettings });
    } catch (err) {
        console.error('Error fetching event:', err);
        res.status(500).send('Server error while fetching event');
    }
});

router.get('/add-owner-ticket/:eventId', async (req, res) => {
    const { eventId } = req.params;
    const { seatNumber } = req.query;  // Getting seatNumber from query string

    try {
        const event = await Event.findById(eventId);
        const ticketSettings = await Setting.find({});

        if (!event) {
            return res.status(404).send('Event not found');
        }

        // Pass the eventId, seatNumber, and event date to the view
        res.render('events/tickets/add-owner-ticket', { eventId, seatNumber, eventDate: event.date, eventTime: event.time, ticketSettings });
    } catch (err) {
        console.error('Error fetching event:', err);
        res.status(500).send('Server error while fetching event');
    }
});

router.post('/add-ticket', async (req, res) => {
    const { ticketFromStation, ownerName ,fromStation, clientName, clientPhoneNumber, ticketClass, price, cardType, cardNumber, eventId, seatNumber, cancel ,type, eventDate } = req.body;

    try {
        // Ensure the eventId is valid
        if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).send('Invalid Event ID');
        }

        // Get the current tickets for the event to generate the serial number
        const existingTickets = await Ticket.find({});
        const serialNumber = (existingTickets.length + 1).toString().padStart(5, '0'); // Generate serial number (00001, 00002, ...)

        // Create a new ticket
        const newTicket = new Ticket({
            ticketFromStation,
            ownerName,
            fromStation,
            clientName,
            clientPhoneNumber,
            ticketClass,
            price,
            cardType,
            cardNumber,
            event: eventId,
            seatNumber: parseInt(seatNumber), // Convert seatNumber to integer
            serial: serialNumber,
            cancel,
            date: eventDate,
            type
        });

        await newTicket.save();

        req.flash('success', 'تم انشاء تذكرة جديدة بنجاح');
        // Redirect to the event show page
        res.redirect(`/events/show-event/${eventId}`);
    } catch (err) {
        console.error('Error creating ticket:', err);
        res.status(500).send('Error creating the ticket.');
    }
});

router.get('/show-ticket/:seatId', async (req, res) => {
    try {
        const seatId = req.params.seatId;
        const ticket = await Ticket.findById(seatId);

        if (!ticket) {
            return res.status(404).send('Ticket not found');
        }

        res.render('events/tickets/show-ticket', { ticket });
    } catch (err) {
        console.error('Error fetching ticket:', err);
        res.status(500).send('Error fetching ticket');
    }
});

router.get('/edit-ticket/:seatId', async (req, res) => {
    try {
        const seatId = req.params.seatId;
        const ticket = await Ticket.findById(seatId);

        if (!ticket) {
            return res.status(404).send('Ticket not found');
        }

        res.render('events/tickets/edit-ticket', { ticket });
    } catch (err) {
        console.error('Error fetching ticket for edit:', err);
        res.status(500).send('Error fetching ticket');
    }
});

router.post('/update-ticket/:seatId', async (req, res) => {
    try {
        const seatId = req.params.seatId;
        const { name, description, status } = req.body;

        // Update the ticket with the new data including the status
        const updatedTicket = await Ticket.findByIdAndUpdate(
            seatId, 
            { name, description, status }, 
            { new: true }
        );

        if (!updatedTicket) {
            return res.status(404).send('Ticket not found');
        }

        // Redirect back to the ticket detail page after successful update
        res.redirect(`/tickets/show-ticket/${seatId}`);
    } catch (err) {
        console.error('Error updating ticket:', err);
        res.status(500).send('Error updating ticket');
    }
});

router.get('/cancel/:ticketId', async (req, res) => {
    const { ticketId } = req.params;

    try {
        // Find the ticket by ID
        const ticket = await Ticket.findById(ticketId);

        // If ticket not found, return an error
        if (!ticket) {
            req.flash('error', 'Ticket not found');
            return res.redirect('back');
        }

        // Render the cancel-ticket.ejs view and pass the ticket details
        res.render('events/tickets/cancel-ticket', { ticket });
    } catch (err) {
        console.error('Error fetching ticket for cancellation:', err);
        req.flash('error', 'Server error while fetching ticket');
        res.redirect('back');
    }
});


// Route to cancel the ticket
router.post('/cancel/:ticketId', async (req, res) => {
    const { clientName, clientPhoneNumber, price, cardNumber, ownerName, cancel } = req.body;
    const { ticketId } = req.params;  // Get the ticket ID from the request params

    try {
        // Fetch the ticket based on the provided ticketId
        const ticket = await Ticket.findById(ticketId);

        // If ticket not found, send an error
        if (!ticket) {
            return res.status(404).send('Ticket not found');
        }

        // Verify the details entered match the ticket details
        if (
            (ticket.type === 'تذكرة كاملة' && ticket.clientName === clientName && ticket.clientPhoneNumber === clientPhoneNumber && ticket.price === price) ||
            (ticket.type === 'نصف تذكرة' && ticket.clientName === clientName && ticket.clientPhoneNumber === clientPhoneNumber && ticket.price === price && ticket.cardNumber === cardNumber) ||
            (ticket.type === 'حجز مالك' && ticket.ownerName === ownerName && ticket.clientName === clientName && ticket.clientPhoneNumber === clientPhoneNumber && ticket.price === price)
        ) {
            // If validation passes, update ticket status to "cancelled"
            ticket.type = 'ملغية';
            ticket.status = 'ملغية';
            ticket.cancel = cancel;
            ticket.seatNumber = 'تم الغاء التذكرة';
            await ticket.save();

            req.flash('success', 'تم إلغاء التذكرة بنجاح');
            res.redirect(`/events/show-event/${ticket.event}`);
        } else {
            // If validation fails, send an error message
            req.flash('error', 'بيانات غير صحيحة. الرجاء التأكد من صحة البيانات المدخلة.');
            res.redirect(`/tickets/cancel/${ticket._id}`); // Redirect back to the form
        }
    } catch (err) {
        console.error('Error cancelling ticket:', err);
        res.status(500).send('Server error while cancelling ticket');
    }
});

router.get('/transferDate/:ticketId', async (req, res) => {
    const { ticketId } = req.params;

    try {
        // Find the ticket by ID
        const ticket = await Ticket.findById(ticketId);
        const events = await Event.find({});

        // If ticket not found, return an error
        if (!ticket) {
            req.flash('error', 'Ticket not found');
            return res.redirect('back');
        }

        // Render the cancel-ticket.ejs view and pass the ticket details
        res.render('events/tickets/transfer-date', { ticket, events });
    } catch (err) {
        console.error('Error fetching ticket for cancellation:', err);
        req.flash('error', 'Server error while fetching ticket');
        res.redirect('back');
    }
});

router.post('/transferDate/:ticketId', async (req, res) => {
    const { newEventId, clientName, clientPhoneNumber, price, cardNumber, ownerName, cancel } = req.body;
    const { ticketId } = req.params;  // Get the ticket ID from the request params

    try {
        // Fetch the ticket based on the provided ticketId
        const ticket = await Ticket.findById(ticketId);

        // If ticket not found, send an error
        if (!ticket) {
            req.flash('error', 'Ticket not found');
            return res.redirect('back');
        }

        // Verify the details entered match the ticket details
        if (
            (ticket.type === 'تذكرة كاملة' && ticket.clientName === clientName && ticket.clientPhoneNumber === clientPhoneNumber && ticket.price === price) ||
            (ticket.type === 'نصف تذكرة' && ticket.clientName === clientName && ticket.clientPhoneNumber === clientPhoneNumber && ticket.price === price && ticket.cardNumber === cardNumber) ||
            (ticket.type === 'حجز مالك' && ticket.ownerName === ownerName && ticket.clientName === clientName && ticket.clientPhoneNumber === clientPhoneNumber && ticket.price === price)
        ) {
            // Fetch the new event using the newEventId
            const newEvent = await Event.findById(newEventId);
            if (!newEvent) {
                req.flash('error', 'Invalid event selected.');
                return res.redirect('back');
            }

            // Update the ticket with the new event and date
            ticket.event = newEventId;
            ticket.date = newEvent.date;  // Set the ticket date to the new event's date
            ticket.notice = cancel;

            await ticket.save();  // Save the updated ticket

            req.flash('success', 'تم نقل التذكرة إلى الحدث الجديد بنجاح');
            res.redirect(`/events/show-event/${newEventId}`);
        } else {
            // If validation fails, send an error message
            req.flash('error', 'بيانات غير صحيحة. الرجاء التأكد من صحة البيانات المدخلة.');
            res.redirect(`/tickets/transferDate/${ticket._id}`); // Redirect back to the form
        }
    } catch (err) {
        console.error('Error transferring ticket:', err);
        res.status(500).send('Server error while transferring ticket');
    }
});

router.get('/extraWeight/:ticketId', async (req, res) => {
    const { ticketId } = req.params;

    try {
        // Find the ticket by ID
        const ticket = await Ticket.findById(ticketId);

        // If ticket not found, return an error
        if (!ticket) {
            req.flash('error', 'Ticket not found');
            return res.redirect('back');
        }

        // Render the cancel-ticket.ejs view and pass the ticket details
        res.render('events/tickets/extra-weight', { ticket });
    } catch (err) {
        console.error('Error fetching ticket for cancellation:', err);
        req.flash('error', 'Server error while fetching ticket');
        res.redirect('back');
    }
});

router.post('/extraWeight/:ticketId', async (req, res) => {
    const { clientName, clientPhoneNumber, price, cardNumber, ownerName, cancel, extraPrice, weightType } = req.body;
    const { ticketId } = req.params;  // Get the ticket ID from the request params

    try {
        // Fetch the ticket based on the provided ticketId
        const ticket = await Ticket.findById(ticketId);

        // If ticket not found, send an error
        if (!ticket) {
            req.flash('error', 'Ticket not found');
            return res.redirect('back');
        }

        // Verify the details entered match the ticket details
        if (
            (ticket.type === 'تذكرة كاملة' && ticket.clientName === clientName && ticket.clientPhoneNumber === clientPhoneNumber && ticket.price === price) ||
            (ticket.type === 'نصف تذكرة' && ticket.clientName === clientName && ticket.clientPhoneNumber === clientPhoneNumber && ticket.price === price && ticket.cardNumber === cardNumber) ||
            (ticket.type === 'حجز مالك' && ticket.ownerName === ownerName && ticket.clientName === clientName && ticket.clientPhoneNumber === clientPhoneNumber && ticket.price === price)
        ) {

            ticket.weightType = weightType;
            ticket.extraPrice = extraPrice;

            await ticket.save();  // Save the updated ticket

            req.flash('success', 'تم التعديل علي التذكرة بنجاح');
            res.redirect(`/events/show-event/${ticket.event}`);
        } else {
            // If validation fails, send an error message
            req.flash('error', 'بيانات غير صحيحة. الرجاء التأكد من صحة البيانات المدخلة.');
            res.redirect(`/tickets/transferDate/${ticket._id}`); // Redirect back to the form
        }
    } catch (err) {
        console.error('Error transferring ticket:', err);
        res.status(500).send('Server error while transferring ticket');
    }
});

router.get('/changeSeat/:ticketId', async (req, res) => {
    const { ticketId } = req.params;

    try {
        // Find the ticket by ID
        const ticket = await Ticket.findById(ticketId);
        const seats = await Seat.find({event: ticket.event, isReserved: false});

        // If ticket not found, return an error
        if (!ticket) {
            req.flash('error', 'Ticket not found');
            return res.redirect('back');
        }

        // Render the cancel-ticket.ejs view and pass the ticket details
        res.render('events/tickets/change-seat', { ticket, seats });
    } catch (err) {
        console.error('Error fetching ticket for cancellation:', err);
        req.flash('error', 'Server error while fetching ticket');
        res.redirect('back');
    }
});

router.post('/changeSeat/:ticketId', async (req, res) => {
    const { clientName, clientPhoneNumber, price, cardNumber, ownerName, newSeat } = req.body;
    const { ticketId } = req.params;  // Get the ticket ID from the request params

    try {
        // Fetch the ticket based on the provided ticketId
        const ticket = await Ticket.findById(ticketId);

        // If ticket not found, send an error
        if (!ticket) {
            req.flash('error', 'Ticket not found');
            return res.redirect('back');
        }

        // Verify the details entered match the ticket details
        if (
            (ticket.type === 'تذكرة كاملة' && ticket.clientName === clientName && ticket.clientPhoneNumber === clientPhoneNumber && ticket.price === price) ||
            (ticket.type === 'نصف تذكرة' && ticket.clientName === clientName && ticket.clientPhoneNumber === clientPhoneNumber && ticket.price === price && ticket.cardNumber === cardNumber) ||
            (ticket.type === 'حجز مالك' && ticket.ownerName === ownerName && ticket.clientName === clientName && ticket.clientPhoneNumber === clientPhoneNumber && ticket.price === price)
        ) {
            // Check if the selected newSeat is reserved by another ticket
            const existingTicket = await Ticket.findOne({ seatNumber: newSeat, event: ticket.event });

            if (existingTicket) {
                // Swap seats between the two tickets
                const tempSeat = existingTicket.seatNumber;
                existingTicket.seatNumber = ticket.seatNumber;
                ticket.seatNumber = tempSeat;

                // Save both tickets
                await existingTicket.save();
                await ticket.save();

                req.flash('success', 'تم تبديل الكرسي بنجاح مع عميل آخر');
            } else {
                // If the seat is not reserved, simply assign the new seat
                ticket.seatNumber = newSeat;
                await ticket.save();

                req.flash('success', 'تم تبديل الكرسي بنجاح');
            }

            res.redirect(`/events/show-event/${ticket.event}`);
        } else {
            // If validation fails, send an error message
            req.flash('error', 'بيانات غير صحيحة. الرجاء التأكد من صحة البيانات المدخلة.');
            res.redirect(`/tickets/changeSeat/${ticket._id}`); // Redirect back to the form
        }
    } catch (err) {
        console.error('Error transferring ticket:', err);
        req.flash('error', 'Server error while transferring ticket');
        res.redirect('back');
    }
});

router.get('/settings', (req, res) => {
    res.render('events/tickets/settings');
});

router.post('/settings', async(req, res) => {
    const { ticketFromStation, fromStation, price, cardType } = req.body;

    const newSetting = new Setting({
        ticketFromStation,
        fromStation,
        price,
        cardType
    });

    await newSetting.save();
    req.flash('success', 'تم اضافة الإعدادات بنجاح');
    res.redirect('/tickets/settings');
});

module.exports = router;