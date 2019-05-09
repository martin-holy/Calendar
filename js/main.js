let app = {},
    calData = [{id: 1, min: new Date(2019, 3, 20), max: new Date(2019, 4, 7), name: 'Área recreativa'},
               {id: 2, min: new Date(2019, 3, 28), max: new Date(2019, 4, 10), name: 'Área recreativa 2'},
               {id: 3, min: new Date(2019, 4, 8), max: new Date(2019, 4, 8), name: 'Área recreativa 3'},
               {id: 4, min: new Date(2019, 4, 8), max: new Date(2019, 4, 8), name: 'Área recrea 4'},
               {id: 6, min: new Date(2019, 4, 8), max: new Date(2019, 4, 8), name: 'Área 6'},
               {id: 5, min: new Date(2019, 4, 8), max: new Date(2019, 4, 8), name: 'Área recreativds 5'},
               {id: 7, min: new Date(2019, 4, 9), max: new Date(2019, 4, 12), name: 'Área Long 7'},
               {id: 8, min: new Date(2019, 3, 9), max: new Date(2019, 4, 8), name: 'Área Long 8'},
               {id: 9, min: new Date(2019, 4, 7), max: new Date(2019, 4, 7), name: 'Área fsdf dsf 9'}, 
               {id: 10, min: new Date(2019, 4, 8), max: new Date(2019, 4, 10), name: 'Área Long 10'},
               {id: 11, min: new Date(2019, 4, 10), max: new Date(2019, 4, 15), name: 'Área Long 11'},
               {id: 12, min: new Date(2019, 4, 5), max: new Date(2019, 4, 7), name: 'Área Long 12'},
               {id: 13, min: new Date(2019, 2, 3), max: new Date(2019, 3, 9), name: 'Área Long 13'},
               {id: 14, min: new Date(2019, 4, 11), max: new Date(2019, 4, 11), name: 'Área  sdf dsfddee 14'},
               {id: 15, min: new Date(2019, 4, 16), max: new Date(2019, 4, 16), name: 'Área  sd  gfg h  15'}];

window.addEventListener('load', () => {
  initApp();
}, false);

function initApp() {
  app.consts = {
    divDayHeight: 55,
    divLongEventLeftOffset: 20
  };

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

  // Calendar Events
  app.events = {
    long: [],
    oneDay: []
  };

  prepareCalendarData();

  // this will create days
  setDaysStart(null, null, null);
  
  // Months
  createMonthSelect();
}

function prepareCalendarData() {
  for (const event of calData) {
    event.minDate = (new Date(event.min)).setHours(0, 0, 0, 0);
    event.maxDate = (new Date(event.max)).setHours(0, 0, 0, 0);
  }

  calData.sort((a, b) => {
    if (a.minDate < b.minDate) return -1;
    if (a.minDate > b.minDate) return 1;
    return a.id < b.id ? -1 : 1;
  });
}

function addEventsForThisDay(day, date) {
  let longEvents = [],
      oneDayEvents = [],
      setMarginLeftFor = (event) => {
        let longEvents = app.events.long.filter(x => x.o.minDate <= event.date && x.o.maxDate >= event.date),
            margin = 0;

        for (const longEvent of longEvents) 
          if (longEvent.elm.offsetLeft > margin)
            margin = longEvent.elm.offsetLeft;
        
        margin = margin == 0 ? 0 : margin + app.consts.divLongEventLeftOffset;
        event.elm.style.marginLeft = `${margin}px`;
      };

  let idx = calData.length - 1;
  while (idx > -1) {
    const event = calData[idx];
    if (event.maxDate < date) break; // calData is sorted, so there is no more possible events
    if (event.minDate > date) { idx--; continue; }
    if (event.minDate == event.maxDate)
      oneDayEvents.push(event);
    else if (!app.events.long.find(x => x.o.id == event.id))
      longEvents.push(event);

    idx--;
  }

  // Long Events
  if (longEvents.length != 0) {
    let container = document.createElement('div');
    container.className = 'longEvents';

    for (const event of longEvents) {
      let div = document.createElement('div'),
          daysMin = Math.round((date - event.minDate) / 86400000) * app.consts.divDayHeight,
          daysMax = Math.round((event.maxDate - date) / 86400000) * app.consts.divDayHeight;
      div.innerHTML = `<div class="eventName">${event.name}</div>`;
      div.style.height = `${daysMin + daysMax + app.consts.divDayHeight - 3}px`; //-2px for border, -1px for offset
      div.style.top = `-${daysMin}px`;
      app.events.long.push({ elm: div, o: event });
      container.appendChild(div);
    }
    
    day.appendChild(container); 
  }

  // One Day Events
  if (oneDayEvents.length != 0) {
    let events = [];

    for (const event of oneDayEvents) {
      events.push(`
        <div>
          <div class="eventColor"></div>
          <div class="eventName">${event.name}</div>
        </div>`);
    }

    let container = document.createElement('div'),
        event = { elm: container, date: date };
    container.className = 'oneDayEvents';
    container.innerHTML = events.join('');
    setMarginLeftFor(event);
    day.appendChild(container);
    app.events.oneDay.push(event);
  }

  // set offset, so elements not overlap
  if (longEvents.length != 0) {
    app.events.long.sort((a, b) => {
      if (a.o.minDate < b.o.minDate) return -1;
      if (a.o.minDate > b.o.minDate) return 1;
      return a.o.id < b.o.id ? -1 : 1;
    });
    
    let spots = [];
    for (const event of app.events.long) {
      let index = spots.findIndex(x => x < event.o.minDate);
      if (index == -1) 
        index = spots.push(event.o.maxDate) - 1;
      else
        spots[index] = event.o.maxDate;

      event.elm.style.left = `${index * app.consts.divLongEventLeftOffset}px`;
    }

    for (const event of app.events.oneDay)
      setMarginLeftFor(event);
  }
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
  
  addEventsForThisDay(day, date.getTime());

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
  app.events.oneDay = [];
  app.events.long = [];
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