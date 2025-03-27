$(document).ready(function() {
    let currentDate = new Date();
    let currentView = 'ذهاب';

    $('#selected-date').text(formatDate(currentDate));
    $('#event-type').text(`مواعيد ال${currentView}`);

    renderYearDropdown();

    // === Utility Functions ===
    function formatDate(date) {
        return date.toLocaleDateString('en-CA'); // 'en-CA' formats the date as YYYY-MM-DD
    }

    function formatTime(time) {
        const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
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

    function showLoading() {
        $('#loading-overlay').fadeIn();
    }

    function hideLoading() {
        $('#loading-overlay').fadeOut();
    }

    // === Calendar Rendering ===
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

        // Fill empty days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            calendarHTML += '<td></td>';
        }

        // Fill calendar days
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

    // === Fetch Data ===
    function fetchMonthEvents(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const calendarId = $('#calendar-id').val();

        showLoading();
        return $.get(`/events/month/${year}/${month}?calendarId=${calendarId}`)
            .done(data => {
                const eventDays = data.events.map(event => event.date);
                renderCalendar(date, eventDays);
            })
            .fail(() => {
                alert('Failed to load events.');
            })
            .always(() => hideLoading());
    }

    function fetchEventsForDate(date, type) {
        const calendarId = $('#calendar-id').val();

        showLoading();
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
        }).fail(() => {
            alert('Failed to load events.');
        }).always(() => hideLoading());
    }

    // === Initialize Calendar ===
    renderYearDropdown();
    fetchMonthEvents(currentDate);
    fetchEventsForDate(formatDate(currentDate), currentView);

    // === Event Listeners ===
    $('#calendar').on('click', '.day', function() {
        $('.day').removeClass('selected');
        $(this).addClass('selected');

        const selectedDate = $(this).data('date');
        $('#selected-date').text(selectedDate);
        fetchEventsForDate(selectedDate, currentView);
    });

    // Navigation and Dropdown
    $('#prev-month, #next-month, #month-dropdown, #year-dropdown').on('click change', function() {
        if ($(this).is('#prev-month')) {
            currentDate.setMonth(currentDate.getMonth() - 1);
        } else if ($(this).is('#next-month')) {
            currentDate.setMonth(currentDate.getMonth() + 1);
        } else if ($(this).is('#month-dropdown')) {
            currentDate.setMonth(parseInt($(this).val()));
        } else if ($(this).is('#year-dropdown')) {
            currentDate.setFullYear(parseInt($(this).val()));
        }
        fetchMonthEvents(currentDate);
    });

    // Switch Event Type
    $('#show-going, #show-return').on('click', function() {
        currentView = $(this).attr('id') === 'show-going' ? 'ذهاب' : 'عودة';
        $('#event-type').text(`مواعيد ال${currentView}`);
        fetchEventsForDate(formatDate(currentDate), currentView);
    });
});