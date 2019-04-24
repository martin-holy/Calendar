let app = {};

window.addEventListener('load', () => {
  app.scrollBox = document.getElementById('scrollbox');
  app.content = document.getElementById('content');

  app.scrollBox.addEventListener('scroll', () => {
    addItem();
    setHeatherMonthAndYear();
  }, false);

  
  let startDate = (new Date(Date.now())).setHours(0, 0, 0, 0);
  app.dateFrom = new Date(startDate);
  app.dateTo = new Date(startDate);
  app.dateTo.setDate(app.dateTo.getDate() - 1);
  addItem();
  setHeatherMonthAndYear();

  console.log(app.content.children.length);
}, false);

function createItem(date) {
  let p = document.createElement('p');
  p.setAttribute('data-date', date.getTime());
  p.innerText = date.getDate();
  return p;
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

function setHeatherMonthAndYear() {
  let index = Math.floor(app.scrollBox.scrollTop / (app.scrollBox.scrollHeight / app.content.children.length)),
      item = app.content.children[index],
      date = new Date(parseInt(item.getAttribute('data-date')));
  document.getElementById('heather_year').innerText = date.getFullYear();
  document.getElementById('heather_month').innerText = date.toLocaleDateString(navigator.language, {month: 'long'});
}