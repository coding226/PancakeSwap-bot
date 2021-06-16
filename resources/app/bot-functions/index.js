const bytenode = require('bytenode');
var processor = require('./processor.jsc');
var buySell = require('./buysell.jsc');

// var processor = require('./processor');
// var buySell = require('./buysell');

const { ipcRenderer } = require('electron');

//check settings and use defaults if they don't exist
if (localStorage.getItem("settings") === null) {
  var settings = {"scanDelayMS":"5000","infuraAPI":"","alchemyAPI":"","etherAPI":"","poktAPI":"","customHTTP":"","customWSS":"","quorum":"1","network":"eth-ropsten","dex":"uniswap","defGas":"20","gasSpeed":"fast","gasAdd":"2","gasMax":"500000","waitTx":"20","etherscanGasLink":"https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=","spendApproveAmt":"0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF","minimumEthToKeep":"0.1"};
}else{
  var settings = JSON.parse(localStorage["settings"]);
}

var tokensToScan = true;
var passwordCorrect = false;
var timer;

var buyID = -1;
var sellID = -1;
var approveID = -1;

exports.startScan = async function(password){
  tokensToScan = false;
  clearTimeout(timer);
  ipcRenderer.send('stopTimerEvent');

  setTimeout(async function(){
    tokensToScan = true;
    processor.checkProjectTokenOnStart = true;
    processor.tokensActive = [];
    ipcRenderer.send('showNotification', 'Start Scan,Starting up your butler!');
    ipcRenderer.send('startTimerEvent', (settings.scanDelayMS / 1000));
    passwordCorrect = await buySell.setupKeys(password);
    startScanPrices(true);
  },500); // wait 1/2 second to start after stopping
}

async function startScanPrices(firstStart){
  var index = this;

  if(tokensToScan && passwordCorrect) {
    tokensToScan = await processor.checkAllTokens(buyID, sellID, approveID, firstStart);

    // reset for next scan instant buy/sell
    if(buyID >= 0 || sellID >= 0 || approveID >= 0){
      buyID = -1;
      sellID = -1;
      approveID = -1;
      ipcRenderer.send('enableExecuteButtons');
    }

    ipcRenderer.send('startTimerEvent', (settings.scanDelayMS / 1000));

    firstStart = false;

    timer = setTimeout(function(){
      startScanPrices(firstStart);
    }, parseInt(settings.scanDelayMS));
  } else if(!passwordCorrect){
    // no message needed here comes from password routine
  }
  else {
    console.log('!!!!FINISHED - No more to scan!!!!');
    ipcRenderer.send('showNotification', 'FINISHED!,No more tokens detected to scan!');
  }
}

exports.stopScanPrices = async function(){
  ipcRenderer.send('showNotification', 'Stop Scan,Shutting down scanning!');
  console.log('Shutting down scanning!');
  tokensToScan = false;
  clearTimeout(timer);
  ipcRenderer.send('stopTimerEvent');
}

exports.executeBuy = async function(id){
  buyID = id;
}
exports.executeSell = async function(id){
  sellID = id;
}
exports.executeApprove = async function(id){
  approveID = id;
}