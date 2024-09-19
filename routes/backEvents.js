const express = require("express")
const router = express.Router()
const BackEvent = require('../models/backEvents');


router.get('/', (req, res) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
  
    res.render('events/backEvents/calendar', { year, month });
});
  
// Route to fetch events for a specific date
router.get('/events/:date', (req, res) => {
    const selectedDate = req.params.date;
    
    BackEvent.find({ date: selectedDate })
    .then(events => res.json({ events }))
    .catch(err => console.log(err));
});
  
// Route to handle event creation
router.post('/add-event', (req, res) => {
    const { date, time, event, driverName, driverPhoneNumber, busPlateNumber, busPhoneNumber, notice } = req.body;
    
    const newBackEvent = new BackEvent({
        date,
        time,
        title: event,
        driverName,
        driverPhoneNumber,
        busPlateNumber,
        busPhoneNumber,    
        notice,
    });
    
    newBackEvent.save()
    .then(() => {
      req.flash('success', 'تم اضافة ميعاد جديد بنجاح');
      res.redirect('/backEvents')
    }) // Redirect to the calendar page after saving
    .catch(err => console.log(err));
});
  
// Route to display the Add BackEvent form
router.get('/add-event', (req, res) => {
      res.render('events/backEvents/add-event');
});
    
// Route to show the edit event form
router.get('/edit-event/:id', (req, res) => {
  const eventId = req.params.id;
    
  BackEvent.findById(eventId)
  .then(event => {
    res.render('events/backEvents/edit-event', { event });
  })
  .catch(err => console.log(err));
});
  
    // Route to update an event
router.post('/update-event/:id', (req, res) => {
  const eventId = req.params.id;
  const { event, description, time } = req.body;
    
  BackEvent.findByIdAndUpdate(eventId, { name: event, description, time }, { new: true })
  .then(() => {
    req.flash('success', 'تم تعديل الميعاد بنجاح');
    res.redirect('/backEvents')
  })
  .catch(err => console.log(err));
});
  
    // Route to delete an event
router.post('/delete-event/:id', (req, res) => {
  const eventId = req.params.id;
  
  BackEvent.findByIdAndDelete(eventId)
  .then(() => {
    req.flash('success', 'تم مسح الميعاد بنجاح');
    res.redirect('/backEvents')
  })
  .catch(err => console.log(err));
});
  
  // Route to get dates with events
  router.get('/dates-with-events', (req, res) => {
      BackEvent.distinct('date')
        .then(datesWithEvents => {
          console.log('Dates with events fetched:', datesWithEvents); // Debugging output
          res.json({ datesWithEvents });
        })
        .catch(err => {
          console.error('Error fetching dates with events:', err);
          res.status(500).json({ error: 'Failed to fetch dates with events' });
        });
});

module.exports = router