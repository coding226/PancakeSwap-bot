const { Dexie } = require('dexie');
const { ipcRenderer } = require('electron');

// setup db
var db = new Dexie("tbb_database");
db.version(9).stores({
    inputtokens: '++id,active,tokenCode,tokenAddress,midRouteTokenAddress,inputTokenCode,inputAddress,inputAmount,buyLimitPrice,sellLimitPrice,stopLossPrice,trailingSellPct,trailingBuyPct,moonbagToKeep,neverSellXTokens,maxGasPriceGwei,slippageTolerance,maxPriceImpact,averageXScans,dontBuySellUntilFullScans,supportFeeOnTransferTokens,keepTryingTXifFail,needTokenApproval,checkBalanceOnlyStartup',
    outputbuytokens: '++id,tokenID,inputEth,inputCode,buyLimitPrice,instantBuyPrice,averagePrice,trailingBuyPrice,trailingBuyPct,buyPriceImpact,samples,notes,buyMidPrice,needTokenApproval',
    outputselltokens: '++id,tokenID,inputTkn,inputCode,sellLimitPrice,instantSellPrice,averagePrice,trailingSellPrice,trailingSellPct,stopLoss,moonBag,sellPriceImpact,samples,needTokenApproval,notes,sellMidPrice',
    outputtrades: '++id,timeStamp,link,code,inputCode,type,outAmount,inAmount,price,successReceipt,nonce',
    errorlog: '++id,timeStamp,code,message'
});


let formSubmit = document.getElementById("formSubmitButton");
let formClear = document.getElementById("formClearButton");
let tradePanel = document.getElementById("tradePanel");
let tradeSuccessMsg = document.getElementById("tradeSuccessMsg");
const iaTrades = require('./inactiveTrades');
const notiBox = require('../../assets/notiBox');

formClear.addEventListener('click', () => {
    $('#tCode').val('');
    $('#tAddr').val('');
    $('#midAddr').val('');
    $('#inputTokenCode').val('ETH');
    $('#inputTokenAddress').val('');
    $('#inputAmount').val('');
    $('#buyLim').val('0');
    $('#sellLim').val('0');
    $('#stopLoss').val('0');
    $('#trailSell').val('0');
    $('#trailBuy').val('0');
    $('#moonbag').val('0');
    $('#neverSell').val('0');
    $('#maxGas').val('200');
    $('#slip').val('50');
    $('#maxImpact').val('15');
    $('#averageXScans').val('5');
    $('#dontBuySellUntilFS').prop('checked',true);
    $('#checkBalOnlyStartup').prop('checked',false);
    $('#supportBurn').prop('checked',false);
    $('#keepTry').prop('checked',false);
    $('#needAppr').prop('checked',false);
});

formSubmit.addEventListener('click', () => {
    var inputToken = {
        active: false,
        tokenCode: document.getElementById("tCode").value,
        tokenAddress: document.getElementById("tAddr").value,
        midRouteTokenAddress: document.getElementById("midAddr").value,
        inputTokenCode: document.getElementById("inputTokenCode").value,
        inputAddress: document.getElementById("inputTokenAddress").value,
        inputAmount: document.getElementById("inputAmount").value,
        buyLimitPrice: document.getElementById("buyLim").value,
        sellLimitPrice: document.getElementById("sellLim").value,
        stopLossPrice: document.getElementById("stopLoss").value,
        trailingSellPct: document.getElementById("trailSell").value,
        trailingBuyPct: document.getElementById("trailBuy").value,
        moonbagToKeep: document.getElementById("moonbag").value,
        neverSellXTokens: document.getElementById("neverSell").value,
        maxGasPriceGwei: document.getElementById("maxGas").value,
        slippageTolerance: document.getElementById("slip").value,
        maxPriceImpact: document.getElementById("maxImpact").value,
        averageXScans: document.getElementById("averageXScans").value,
        dontBuySellUntilFullScans: document.getElementById("dontBuySellUntilFS").checked,
        supportFeeOnTransferTokens: document.getElementById("supportBurn").checked,
        keepTryingTXifFail: document.getElementById("keepTry").checked,
        needTokenApproval: document.getElementById("needAppr").checked,
        checkBalanceOnlyStartup: document.getElementById("checkBalOnlyStartup").checked,
    }
   

    db.inputtokens.put(inputToken).then(function(){
        tradePanel.classList.remove("is-open");

        notiBox.showNotification($('#tCode').val() + ',Token Successfully Saved!');

        document.getElementById("tCode").value = "";
        document.getElementById("tAddr").value = "";
        document.getElementById("midAddr").value = "";
        document.getElementById("inputTokenCode").value = "ETH";
        document.getElementById("inputTokenAddress").value = "";

        iaTrades.refreshInactiveTrades();
    }).catch(function(error) {
        console.error("Ooops: " + error);
    });
    

});

function loadTrades(){
    if(localStorage['midTier'] == 'true'){
        $('#midAddr').prop('disabled', false);
        $('#inputTokenAddress').prop('disabled', false);
        $('#trailSell').prop('disabled', false);
        $('#trailBuy').prop('disabled', false);
        $('#maxImpact').prop('disabled', false);
    }else{
        $('#midAddr').prop('disabled', true);
        $('#inputTokenAddress').prop('disabled', true);
        $('#trailSell').prop('disabled', true);
        $('#trailBuy').prop('disabled', true);
        $('#maxImpact').prop('disabled', true);
    }
}

loadTrades();