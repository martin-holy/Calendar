let app = {};

window.addEventListener('load', () => {
  app.scrollBox = document.getElementById('scrollbox');
  app.content = document.getElementById('content');
  app.heather = document.getElementById('heather');
  app.heatherYear = document.getElementById('heather_year');
  app.heatherMonth = document.getElementById('heather_month');
  app.monthSelect = document.getElementById('month_select');

  app.scrollBox.addEventListener('scroll', () => {
    addItem();
    setHeatherMonthAndYear();
  }, false);
  
  initCalendar((new Date(Date.now())).setHours(0, 0, 0, 0));
  createMonthSelect();
}, false);

function initCalendar(startDate) {
  app.content.innerHTML = '';
  app.dateFrom = new Date(startDate);
  app.dateTo = new Date(startDate);
  app.dateTo.setDate(app.dateTo.getDate() - 1);
  addItem();
  setHeatherMonthAndYear();
}

function addItem() {
  let sb = app.scrollBox;

  // add future dates
  if (sb.scrollHeight - sb.scrollTop - sb.clientHeight < sb.clientHeight) {
    app.dateTo.setDate(app.dateTo.getDate() + 1);
    app.content.appendChild(createItem(app.dateTo));
    addItem();
  }

  // add past dates
  if (sb.scrollHeight > sb.clientHeight && sb.scrollTop < sb.clientHeight) {
    let oldst = sb.scrollTop,
        oldsh = sb.scrollHeight;

    // scrollTop will be updated by browser if is > 0 // works in Chrome
    if (sb.scrollTop == 0) sb.scrollTop = 1;

    app.dateFrom.setDate(app.dateFrom.getDate() - 1);
    app.content.insertBefore(createItem(app.dateFrom), app.content.children[0]);

    if (sb.scrollTop <= oldst) { // <= insted of == is there just in case something goes wrong :)
      // browser didn't update scrollTop // Firefox, Edge, ?
      // not smooth scroll when scrolling up
      sb.scrollTop += sb.scrollHeight - oldsh;
    }

    addItem();
  }
}

function createItem(date) {
  let day = document.createElement('div'),
      dayOfWeek = date.getDay();
  day.setAttribute('data-date', date.getTime());
  day.classList.add(`month${date.getMonth()}`);
  day.classList.add('day');

  day.innerHTML = `
    <div class="dayBox${dayOfWeek == 0 || dayOfWeek == 6 ? ' weekend' : ''}">
      <span class="dayNr">${date.getDate()}</span>
      <span class="dayName">${date.toLocaleDateString(navigator.language, {weekday: 'short'})}</span>
    </div>`;

  return day;
}

function setHeatherMonthAndYear() {
  let elm = document.elementFromPoint(3, window.innerHeight / 2),
      atr = elm.getAttribute('data-date');

  if (atr == null) return;

  let date = new Date(parseInt(atr)),
      month = date.getMonth();

  if (app.currentMonth == month) return;

  app.currentMonth = month;
  app.currentYear = date.getFullYear();
  app.heatherYear.innerText = app.currentYear;
  app.heatherMonth.innerText = date.toLocaleDateString(navigator.language, {month: 'long'});
  app.heather.className = `month${month}`;
}

function createMonthSelect() {
  let months = [];
  for (let i = 0; i < 12; i++) {
    let monthName = (new Date(2019, i)).toLocaleDateString(navigator.language, {month: 'short'});
    months.push(`<div class="month${i}" onclick="setMonth(${i});">${monthName}</div>`);
  }
  app.monthSelect.innerHTML = months.join('');
}

function setMonth(index) {
  app.monthSelect.style.visibility = 'hidden';
  initCalendar(new Date(app.currentYear, index, 1, 0, 0, 0, 0));
}

function showMonthSelect() {
  app.monthSelect.style.visibility = 'visible';
}