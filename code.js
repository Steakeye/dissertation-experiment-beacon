var ble = require("ble_eddystone");

// Here are your list of URLs. Change these to your own site & use a URL
// shortener to keep them small.
const urls = [
  { url: "https://goo.gl/dVPA9n", led: LED2 },
  { url: {}, led: LED3 }
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
  if (currentUrl === 0) {
    currentUrl++;
  } else {
    currentUrl = 0;
  }
  
  const advertisingVal = urls[currentUrl].url;
  
  if (advertisingVal instanceof string) {
    console.log("Setting url to ", urls[currentUrl]);
    ble.advertise(urls[currentUrl].url);
  } else {
    console.log("Stopping advertising.");
    NRF.setAdvertising({}); 
  }
  setLed(urls[currentUrl].led, undefined, afterToggleBeacon);
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
  console.log("button up");
  const delta = Date().ms - downTime;
  if (delta > 750 && delta < 1500) {
    toggleBeacon();
  } else {
    alert(LED1);
  }
}

function onDown() {
  if (allowPush) {
    console.log("down push");
    allowPush = false;
    downTime = Date().ms;
    setWatch(onUp, BTN, { edge: 'falling', debounce: 50 });
  }
}

setWatch(onDown, BTN, { repeat: true, edge: 'rising', debounce: 50 });

// Saving will store the code on the Puck.js to allow it to be run after removing the battery.
save();