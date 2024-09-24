$(document).ready(function() {
    let currentDate = new Date();
    let currentView = 'ذهاب';

    $('#selected-date').text(formatDate(currentDate));
    $('#event-type').text(`مواعيد ال${currentView}`);

    renderYearDropdown();

    function formatDate(date) {
        return date.toLocaleDateString('en-CA'); // 'en-CA' formats the date as YYYY-MM-DD
    }

    function formatTime(time) {
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
        const fullDateTime = `${today}T${time}`; // Combine the date with the time string
        const eventTime = new Date(fullDateTime); // Create a Date object

        if (isNaN(eventTime.getTime())) {
            console.error('Invalid time format:', time);
            return 'Invalid time'; // Handle invalid time formats gracefully
        }

        return eventTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    function renderCalendar(date, eventDays = []) {
        const year = date.getFullYear();
        const month = date.getMonth();

        $('#current-month').text(new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date));
        $('#month-dropdown').val(month); // Update the month dropdown
        $('#year-dropdown').val(year); // Update the year dropdown

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        $('#calendar').empty();
        let calendarHTML = '<tr>';
        const daysOfWeek = ['الأحد', 'الأثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        for (let day of daysOfWeek) {
            calendarHTML += `<th>${day}</th>`;
        }
        calendarHTML += '</tr><tr>';

        for (let i = 0; i < firstDay; i++) {
            calendarHTML += '<td></td>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            if ((firstDay + day - 1) % 7 === 0 && day !== 1) {
                calendarHTML += '</tr><tr>';
            }

            const dayDate = formatDate(new Date(year, month, day));
            const hasEvent = eventDays.includes(dayDate); // Check if the day has events

            // Add classes for styling
            const eventClass = hasEvent ? 'day has-event' : 'day';
            calendarHTML += `<td class="${eventClass}" data-date="${dayDate}">${day}</td>`;
        }

        calendarHTML += '</tr>';
        $('#calendar').append(calendarHTML);
    }

    function renderYearDropdown() {
        const yearDropdown = $('#year-dropdown');
        const currentYear = currentDate.getFullYear();
        const startYear = currentYear - 10; // Show 10 years before the current year
        const endYear = currentYear + 10; // Show 10 years after the current year

        yearDropdown.empty(); // Clear previous options before appending new ones

        for (let year = startYear; year <= endYear; year++) {
            yearDropdown.append(`<option value="${year}">${year}</option>`);
        }

        yearDropdown.val(currentYear); // Set the current year as default
    }

    function fetchMonthEvents(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const calendarId = $('#calendar-id').val();

        return $.get(`/events/month/${year}/${month}?calendarId=${calendarId}`);
    }

    function fetchEventsForDate(date, type) {
        const calendarId = $('#calendar-id').val();

        $.get(`/events/event/${date}?type=${type}&calendarId=${calendarId}`, function(data) {
            $('#event-list').empty();
            const events = data.events;
            if (events.length > 0) {
                events.forEach(event => {
                    const formattedTime = formatTime(event.time);
                    $('#event-list').append(`
                        <div class="event-card">
                            <div class="texts-container">
                            <h3>${event.name}</h3>
                            <p>الوقت: ${formattedTime}</p>
                            <p>الملاحظات:  ${event.notice}</p>
                            </div>
                            <div class="buttons-container">
                            <form class="button-form" action="/events/show-event/${event._id}" method="get">
                                <button class="btn" type="submit">المزيد</button>
                            </form>
                            <form class="button-form" action="/events/edit-event/${event._id}" method="get">
                                <button class="btn" type="submit">تعديل</button>
                            </form>
                            <form class="button-form" action="/events/delete-event/${event._id}" method="POST">
                                <button class="btn" type="submit">مسح</button>
                            </form>
                            </div>
                        </div>`
                    );
                });
            } else {
                $('#event-list').append(`<p class="event-card">لا يوجد مواعيد ${type} في هذا التاريخ</p>`);
            }
        });
    }

    function renderFullCalendar() {
        fetchMonthEvents(currentDate).then(data => {
            const eventDays = data.events.map(event => event.date);
            renderCalendar(currentDate, eventDays); // Pass the days with events
        });
    }

    // Initialize the calendar
    renderYearDropdown();
    renderFullCalendar();
    fetchEventsForDate(formatDate(currentDate), currentView);

    // Update events for the selected date
    $('#calendar').on('click', '.day', function() {
        // Remove the 'selected' class from all days
        $('.day').removeClass('selected');
    
        // Add the 'selected' class to the clicked day
        $(this).addClass('selected');
    
        const selectedDate = $(this).data('date');
        $('#selected-date').text(selectedDate);
        fetchEventsForDate(selectedDate, currentView);
    });

    // Navigation and dropdown handlers
    $('#prev-month').click(function() {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderFullCalendar();
    });

    $('#next-month').click(function() {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderFullCalendar();
    });

    $('#month-dropdown').change(function() {
        const selectedMonth = parseInt($(this).val());
        currentDate.setMonth(selectedMonth);
        renderFullCalendar();
    });

    $('#year-dropdown').change(function() {
        const selectedYear = parseInt($(this).val());
        currentDate.setFullYear(selectedYear);
        renderFullCalendar();
    });

    // Switch event type
    $('#show-going').click(function() {
        currentView = 'ذهاب';
        fetchEventsForDate(formatDate(currentDate), currentView);
        $('#event-type').text(`مواعيد ال${currentView}`);
        $('#selected-date').text(formatDate(currentDate));
    });

    $('#show-return').click(function() {
        currentView = 'عودة';
        fetchEventsForDate(formatDate(currentDate), currentView);
        $('#event-type').text(`مواعيد ال${currentView}`);
        $('#selected-date').text(formatDate(currentDate));
    });
});
