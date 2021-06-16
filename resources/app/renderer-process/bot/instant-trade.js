const bytenode = require('bytenode');
var processor = require('../../bot-functions/processor.jsc');
// var processor = require('../../bot-functions/processor');

const { Dexie } = require('dexie');
const { ipcRenderer } = require('electron');
const notiBox = require('../../assets/notiBox');

//setup db
var db = new Dexie("tbb_database");
db.version(9).stores({
    inputtokens: '++id,active,tokenCode,tokenAddress,midRouteTokenAddress,inputTokenCode,inputAddress,inputAmount,buyLimitPrice,sellLimitPrice,stopLossPrice,trailingSellPct,trailingBuyPct,moonbagToKeep,neverSellXTokens,maxGasPriceGwei,slippageTolerance,maxPriceImpact,averageXScans,dontBuySellUntilFullScans,supportFeeOnTransferTokens,keepTryingTXifFail,needTokenApproval,checkBalanceOnlyStartup',
    outputbuytokens: '++id,tokenID,inputEth,inputCode,buyLimitPrice,instantBuyPrice,averagePrice,trailingBuyPrice,trailingBuyPct,buyPriceImpact,samples,notes,buyMidPrice,needTokenApproval',
    outputselltokens: '++id,tokenID,inputTkn,inputCode,sellLimitPrice,instantSellPrice,averagePrice,trailingSellPrice,trailingSellPct,stopLoss,moonBag,sellPriceImpact,samples,needTokenApproval,notes,sellMidPrice',
    outputtrades: '++id,timeStamp,link,code,inputCode,type,outAmount,inAmount,price,successReceipt,nonce',
    errorlog: '++id,timeStamp,code,message'
});

//check settings and use defaults if they don't exist
if (localStorage.getItem("settings") === null) {
    var settings = {"scanDelayMS":"5000","infuraAPI":"","alchemyAPI":"","etherAPI":"","poktAPI":"","customHTTP":"","customWSS":"","quorum":"1","network":"eth-ropsten","dex":"uniswap","defGas":"20","gasSpeed":"fast","gasAdd":"2","gasMax":"500000","waitTx":"20","etherscanGasLink":"https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=","spendApproveAmt":"0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF","minimumEthToKeep":"0.1"};
}else{
    var settings = JSON.parse(localStorage["settings"]);
}

// var inputTokenCd = "ETH";
// if(settings.network == 'bsc-mainnet' || settings.network == 'bsc-test'){
//     inputTokenCd = "BNB";
// }

function saveForm(){
    var instantTradeScreen = 
    {
        tokenCode: $('#tokenCode-instant').val(),
        tokenAddress: $('#tokenAddress-instant').val(),
        midRouteTokenAddress: $('#midRouteAddress-instant').val(),
        inputTokenCode: $('#inputCode-instant').val(),
        inputAddress: $('#inputAddress-instant').val(),
        inputAmount: $('#inputAmount-instant').val(),
        sellInputAmount: $('#sellInputAmount-instant').val(),
        slippage: $('#slip-instant').val(),
        maxPriceImpact: $('#maxPriceImpact-instant').val(),
        gasSpeed: $('#gasSpeed-instant').val(),
        gasAdd: $('#gasAdd-instant').val(),
        defGas: $('#defGas-instant').val(),
        gasMax: $('#gasMax-instant').val(),
        waitTx: $('#waitTx-instant').val(),
        supportBurn: $('#supportBurn-instant').is(':checked')
    };

    localStorage["instantTradeScreen"] = JSON.stringify(instantTradeScreen);
}

module.exports.ExecuteBuyConfirm = async function(){
    var password = $('#passwordInstantTrade').val();

    saveForm();

    var token = {
        tokenCode: $('#tokenCode-instant').val(),
        tokenAddress: $('#tokenAddress-instant').val(),
        midRouteTokenAddress: $('#midRouteAddress-instant').val(),
        inputTokenCode: $('#inputCode-instant').val(),
        inputAddress: $('#inputAddress-instant').val(),
        inputAmount: $('#inputAmount-instant').val(),
        maxGasPriceGwei: 50000,
        slippageTolerance: $('#slip-instant').val(),
        maxPriceImpact: $('#maxPriceImpact-instant').val(),
        supportFeeOnTransferTokens: $('#supportBurn-instant').is(':checked'),
        //keepTryingTXifFail: document.getElementById("keepTry").checked,
        setGasGwei: $('#defGas-instant').val(),
        useLastNonce: $('#useLastNonce-instant').is(':checked'),
    }

    var thisETH = $('#inputAmount-instant').val();
    var currentPrice = await processor.getBuyPrice(token,password);
    var instantTokens = parseFloat(thisETH) / currentPrice;

    $('#instantBuyETH').text(thisETH);
    $('#instantBuyPrice').text(currentPrice);
    $('#instantBuyTokenCodes').text($('#inputCode-instant').val() + '/' + $('#tokenCode-instant').val());
    $('#instantBuyTokens').text(instantTokens);
    
    $('#instantbuy-confirm-modal').show();
}
module.exports.ExecuteBuy = async function(){
    var password = $('#passwordInstantTrade').val();

    saveForm();

    var token = {
        tokenCode: $('#tokenCode-instant').val(),
        tokenAddress: $('#tokenAddress-instant').val(),
        midRouteTokenAddress: $('#midRouteAddress-instant').val(),
        inputTokenCode: $('#inputCode-instant').val(),
        inputAddress: $('#inputAddress-instant').val(),
        inputAmount: $('#inputAmount-instant').val(),
        maxGasPriceGwei: 50000,
        slippageTolerance: $('#slip-instant').val(),
        maxPriceImpact: $('#maxPriceImpact-instant').val(),
        supportFeeOnTransferTokens: $('#supportBurn-instant').is(':checked'),
        //keepTryingTXifFail: document.getElementById("keepTry").checked,
        setGasGwei: $('#defGas-instant').val(),
        useLastNonce: $('#useLastNonce-instant').is(':checked'),
    }

    $('.instant-execute').prop('disabled', true).removeClass('bttn-success').removeClass('bttn-danger').removeClass('bttn-primary').html('Executing...');
    await processor.instantBuy(token,password);
    
    $('#instantbuy-confirm-modal').hide();

    $('.instant-buy').prop('disabled', false).addClass('bttn-success').html('BUY');
    $('.instant-sell').prop('disabled', false).addClass('bttn-danger').html('SELL');
    $('.instant-approve').prop('disabled', false).addClass('bttn-primary').html('Approve');

    $('.buy-now').prop('disabled', false).addClass('bttn-success').html('Buy Now');
    $('.sell-now').prop('disabled', false).addClass('bttn-danger').html('Sell Now');
    $('.approve-now').prop('disabled', false).addClass('bttn-primary').html('Approve Now');
}

module.exports.ExecuteSellConfirm = async function(){
    var password = $('#passwordInstantTrade').val();

    saveForm();

    var token = {
        tokenCode: $('#tokenCode-instant').val(),
        tokenAddress: $('#tokenAddress-instant').val(),
        midRouteTokenAddress: $('#midRouteAddress-instant').val(),
        inputTokenCode: $('#inputCode-instant').val(),
        inputAddress: $('#inputAddress-instant').val(),
        sellInputAmount: $('#sellInputAmount-instant').val(),
        moonbagToKeep: $('#moonbagToKeep-instant').val(),
        neverSellXTokens: $('#neverSellXTokens-instant').val(),
        maxGasPriceGwei: '5000',
        slippageTolerance: $('#slip-instant').val(),
        maxPriceImpact: $('#maxPriceImpact-instant').val(),
        supportFeeOnTransferTokens: $('#supportBurn-instant').is(':checked'),
        //keepTryingTXifFail: document.getElementById("keepTry").checked,
        setGasGwei: $('#defGas-instant').val(),
        useLastNonce: $('#useLastNonce-instant').is(':checked'),
    }

    var returnToken = await processor.getSellPrice(token,password);
    
    //console.log(returnToken);

    if(returnToken != undefined){
        var sellAmt = returnToken.sellInputAmount;
        if(returnToken.sellInputAmount == ''){ sellAmt = returnToken.sellSummary.inputAmount; }
        $('#instantSellTokens').text(sellAmt);
        $('#instantSellPrice').text(returnToken.currentPrice);
        $('#instantSellTokenCodes').text($('#inputCode-instant').val() + '/' + $('#tokenCode-instant').val());
        $('#instantSellETH').text((returnToken.currentPrice * parseFloat(sellAmt)));
        
        $('#instantsell-confirm-modal').show();
    }else{
        notiBox.showNotification('No Tokens,No tokens to sell found!');
    }
}
module.exports.ExecuteSell = async function(){
    var password = $('#passwordInstantTrade').val();

    saveForm();

    var token = {
        tokenCode: $('#tokenCode-instant').val(),
        tokenAddress: $('#tokenAddress-instant').val(),
        midRouteTokenAddress: $('#midRouteAddress-instant').val(),
        inputTokenCode: $('#inputCode-instant').val(),
        inputAddress: $('#inputAddress-instant').val(),
        sellInputAmount: $('#sellInputAmount-instant').val(),
        moonbagToKeep: $('#moonbagToKeep-instant').val(),
        neverSellXTokens: $('#neverSellXTokens-instant').val(),
        maxGasPriceGwei: '5000',
        slippageTolerance: $('#slip-instant').val(),
        maxPriceImpact: $('#maxPriceImpact-instant').val(),
        supportFeeOnTransferTokens: $('#supportBurn-instant').is(':checked'),
        //keepTryingTXifFail: document.getElementById("keepTry").checked,
        setGasGwei: $('#defGas-instant').val(),
        useLastNonce: $('#useLastNonce-instant').is(':checked'),
    }

    $('.instant-execute').prop('disabled', true).removeClass('bttn-success').removeClass('bttn-danger').removeClass('bttn-primary').html('Executing...');
    await processor.instantSell(token,password);
    
    $('#instantsell-confirm-modal').hide();

    $('.instant-buy').prop('disabled', false).addClass('bttn-success').html('BUY');
    $('.instant-sell').prop('disabled', false).addClass('bttn-danger').html('SELL');
    $('.instant-approve').prop('disabled', false).addClass('bttn-primary').html('Approve');

    $('.buy-now').prop('disabled', false).addClass('bttn-success').html('Buy Now');
    $('.sell-now').prop('disabled', false).addClass('bttn-danger').html('Sell Now');
    $('.approve-now').prop('disabled', false).addClass('bttn-primary').html('Approve Now');
}

module.exports.ExecuteApprove = async function(){
    var password = $('#passwordInstantTrade').val();

    saveForm();

    var token = {
        tokenCode: $('#tokenCode-instant').val(),
        tokenAddress: $('#tokenAddress-instant').val(),
        inputTokenCode: $('#inputCode-instant').val(),
        inputAmount: $('#inputAmount-instant').val(),
        moonbagToKeep: 0,
        neverSellXTokens: 0,
        maxGasPriceGwei: '5000',
        slippageTolerance: $('#slip-instant').val(),
        supportFeeOnTransferTokens: $('#supportBurn-instant').is(':checked'),
        //keepTryingTXifFail: document.getElementById("keepTry").checked,
        setGasGwei: $('#defGas-instant').val(),
        useLastNonce: $('#useLastNonce-instant').is(':checked'),
    }

    $('.instant-execute').prop('disabled', true).removeClass('bttn-success').removeClass('bttn-danger').removeClass('bttn-primary').html('Executing...');
    await processor.instantApprove(token,password);
    
    $('#instantapp-confirm-modal').hide();

    $('.instant-buy').prop('disabled', false).addClass('bttn-success').html('BUY');
    $('.instant-sell').prop('disabled', false).addClass('bttn-danger').html('SELL');
    $('.instant-approve').prop('disabled', false).addClass('bttn-primary').html('Approve');

    $('.buy-now').prop('disabled', false).addClass('bttn-success').html('Buy Now');
    $('.sell-now').prop('disabled', false).addClass('bttn-danger').html('Sell Now');
    $('.approve-now').prop('disabled', false).addClass('bttn-primary').html('Approve Now');
}


module.exports.loadInstantTradeForm = function(){
    if (localStorage.getItem("instantTradeScreen") === null) {
        
    }else{
        var instantTradeScreen = JSON.parse(localStorage["instantTradeScreen"]);

        $('#tokenCode-instant').val(instantTradeScreen.tokenCode);
        $('#tokenAddress-instant').val(instantTradeScreen.tokenAddress);
        $('#inputAmount-instant').val(instantTradeScreen.inputAmount);

        $('#midRouteAddress-instant').val(instantTradeScreen.midRouteTokenAddress);
        $('#inputCode-instant').val(instantTradeScreen.inputTokenCode);
        $('#inputAddress-instant').val(instantTradeScreen.inputAddress);
        $('#maxPriceImpact-instant').val(instantTradeScreen.maxPriceImpact);

        $('#sellInputAmount-instant').val(instantTradeScreen.sellInputAmount);
        $('#slip-instant').val(instantTradeScreen.slippage);
        $('#gasSpeed-instant').val(instantTradeScreen.gasSpeed);
        $('#gasAdd-instant').val(instantTradeScreen.gasAdd);
        $('#defGas-instant').val(instantTradeScreen.defGas);
        $('#gasMax-instant').val(instantTradeScreen.gasMax);
        $('#waitTx-instant').val(instantTradeScreen.waitTx);
        $('#supportBurn-instant').prop('checked', instantTradeScreen.supportBurn);
    }

    db.inputtokens.each(function (tc) {
        $('#ddlTrades').append($('<option>').val(tc.tokenAddress).text(tc.tokenCode));  
    });
}

$('body').on('change', '#ddlTrades', function(){
    var thisTradeAddress = $(this).val();
    var thisTradeCode = $('option:selected',this).text();

    if(thisTradeAddress != "0"){
        $('#tokenAddress-instant').val(thisTradeAddress);
        $('#tokenCode-instant').val(thisTradeCode);
    }
});
$('body').on('click', '#useLastNonce-instant', function(){
    $('.instant-buy').prop('disabled', false).addClass('bttn-success').html('BUY');
    $('.instant-sell').prop('disabled', false).addClass('bttn-danger').html('SELL');
    $('.instant-approve').prop('disabled', false).addClass('bttn-primary').html('Approve');

    $('.buy-now').prop('disabled', false).addClass('bttn-success').html('Buy Now');
    $('.sell-now').prop('disabled', false).addClass('bttn-danger').html('Sell Now');
    $('.approve-now').prop('disabled', false).addClass('bttn-primary').html('Approve Now');
});


//loadInstantTradeForm();