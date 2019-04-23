let app = {};

window.addEventListener('load', () => {
  app.scrollBox = document.getElementById('scrollbox');
  app.content = document.getElementById('content');

  app.scrollBox.addEventListener('scroll', () => {
    addItem();
  }, false);

  
  let startDate = new Date(Date.now());
  app.dateFrom = new Date(startDate);
  app.dateTo = new Date(startDate);
  app.dateTo.setDate(app.dateTo.getDate() - 1);
  addItem();

  console.log(app.content.children.length);
}, false);

function addItem() {
  let sb = app.scrollBox;

  if (sb.scrollHeight - sb.scrollTop - sb.clientHeight < sb.clientHeight) {
    let p = document.createElement('p');

    app.dateTo.setDate(app.dateTo.getDate() + 1);
    p.innerText = app.dateTo.toYMD();
    app.content.appendChild(p);

    addItem();
  }

  if (sb.scrollHeight > sb.clientHeight && sb.scrollTop < sb.clientHeight) {
    let p = document.createElement('p');

    app.dateFrom.setDate(app.dateFrom.getDate() - 1);
    p.innerText = app.dateFrom.toYMD();

    /*// Chrome version
    if (app.scrollBox.scrollTop == 0) 
      app.scrollBox.scrollTop = 1;
    app.content.insertBefore(p, app.content.children[0]);
    // end Chrome version*/

    // Firefox / Edge version
    // not smooth scroll when scrolling up
    let oldsh = sb.scrollHeight;
    app.content.insertBefore(p, app.content.children[0]);
    app.scrollBox.scrollTop += sb.scrollHeight - oldsh;
    // end Firefox / Edge version

    addItem();
  }
}

if (!Date.prototype.toYMD) {
  Date.prototype.toYMD = function () {
    return [
      this.getFullYear(),
      ('0' + (this.getMonth() + 1)).slice(-2),
      ('0' + this.getDate()).slice(-2)
    ].join('-');
  };
}