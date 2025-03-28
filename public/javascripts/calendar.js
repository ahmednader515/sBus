$(document).ready(function () {
    let currentDate = new Date();
    let currentView = 'ذهاب';

    $('#selected-date').text(formatDate(currentDate));
    $('#event-type').text(`مواعيد ال${currentView}`);

    renderYearDropdown();

    // ==============================
    // ✅ Show/Hide Loading
    // ==============================
    function showLoading() {
        $('#loading-overlay').fadeIn();
    }    

    function hideLoading() {
        $('#loading-overlay').fadeOut();
    }

    // ==============================
    // ✅ Format Date and Time
    // ==============================
    function formatDate(date) {
        return date.toLocaleDateString('en-CA'); // 'YYYY-MM-DD'
    }

    function formatTime(time) {
        const today = new Date().toISOString().split('T')[0]; 
        const fullDateTime = `${today}T${time}`; 
        const eventTime = new Date(fullDateTime);

        if (isNaN(eventTime.getTime())) {
            console.error('Invalid time format:', time);
            return 'Invalid time';
        }

        return eventTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    // ==============================
    // ✅ Render Calendar
    // ==============================
    function renderCalendar(date, eventDays = []) {
        const year = date.getFullYear();
        const month = date.getMonth();

        $('#current-month').text(new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date));
        $('#month-dropdown').val(month);
        $('#year-dropdown').val(year);

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
            const hasEvent = eventDays.includes(dayDate);

            const eventClass = hasEvent ? 'day has-event' : 'day';
            calendarHTML += `<td class="${eventClass}" data-date="${dayDate}">${day}</td>`;
        }

        calendarHTML += '</tr>';
        $('#calendar').append(calendarHTML);
    }

    // ==============================
    // ✅ Render Year Dropdown
    // ==============================
    function renderYearDropdown() {
        const yearDropdown = $('#year-dropdown');
        const currentYear = currentDate.getFullYear();
        const startYear = currentYear - 10;
        const endYear = currentYear + 10;

        yearDropdown.empty();

        for (let year = startYear; year <= endYear; year++) {
            yearDropdown.append(`<option value="${year}">${year}</option>`);
        }

        yearDropdown.val(currentYear);
    }

    // ==============================
    // ✅ Fetch Events
    // ==============================
    function fetchMonthEvents(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const calendarId = $('#calendar-id').val();

        return $.get(`/events/month/${year}/${month}?calendarId=${calendarId}`);
    }

    function fetchEventsForDate(date, type) {
        const calendarId = $('#calendar-id').val();

        showLoading();
        return $.get(`/events/event/${date}?type=${type}&calendarId=${calendarId}`, function (data) {
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
                                <p>الملاحظات: ${event.notice}</p>
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
                        </div>
                    `);
                });
            } else {
                $('#event-list').append(`<p class="event-card">لا يوجد مواعيد ${type} في هذا التاريخ</p>`);
            }

            hideLoading();
        });
    }

    function renderFullCalendar() {
        showLoading();
        fetchMonthEvents(currentDate).then(data => {
            const eventDays = data.events.map(event => event.date);
            renderCalendar(currentDate, eventDays);
            hideLoading();
        });
    }

    // ==============================
    // ✅ Initialize the Calendar
    // ==============================
    renderYearDropdown();
    renderFullCalendar();
    fetchEventsForDate(formatDate(currentDate), currentView);

    // ==============================
    // ✅ Click Event: Select Date
    // ==============================
    $('#calendar').on('click', '.day', function () {
        $('.day').removeClass('selected');
        $(this).addClass('selected');

        const selectedDate = $(this).data('date');
        $('#selected-date').text(selectedDate);

        fetchEventsForDate(selectedDate, currentView);
    });

    // ==============================
    // ✅ Navigation and Dropdowns
    // ==============================
    $('#prev-month').click(function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderFullCalendar();
    });

    $('#next-month').click(function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderFullCalendar();
    });

    $('#month-dropdown').change(function () {
        currentDate.setMonth(parseInt($(this).val()));
        renderFullCalendar();
    });

    $('#year-dropdown').change(function () {
        currentDate.setFullYear(parseInt($(this).val()));
        renderFullCalendar();
    });

    // ==============================
    // ✅ Switch Between "Going" and "Return"
    // ==============================
    $('#show-going').click(function () {
        currentView = 'ذهاب';
        fetchEventsForDate(formatDate(currentDate), currentView);
        $('#event-type').text(`مواعيد ال${currentView}`);
        $('#selected-date').text(formatDate(currentDate));
    });

    $('#show-return').click(function () {
        currentView = 'عودة';
        fetchEventsForDate(formatDate(currentDate), currentView);
        $('#event-type').text(`مواعيد ال${currentView}`);
        $('#selected-date').text(formatDate(currentDate));
    });
});
