const tableContainer = document.getElementById("output-table-container");
const outputBuyTable = document.getElementById("output-buy-table");
const { ipcRenderer } = require('electron');

function getBuySellOutput() {
    //Switch out placeholder with strings to be output to screen
    const content =`
        <table id="output-buy-table" class="output-table">
            <thead>
              <tr>
                <td colspan="12"><h2>Buy Output</h2></td>
              </tr>
              <tr>
                  <th>Approve</th>
                  <th>Token ID</th>
                  <th>Input Amount</th>
                  <th>Rate Codes</th>
                  <th>Price Impact</th>
                  <th>Trailing Buy</th>
                  <th>Buy Limit</th>
                  <th>Instant Price</th>
                  <th>Average Buy</th>
                  <th>Samples</th>
                  <th>Chart Price</th>
                  <th>Market Buy</th>
              </tr>
            </thead>
            <tbody>
                
            </tbody>
            
        </table>
        <br>
        <table id="output-sell-table" class="output-table">
            <thead>
              <tr>
                <td colspan="14"><h2>Sell Output</h2></td>
              </tr>
              <tr>
                <th>Approve</th>
                <th>Token ID</th>
                <th>Input Amount</th>
                <th>Rate Codes</th>
                <th>Price Impact</th>
                <th>Moonbag</th>
                <th>Stop Loss</th>
                <th>Trailing Sell</th>
                <th>Sell Limit</th>
                <th>Instant Price</th>
                <th>Average Sell</th>
                <th>Samples</th>
                <th>Chart Price</th>
                <th>Market Sell</th>
             </tr>
            </thead>
            <tbody>
                
            </tbody>
        </table>
    `;

    tableContainer.innerHTML += content;
}


ipcRenderer.on('startTimer', (event, arg) => {
    startTimer(parseFloat(arg));
});
ipcRenderer.on('stopTimer', (event, arg) => {
    stopTimer();
});


$('body').on('click','#cbEnableExecute', async function(){
  var checked = $(this).is(':checked');
  //$('.execute-token').prop('disabled', !checked);
  if(checked){
    $('.execute-token').prop('disabled', false).addClass('bttn-primary').removeClass('bttn-disabled');
  }else{
    $('.execute-token').prop('disabled', true).removeClass('bttn-primary').addClass('bttn-disabled');
  }
});

module.exports = getBuySellOutput();

const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 0;
const ALERT_THRESHOLD = 0;

const COLOR_CODES = {
  info: {
    color: "green"
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD
  }
};

//var TIME_LIMIT = 5;
let timePassed = 0;
let timeLeft = 0;
let timerInterval = null;
let remainingPathColor = COLOR_CODES.info.color;


//startTimer(5);

function resetTimer(timeLimit){
    timePassed = 0;
    timeLeft = timeLimit;
    document.getElementById("timer-app").innerHTML = `
    <div class="base-timer">
      <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g class="base-timer__circle">
          <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
          <path
            id="base-timer-path-remaining"
            stroke-dasharray="283"
            class="base-timer__path-remaining ${remainingPathColor}"
            d="
              M 50, 50
              m -45, 0
              a 45,45 0 1,0 90,0
              a 45,45 0 1,0 -90,0
            "
          ></path>
        </g>
      </svg>
      <span id="base-timer-label" class="base-timer__label">Next Scan:<br>${formatTime(
        timeLeft
      )}</span>
    </div>
    `;
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function onTimesUp() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function startTimer(timeLimit) {
  resetTimer(timeLimit);
  timerInterval = setInterval(() => {
    timePassed = timePassed += 1;
    timeLeft = timeLimit - timePassed;
    if(timeLeft <= 0){
      timeLeft = 0;
      $('#base-timer-label').html('Scanning...');
    }else{
      $('#base-timer-label').html('Next Scan:<br>'+formatTime(timeLeft));
    }
    setCircleDasharray(timeLimit);
    setRemainingPathColor(timeLeft);

    if (timeLeft === 0) {
      onTimesUp();
    }
  }, 1000);
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  return `${minutes}:${seconds}`;
}

function setRemainingPathColor(timeLeft) {
  const { alert, warning, info } = COLOR_CODES;
  if (timeLeft <= alert.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(warning.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(alert.color);
  } else if (timeLeft <= warning.threshold) {
    document
      .getElementById("base-timer-path-remaining")
      .classList.remove(info.color);
    document
      .getElementById("base-timer-path-remaining")
      .classList.add(warning.color);
  }
}

function calculateTimeFraction(timeLimit) {
  const rawTimeFraction = timeLeft / timeLimit;
  return rawTimeFraction - (1 / timeLimit) * (1 - rawTimeFraction);
}

function setCircleDasharray(timeLimit) {
  const circleDasharray = `${(
    calculateTimeFraction(timeLimit) * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  document
    .getElementById("base-timer-path-remaining")
    .setAttribute("stroke-dasharray", circleDasharray);
}