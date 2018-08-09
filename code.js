var ble = require("ble_eddystone");

// Here are your list of URLs. Change these to your own site & use a URL
// shortener to keep them small.
const urls = [
  { url: "https://google.com", led: LED1 },
  { url: "https://duckduckgo.com", led: LED3 },
  { url: "https://bing.com", led: LED2 },
];

let currentUrl = undefined;
let downTime = undefined;
let allowPush = true;

function setLed(led, duration, callback) {
  if (duration === undefined) {
    duration = 1500;
  }

  digitalWrite(led, true);

  setTimeout(function(){
    digitalWrite(led, false);
    if (callback) {
      callback();
    }
  }, duration);
}

function checkBattery() {
  if(Puck.getBatteryPercentage() <= 20) {
    alert(LED3);
  } else {
    allowPush = true;
  }
}

function toggleBeacon() {
  if (currentUrl >= 0) {
    currentUrl++;
  } else {
    currentUrl = 0;
  }

  if (urls[currentUrl]) {
    ble.advertise(urls[currentUrl].url);
    setLed(urls[currentUrl].led, undefined, afterToggleBeacon);
  } else {
    currentUrl = undefined;
    NRF.setAdvertising({});
    alert(LED1, 500, 1000);
  }
}

function afterToggleBeacon() {
  checkBattery();
}

function alert(led, onDuration, gap) {
  if (onDuration === undefined) {
    onDuration = 50;
  }

  if (gap === undefined) {
    gap = 100;
  }

  setLed(led, onDuration);
  setTimeout(function(){ setLed(led, onDuration); }, gap);
  setTimeout(function(){ setLed(led, onDuration); allowPush = true; }, gap * 2);
}

function onUp() {
  const delta = Date().ms - downTime;
  if (delta > 750 && delta < 1500) {
    toggleBeacon();
  } else {
    alert(LED1);
  }
}

function onDown() {
  if (allowPush) {
    allowPush = false;
    downTime = Date().ms;
    setWatch(onUp, BTN, { edge: 'falling', debounce: 50 });
  }
}

setWatch(onDown, BTN, { repeat: true, edge: 'rising', debounce: 50 });

// Saving will store the code on the Puck.js to allow it to be run after removing the battery.
save();