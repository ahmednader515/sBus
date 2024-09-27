const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const Seat = require('../models/Seat');

// Assuming your event model is imported and the route is defined correctly

// Route to render the add-ticket form
router.get('/add-full-ticket/:eventId', async (req, res) => {
    const { eventId } = req.params;
    const { seatNumber } = req.query;  // Getting seatNumber from query string

    try {
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).send('Event not found');
        }

        // Pass the eventId, seatNumber, and event date to the view
        res.render('events/tickets/add-full-ticket', { eventId, seatNumber, eventDate: event.date, eventTime: event.time });
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

        if (!event) {
            return res.status(404).send('Event not found');
        }

        // Pass the eventId, seatNumber, and event date to the view
        res.render('events/tickets/add-half-ticket', { eventId, seatNumber, eventDate: event.date, eventTime: event.time });
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

        if (!event) {
            return res.status(404).send('Event not found');
        }

        // Pass the eventId, seatNumber, and event date to the view
        res.render('events/tickets/add-owner-ticket', { eventId, seatNumber, eventDate: event.date, eventTime: event.time });
    } catch (err) {
        console.error('Error fetching event:', err);
        res.status(500).send('Server error while fetching event');
    }
});

router.post('/add-ticket', async (req, res) => {
    const { ticketFromStation, ownerName ,fromStation, clientName, clientPhoneNumber, ticketClass, price, cardType, cardNumber, eventId, seatNumber, cancel ,type } = req.body;

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

        res.render('events/tickets/ticket-show', { ticket });
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
            ticket.status = 'cancelled';
            ticket.cancel = cancel;
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


module.exports = router;