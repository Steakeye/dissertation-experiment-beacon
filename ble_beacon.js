var ble = require("ble_eddystone");

const urls = [
  { url: "https://goo.gl/dVPA9n", led: LED2 }, // green
  { url: undefined, led: LED3 } // blue
];

let currentUrl;
let downTime;
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
    alert(LED1);
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

  if (typeof advertisingVal === "string") {
    //console.log("Setting url to ", urls[currentUrl]);
    ble.advertise(urls[currentUrl].url);
  } else {
    //console.log("Stopping advertising.");
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
  //console.log("button up");
  const delta = Date().ms - downTime;

  if (delta <= 750) {
    //console.log("refresh beacon");

    if (currentUrl !== undefined) {
      //console.log("currentUrl !== undefined");
      const refreshUrl = urls[currentUrl].url;

      if (typeof refreshUrl === "string") {
        NRF.setAdvertising({});

        setTimeout(function() {
          ble.advertise(refreshUrl);
          allowPush = true;
        }, 17);
      } else {
        allowPush = true;
      } 
    } else {
      allowPush = true;
    }
  } else if (delta < 2000) {
    //console.log("toggle beacon");
    toggleBeacon();
  } else {
    //console.log("display settings");
    alert(LED1);

    if (currentUrl !== undefined) {
      alert(urls[currentUrl].led);
    }
  }
  //console.log("exit:button up");
}

function onDown() {
  //console.log("allowPush", allowPush);
  if (allowPush) {
    //console.log("down push");
    allowPush = false;
    downTime = Date().ms;
    setWatch(onUp, BTN, { edge: 'falling', debounce: 50 });
  }
}

setWatch(onDown, BTN, { repeat: true, edge: 'rising', debounce: 50 });

// Saving stores the code in memory, allowing it to run after removing the battery.
save();