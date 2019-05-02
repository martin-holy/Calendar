let app = {};

window.addEventListener('load', () => {
  initApp();
}, false);

function initApp() {
  app.heather = {
    elm: document.getElementById('heather'),
    yearElm: document.getElementById('heatherYear'),
    monthElm: document.getElementById('heatherMonth')
  }

  app.month = {
    select: document.getElementById('monthSelect')
  }

  let dateNow = new Date(Date.now());

  // Days
  app.days = {
    content: new LazyLoad(document.getElementById('scrollbox'), createDay, setHeatherMonthAndYear),
    current: { 
      year: dateNow.getFullYear(), 
      month: dateNow.getMonth(), 
      day: dateNow.getDate()}
  };

  // Years
  app.years = {
    content: new LazyLoad(document.getElementById('yearSelect'), createYear)
  };
  app.years.content.create(dateNow.getFullYear(), dateNow.getFullYear());

  // this will create days
  setDaysStart(null, null, null);
  
  // Months
  createMonthSelect();
}

function createYear(years, before) {
  let year;
  if (before) {
    years.min -= 3;
    year = years.min;
  } else {
    years.max += 3;
    year = years.max;
  }

  let elm = document.createElement('div'),
      elmsInRow = 3;
  for (let i = 0; i < elmsInRow; i++) {
    let elmy = document.createElement('div'),
        y = before ? year + i + 1: year + i - elmsInRow + 1
    elmy.innerText = y;
    elmy.addEventListener('click', (e) => {
      app.years.current.className = '';
      app.years.current = e.target;
      app.years.current.className = 'currentYear';
      setDaysStart(parseInt(e.target.innerText), null, null);
    }, false);
    elm.appendChild(elmy);

    if (y == app.days.current.year) {
      elmy.className = 'currentYear';
      app.years.current = elmy;
    }
  }
  
  return elm;
}

function createDay(days, before) {
  let date = new Date(before 
    ? days.min.setDate(days.min.getDate() - 1) 
    : days.max.setDate(days.max.getDate() + 1));
      
  let dayOfWeek = date.getDay(),
      day = document.createElement('div');
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
  let elm = document.elementFromPoint(3, app.days.content.sb.clientHeight / 2),
      atr = elm.getAttribute('data-date');

  if (atr == null) return;

  let date = new Date(parseInt(atr)),
      year = date.getFullYear(),
      month = date.getMonth();

  // todo refresh only when is necessary
  //if (app.days.current.year == year && app.days.current.month == month) return;

  app.days.current.year = year;
  app.days.current.month = month;
  app.heather.yearElm.innerText = year;
  app.heather.monthElm.innerText = date.toLocaleDateString(navigator.language, {month: 'long'});
  app.heather.elm.className = `month${month}`;
}

function createMonthSelect() {
  for (let i = 0; i < 12; i++) {
    let monthName = (new Date(2019, i)).toLocaleDateString(navigator.language, {month: 'short'}),
        div = document.createElement('div');
    div.className = `month${i}`;
    div.innerText = `${monthName} ${i+1}`;
    div.addEventListener('click', (e) => {
      let index = Array.prototype.indexOf.call(e.target.parentElement.children, e.target);
      setDaysStart(null, index, null);
    }, false);
    app.month.select.appendChild(div);
  }
}

function setDaysStart(year, month, day) {
  let c = app.days.current;
  if (year) {
    c.day = 1;
    c.year = year;
    app.years.content.sb.style.visibility = 'hidden';
  }
  if (month) {
    c.day = 1;
    c.month = month;
    app.month.select.style.visibility = 'hidden';
  }
  if (day) c.day = day;

  let min = new Date(c.year, c.month, c.day, 0, 0, 0, 0),
      max = new Date(c.year, c.month, c.day, 0, 0, 0, 0);
  max.setDate(max.getDate() - 1); // initial addItem will increase this by 1
  app.days.content.create(min, max);
}

function showYearSelect() {
  app.years.current.parentElement.previousElementSibling.scrollIntoView();
  app.years.content.sb.style.visibility = 'visible';
  app.month.select.style.visibility = 'hidden';
}

function showMonthSelect() {
  app.years.content.sb.style.visibility = 'hidden';
  app.month.select.style.visibility = 'visible';
}

class LazyLoad {
  constructor(scrollBox, createItemFunc, onChangeFunc) {
    this.sb = scrollBox;
    this.createItem = createItemFunc;
    this.onChange = onChangeFunc;

    this.sb.addEventListener('scroll', () => {
      this.addItem();
      if (this.onChange) this.onChange();
    }, false);
  }

  create(min, max) {
    this.min = min;
    this.max = max;
    this.sb.innerHTML = '';
    this.addItem();
    if (this.onChange) this.onChange();
  }

  addItem() {
    // for debug
    //if (this.sb.children.length > 200) return;
  
    // add future dates
    if (this.sb.scrollHeight - this.sb.scrollTop - this.sb.clientHeight < this.sb.clientHeight) {
      this.sb.appendChild(this.createItem(this, false));
      this.addItem();
    }
  
    // add past dates
    if (this.sb.scrollHeight > this.sb.clientHeight && this.sb.scrollTop < this.sb.clientHeight) {
      let oldst = this.sb.scrollTop,
          oldsh = this.sb.scrollHeight;
  
      // scrollTop will be updated by browser if is > 0 // works in Chrome
      if (this.sb.scrollTop == 0) this.sb.scrollTop = 1;
  
      this.sb.insertBefore(this.createItem(this, true), this.sb.children[0]);
  
      if (this.sb.scrollTop <= oldst) { // <= insted of == is there just in case something goes wrong :)
        // browser didn't update scrollTop // Firefox, Edge, ?
        // not smooth scroll when scrolling up
        this.sb.scrollTop += this.sb.scrollHeight - oldsh;
      }
  
      this.addItem();
    }
  }
}