const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Calendar = require('../models/Calendar');

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
router.post('/add-event', (req, res) => {
    const { date, time, event, driverName, driverPhoneNumber, busPlateNumber, busPhoneNumber, notice, calendar, type } = req.body;

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
        busPhoneNumber
    });

    newEvent.save()
    .then(() => {
        req.flash('success', 'تم اضافة ميعاد جديد بنجاح');
        res.redirect('/events/calendars/' +  calendar);
    })
    .catch(err => console.log(err));
});

// Edit Event Route
router.get('/edit-event/:id', (req, res) => {
    const eventId = req.params.id;

    Event.findById(eventId)
    .then(event => {
        res.render('events/event/edit-event', { event });
    })
    .catch(err => console.log(err));
});

router.get('/edit-calendar/:id', (req, res) => {
    const calendarId = req.params.id;

    Calendar.findById(calendarId)
    .then(calendar => {
        res.render('events/calendar/edit-calendar', { calendar });
    })
    .catch(err => console.log(err));
});

// Update Event Route
router.post('/update-event/:id', (req, res) => {
    const eventId = req.params.id;
    const { event, date ,description, time, type } = req.body;

    Event.findByIdAndUpdate(eventId, { name: event, date, description, time, type }, { new: true })
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
        res.redirect(`/events/calendars`);
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

router.get('/show-event/:id', async (req, res) => {
    const id = req.params.id;
    const event = await Event.findById(id)
    res.render('events/event/show-event', {event:  event})
})


module.exports = router;
