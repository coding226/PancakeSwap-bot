const { Dexie } = require('dexie');
const { ipcRenderer } = require('electron')

const bytenode = require('bytenode');
var processor = require('../../bot-functions/processor.jsc');
// var processor = require('../../bot-functions/processor');

// setup db
var db = new Dexie("tbb_database");
db.version(9).stores({
    inputtokens: '++id,active,tokenCode,tokenAddress,midRouteTokenAddress,inputTokenCode,inputAddress,inputAmount,buyLimitPrice,sellLimitPrice,stopLossPrice,trailingSellPct,trailingBuyPct,moonbagToKeep,neverSellXTokens,maxGasPriceGwei,slippageTolerance,maxPriceImpact,averageXScans,dontBuySellUntilFullScans,supportFeeOnTransferTokens,keepTryingTXifFail,needTokenApproval,checkBalanceOnlyStartup',
    outputbuytokens: '++id,tokenID,inputEth,inputCode,buyLimitPrice,instantBuyPrice,averagePrice,trailingBuyPrice,trailingBuyPct,buyPriceImpact,samples,notes,buyMidPrice,needTokenApproval',
    outputselltokens: '++id,tokenID,inputTkn,inputCode,sellLimitPrice,instantSellPrice,averagePrice,trailingSellPrice,trailingSellPct,stopLoss,moonBag,sellPriceImpact,samples,needTokenApproval,notes,sellMidPrice',
    outputtrades: '++id,timeStamp,link,code,inputCode,type,outAmount,inAmount,price,successReceipt,nonce',
    errorlog: '++id,timeStamp,code,message'
});

ipcRenderer.on('mpScanning', (event, arg) => {
    $("#imgRadar").show();
});
ipcRenderer.on('mpFound', (event, arg) => {
    $("#imgRadar").hide();
    //$("#mempoolOutput").show();
    //show a found image
});
ipcRenderer.on('mpMessage', (event, arg) => {
    memPoolMessage(arg);
});
ipcRenderer.on('mpMessageAppend', (event, arg) => {
    memPoolMessageAppend(arg);
});

function memPoolMessage(message){
    $("#mempoolOutput").append(message+'\n');
}
function memPoolMessageAppend(message){
    $("#mempoolOutput").append(message);
}

module.exports.loadMemPoolForm = function(){
//function loadMemPoolForm(){
    if (localStorage.getItem("memPool") === null) {
    }else if(localStorage['memPool'] == 'true' || localStorage['highTier'] == 'true'){
        $('#btnMempoolStart').prop('disabled', false).addClass('bttn-primary');
        $('#tokenCode-mempool').prop('disabled', false);
        $('#tokenAddress-mempool').prop('disabled', false);
        $('#inputAmount-mempool').prop('disabled', false);
        $('#buyLimitPrice-mempool').prop('disabled', false);
        $('#buyTokensOutOverride-mempool').prop('disabled', false);
        $('#sellLimitPrice-mempool').prop('disabled', false);
        $('#weiOffset-mempool').prop('disabled', false);
        $('#slippageTolerance-mempool').prop('disabled', false);
    }
}

module.exports.loadMemPoolData = function(){
    if (localStorage.getItem("mempoolSnipeToken") === null) {
        
    }else{
        var inputSnipeToken = JSON.parse(localStorage["mempoolSnipeToken"]);
        $('#tokenCode-mempool').val(inputSnipeToken.tokenCode);
        $('#tokenAddress-mempool').val(inputSnipeToken.tokenAddress);
        $('#inputAmount-mempool').val(inputSnipeToken.inputAmount);
        $('#buyLimitPrice-mempool').val(inputSnipeToken.buyLimitPrice);
        $('#buyTokensOutOverride-mempool').val(inputSnipeToken.buyTokensOutOverride);
        $('#sellLimitPrice-mempool').val(inputSnipeToken.sellLimitPrice);
        $('#weiOffset-mempool').val(inputSnipeToken.weiOffset);
        $('#slippageTolerance-mempool').val(inputSnipeToken.slippageTolerance);
    }
}

module.exports.startMempoolScanning = function(snipeToken, password){
    processor.startMempoolScanning(snipeToken, password);
}

module.exports.stopMempoolScanning = function(){
    ipcRenderer.send('hardReloadWindow');
}