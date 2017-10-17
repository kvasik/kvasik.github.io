;(function() {

  var app = {
    currentVersion: 0
  };

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then(function() { console.log('Service Worker Registered'); });
  }


  var dayName = '<div class="day-name">{day}</div>';
  var dayLessonTemplate = ''
                          +'<div class="day-lesson">'
                            +'<div class="lesson-order">{order}</div>'
                            +'<div class="lesson-time">{time}</div>'
                            +'<div class="lesson-info">{odd-week}{even-week}</div>'
                          +'</div>';

  var lessonWeekTemplate = '<div class="lesson-{week}-week">'
                              +'<div class="lesson-subject">{subject}</div>'
                              +'<div class="lesson-room">{room}</div>'
                            +'</div>';

  app.updateScheduleView = function(schedule) {
    var dayBlocks = document.querySelectorAll('.week-table .day-table');
    schedule.days.forEach(function(day, dayIndex) {
      var dayLessons = '';
      day.pairs.forEach(function(pair) {
        dayLessons += dayLessonTemplate
          .replace('{order}', pair.order)
          .replace('{time}', pair.time);

        var subject = '';
        var room = '';
        var week = lessonWeekTemplate;
        var oddWeek = '';
        var evenWeek = '';

        console.log(pair.lesson);
        if(pair.lesson.length == 1) {
          week = week.replace('{week}', 'both');
        }

        if(pair.lesson[0] != undefined) {
          oddWeek = week
            .replace('{week}', 'odd')
            .replace('{subject}', pair.lesson[0].subject ? (pair.lesson[0].subject + ' [' + pair.lesson[0].type) + ']' : '')
            .replace('{room}', pair.lesson[0].room ? (pair.lesson[0].room + ' ' + pair.lesson[0].building) : '');
        }
        if(pair.lesson[1] != undefined) {
          evenWeek = week
          .replace('{week}', 'even')
          .replace('{subject}', pair.lesson[1].subject ? (pair.lesson[1].subject + ' [' + pair.lesson[1].type) + ']' : '')
          .replace('{room}', pair.lesson[1].room ? (pair.lesson[1].room + ' ' + pair.lesson[1].building) : '');
        }

        dayLessons = dayLessons
          .replace('{odd-week}', oddWeek)
          .replace('{even-week}', evenWeek);
      });
      dayBlocks[dayIndex].innerHTML = dayName.replace('{day}', day.name) + dayLessons;
    });

    var isEven = Math.floor(Math.floor((new Date().getTime() - new Date (new Date ().getFullYear (), 7, 28).getTime())/8.64e7) / 7) % 2;
    if(isEven) {
      document.querySelector('.week-table').classList.add('even-week');
    } else {
      document.querySelector('.week-table').classList.add('odd-week');
    }

    var currentDay = document.querySelectorAll('.day-table')[new Date().getDay()-1];
    var currentTime = parseInt((new Date().getHours().toString()).padStart(2, '0') + '' + (new Date().getMinutes().toString()).padStart(2, '0'), 10);
    var pairs = [[830, 950], [1000, 1120], [1130, 1250], [1330, 1450], [1500, 1620], [1630, 1750]];
    if(currentDay) {
      currentDay.classList.add('current-day');
      currentDay.querySelectorAll('.day-lesson').forEach(function(lesson, i) {
        var pair = pairs[parseInt(lesson.children[0].innerText) - 1];
        console.log(parseInt(lesson.children[0].innerText) - 1);
        if(currentTime > pair[0] && currentTime < pair[1]) {
          lesson.classList.add('current-lesson');
        }
      });
    }
  }

  app.updateSchedule = function(newSchedule) {
    console.log('updateSchedule', newSchedule.version <= app.currentVersion);
    if(newSchedule.version <= app.currentVersion) {
      return;
    }
    app.currentVersion  = newSchedule.version;
    app.updateScheduleView(newSchedule);
  };

  function requestSchedule() {
    var url = '/schedule.json';

    if ('caches' in window) {
      caches.match(url).then(function(response) {
        if (response) {
          response.json().then(function(jsonResponse) {
            app.updateSchedule(jsonResponse);
          }).catch(function() {});
        }
      });
    }

    fetch(url, {mode: 'no-cors'})
      .then(function(response) {
        if(response) {
          response.json().then(function(jsonResponse) {
            app.updateSchedule(jsonResponse);
          });
        }
      })
      .catch(function() {
        console.log('Offline');
      });
  }

  requestSchedule();
})();