var birthday = new Date("5 Dec 1998");
var nextBirthday = new Date("Dec 5, 2024 00:00:00");

let second = 1000,
  minute = second * 60,
  hour = minute * 60,
  day = hour * 24;
setInterval(function () {
  let now = new Date();
  let distance = nextBirthday.getTime() - now.getTime();
  var d = Math.floor(distance / day);
  var h = Math.floor((distance % day) / hour);
  var m = Math.floor((distance % hour) / minute);
  var s = Math.floor((distance % minute) / second);
  d = verifyDateTime(d);
  h = verifyDateTime(h);
  m = verifyDateTime(m);
  s = verifyDateTime(s);
  document.getElementById("days").innerHTML = d;
  document.getElementById("hours").innerHTML = h;
  document.getElementById("minutes").innerHTML = m;
  document.getElementById("seconds").innerHTML = s;
}, 200);

function verifyDateTime(obj) {
  if (obj < 10) return "0" + obj;
  else return obj;
}

var today = new Date();
var years = today.getFullYear() - birthday.getFullYear();
var months = today.getMonth() - birthday.getMonth();
var days = today.getDate() - birthday.getDate();
if (days < 0) {
  months = months - 1;
  days = 31 + days;
}
if (months < 0) {
  years = years - 1;
  months = 12 + months;
}
var totalDays = Math.floor((today - birthday) / (24 * 3600 * 1000)) - 1;
document.getElementById("calendar").innerHTML =
  "We have been together for " +
  years +
  " years " +
  months +
  " months " +
  days +
  " days";
document.getElementById("totalDays").innerHTML = totalDays;
