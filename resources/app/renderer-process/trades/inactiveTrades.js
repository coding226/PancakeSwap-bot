//const { shift } = require('cli-table');
const { Dexie } = require('dexie');
const status = require('../../assets/status-box')
const index = require('../../bot-functions/index')
const notiBox = require('../../assets/notiBox')
const { ipcRenderer } = require('electron')



// setup db
var db = new Dexie("tbb_database");
db.version(9).stores({
    inputtokens: '++id,active,tokenCode,tokenAddress,midRouteTokenAddress,inputTokenCode,inputAddress,inputAmount,buyLimitPrice,sellLimitPrice,stopLossPrice,trailingSellPct,trailingBuyPct,moonbagToKeep,neverSellXTokens,maxGasPriceGwei,slippageTolerance,maxPriceImpact,averageXScans,dontBuySellUntilFullScans,supportFeeOnTransferTokens,keepTryingTXifFail,needTokenApproval,checkBalanceOnlyStartup',
    outputbuytokens: '++id,tokenID,inputEth,inputCode,buyLimitPrice,instantBuyPrice,averagePrice,trailingBuyPrice,trailingBuyPct,buyPriceImpact,samples,notes,buyMidPrice,needTokenApproval',
    outputselltokens: '++id,tokenID,inputTkn,inputCode,sellLimitPrice,instantSellPrice,averagePrice,trailingSellPrice,trailingSellPct,stopLoss,moonBag,sellPriceImpact,samples,needTokenApproval,notes,sellMidPrice',
    outputtrades: '++id,timeStamp,link,code,inputCode,type,outAmount,inAmount,price,successReceipt,nonce',
    errorlog: '++id,timeStamp,code,message'
});

ipcRenderer.on('getBuyTable', (event, arg) => {
    getBuyTable();
});
ipcRenderer.on('getSellTable', (event, arg) => {
    getSellTable();
});

ipcRenderer.on('getTxTable', (event, arg) => {
    getTxTable();
});
ipcRenderer.on('showClientNoti', (event, arg) => {
    notiBox.showNotification(arg);
});


function getTxTable(){
    //console.log('buy table refresh');
    
    var allTxRows = '';
    
    db.outputtrades.reverse().each(function(txLog){
        var row = '<tr>';

        var success = 'Pending...';
        if(txLog.successReceipt != undefined){
            success = txLog.successReceipt;
        }

        var price = '';
        if(txLog.price != undefined){
            price = txLog.price;
        }

        var outAmount = '';
        if(txLog.outAmount != undefined){
            outAmount = txLog.outAmount;
        }

        var inputCode = '';
        if(txLog.inputCode != undefined){
            inputCode = txLog.inputCode;
        }

        row += '<td><a href="' + txLog.link + '" target="_blank">Link</a></td>';
        row += '<td>' + txLog.timeStamp + '</td>';
        row += '<td>' + inputCode + '</td>';
        row += '<td>' + txLog.code + '</td>';
        row += '<td>' + price + '</td>';
        row += '<td>' + txLog.type + '</td>';
        row += '<td>' + txLog.inAmount + '</td>';
        row += '<td>' + outAmount + '</td>';
        row += '<td>' + success + '</td>';

        row += '</tr>';
        
        allTxRows += row;
    }).then(() => {
        $('#tx-table tbody').html(allTxRows);
    }).catch (err => {
        console.error(err);
    });
}

//module.exports.getBuyTable = function(){
function getBuyTable(){
    //console.log('buy table refresh');
    
    var allBuyRows = '';

    var checked = $("#cbEnableExecute").is(':checked');

    var dbInputTokens = db.inputtokens;
    
    db.outputbuytokens.each(function(token){
        var row = '<tr>';

        if(token.notes != undefined){
            row += '<td></td>';
            row += '<td>' + token.tokenID + '</td>';
            row += '<td colspan="10">'+token.notes+'</td>';
        }else{
            var averagePrice = parseFloat(token.averagePrice);
            var buyLimitPrice = parseFloat(token.buyLimitPrice);
            var distance = (averagePrice - buyLimitPrice) / (averagePrice + buyLimitPrice);
            //console.log(distance);

            row += '<td><button class="bttn-material-flat bttn-xs approveTokenExecute ';
            if(token.needTokenApproval){row += 'bttn-primary" ';}
            else{ row += 'bttn-disabled" disabled="disabled" '; }
            row += 'value="' + token.id + '">Approve</button></td>';

            row += '<td>' + token.tokenID + '</td>';
            row += '<td>' + parseFloat(token.inputEth).toFixed(3) + '</td>';
            row += '<td>' + token.inputCode + '/' + token.tokenID + '</td>';
            row += '<td>' + token.buyPriceImpact + '</td>';
            row += '<td>' + token.trailingBuyPrice + '</td>';

            if(distance >= 0.4){
                row += '<td style="color:red">' + token.buyLimitPrice + '</td>';
            }else if(distance >= 0.15){
                row += '<td style="color:orange">' + token.buyLimitPrice + '</td>';
            }else{
                row += '<td style="color:green">' + token.buyLimitPrice + '</td>';
            }
            
            row += '<td>' + parseFloat(token.instantBuyPrice).toFixed(18) + '</td>';
            if(isNaN(averagePrice)){
                row += '<td>N/A</td>';
                row += '<td>N/A</td>';
            }
            else{
                row += '<td>' + averagePrice.toFixed(18) + '</td>';
                row += '<td>' + token.samples + '</td>';
            }
            row += '<td>' + parseFloat(token.buyMidPrice).toFixed(18) + '</td>';
            
            row += '<td><button class="bttn-material-flat bttn-xs execute-token buyTokenExecute ';
            if(!checked){row += 'bttn-disabled" disabled="disabled" ';}
            else{ row += 'bttn-primary" '; }
            row += 'value="' + token.id + '">Execute</button></td>';
        }
        row += '</tr>';
        
        if(token.notes != undefined || token.inputEth != undefined){
            allBuyRows += row;
        }
    }).then(() => {
        $('#output-buy-table tbody').html(allBuyRows);
    }).catch (err => {
        console.error(err);
    });
}

//module.exports.getSellTable = function(){
function getSellTable(){
    //console.log('sell table refresh');

    var allSellRows = '';

    var checked = $("#cbEnableExecute").is(':checked');

    db.outputselltokens.each(function(token){
        var row = '<tr>';

        if(token.notes != undefined){
            row += '<td></td>';
            row += '<td>' + token.tokenID + '</td>';
            row += '<td colspan="12">'+token.notes+'</td>';
        }else{
            var averagePrice = parseFloat(token.averagePrice);
            var sellLimitPrice = parseFloat(token.sellLimitPrice);
            var distance = (sellLimitPrice - averagePrice) / (averagePrice + sellLimitPrice);
            //console.log(distance);

            row += '<td><button class="bttn-material-flat bttn-xs approveTokenExecute ';
            if(token.needTokenApproval){row += 'bttn-primary" ';}
            else{ row += 'bttn-disabled" disabled="disabled" '; }
            row += 'value="' + token.id + '">Approve</button></td>';

            row += '<td>' + token.tokenID + '</td>';
            row += '<td>' + token.inputTkn.toFixed(3) + '</td>';
            row += '<td>' + token.inputCode + '/' + token.tokenID + '</td>';
            row += '<td>' + token.sellPriceImpact + '</td>';
            row += '<td>' + token.moonBag + '</td>';
            row += '<td>' + token.stopLoss + '</td>';
            row += '<td>' + token.trailingSellPrice + '</td>';
            
            if(distance >= 0.4){
                row += '<td style="color:red">' + token.sellLimitPrice + '</td>';
            }else if(distance >= 0.15){
                row += '<td style="color:orange">' + token.sellLimitPrice + '</td>';
            }else{
                row += '<td style="color:green">' + token.sellLimitPrice + '</td>';
            }

            row += '<td>' + parseFloat(token.instantSellPrice).toFixed(18) + '</td>';
            if(isNaN(averagePrice)){
                row += '<td>N/A</td>';
                row += '<td>N/A</td>';
            }
            else{
                row += '<td>' + averagePrice.toFixed(18) + '</td>';
                row += '<td>' + token.samples + '</td>';
            }
            row += '<td>' + parseFloat(token.sellMidPrice).toFixed(18) + '</td>';

            row += '<td><button class="bttn-material-flat bttn-xs execute-token sellTokenExecute ';
            if(!checked){row += 'bttn-disabled" disabled="disabled" ';}
            else{ row += 'bttn-primary" '; }
            row += 'value="' + token.id + '">Execute</button></td>';
        }

        row += '</tr>';
        
        if(token.notes != undefined || token.inputTkn > 0){
            allSellRows += row;
        }
    }).then(() => {
        $('#output-sell-table tbody').html(allSellRows);
    }).catch (err => {
        console.error(err);
    });
}

getTxTable();



$('body').on('click','.token-inactive-modal-click', async function(){
    var id = parseInt($(this).attr('value'));
    //console.log(id);
    const token = await db.inputtokens.get(id);
    //console.log(token);

    $('#hidTokenID-edit').val(id);

    $('#tCode-edit').val(token.tokenCode);
    $('#tAddr-edit').val(token.tokenAddress);
    $('#midAddr-edit').val(token.midRouteTokenAddress);
    $('#inputTokenCode-edit').val(token.inputTokenCode);
    $('#inputTokenAddress-edit').val(token.inputAddress);
    $('#inputAmount-edit').val(token.inputAmount);
    $('#buyLim-edit').val(token.buyLimitPrice);
    $('#sellLim-edit').val(token.sellLimitPrice);
    $('#stopLoss-edit').val(token.stopLossPrice);
    $('#trailSell-edit').val(token.trailingSellPct);
    $('#trailBuy-edit').val(token.trailingBuyPct);
    $('#moonbag-edit').val(token.moonbagToKeep);
    $('#neverSell-edit').val(token.neverSellXTokens);
    $('#maxGas-edit').val(token.maxGasPriceGwei);
    $('#slip-edit').val(token.slippageTolerance);
    $('#maxImpact-edit').val(token.maxPriceImpact);
    $('#averageXScans-edit').val(token.averageXScans);
    $('#dontBuySellUntilFS-edit').prop('checked', token.dontBuySellUntilFullScans);
    $('#supportBurn-edit').prop('checked', token.supportFeeOnTransferTokens);
    $('#keepTry-edit').prop('checked', token.keepTryingTXifFail);
    $('#needAppr-edit').prop('checked', token.needTokenApproval);
    $('#checkBalOnlyStartup-edit').prop('checked', token.checkBalanceOnlyStartup);

    if(localStorage['midTier'] == 'true'){
        $('#midAddr-edit').prop('disabled', false);
        $('#inputTokenAddress-edit').prop('disabled', false);
        $('#trailSell-edit').prop('disabled', false);
        $('#trailBuy-edit').prop('disabled', false);
        $('#maxImpact-edit').prop('disabled', false);
    }else{
        $('#midAddr-edit').prop('disabled', true);
        $('#inputTokenAddress-edit').prop('disabled', true);
        $('#trailSell-edit').prop('disabled', true);
        $('#trailBuy-edit').prop('disabled', true);
        $('#maxImpact-edit').prop('disabled', true);
    }

    $('#tokenModal').show();
});

$('body').on('click','#close-token-details', async function() {
    $('#tokenModal').hide();
});


/* Section copied from submit-trade for use in edit mode after clicking token details */
$('body').on('click','#formClearButton-edit', async function(){
    $('#hidTokenID-edit').val('0');
    $('#tCode-edit').val('');
    $('#tAddr-edit').val('');
    $('#midAddr-edit').val('');
    $('#inputTokenCode-edit').val('ETH');
    $('#inputTokenAddress-edit').val('');
    $('#inputAmount-edit').val('');
    $('#buyLim-edit').val('0');
    $('#sellLim-edit').val('0');
    $('#stopLoss-edit').val('0');
    $('#trailSell-edit').val('0');
    $('#trailBuy-edit').val('0');
    $('#moonbag-edit').val('0');
    $('#neverSell-edit').val('0');
    $('#maxGas-edit').val('200');
    $('#slip-edit').val('50');
    $('#maxImpact-edit').val('15');
    $('#averageXScans-edit').val('5');
    $('#dontBuySellUntilFS-edit').prop('checked',true);
    $('#checkBalOnlyStartup-edit').prop('checked', false);
    $('#supportBurn-edit').prop('checked',false);
    $('#keepTry-edit').prop('checked',false);
    $('#needAppr-edit').prop('checked',false);
});

$('body').on('click','#formSubmitButton-edit', async function(){
    var inputToken = {
        active: false,
        tokenCode: document.getElementById("tCode-edit").value,
        tokenAddress: document.getElementById("tAddr-edit").value,
        midRouteTokenAddress: document.getElementById("midAddr-edit").value,
        inputTokenCode: document.getElementById("inputTokenCode-edit").value,
        inputAddress: document.getElementById("inputTokenAddress-edit").value,
        inputAmount: document.getElementById("inputAmount-edit").value,
        buyLimitPrice: document.getElementById("buyLim-edit").value,
        sellLimitPrice: document.getElementById("sellLim-edit").value,
        stopLossPrice: document.getElementById("stopLoss-edit").value,
        trailingSellPct: document.getElementById("trailSell-edit").value,
        trailingBuyPct: document.getElementById("trailBuy-edit").value,
        moonbagToKeep: document.getElementById("moonbag-edit").value,
        neverSellXTokens: document.getElementById("neverSell-edit").value,
        maxGasPriceGwei: document.getElementById("maxGas-edit").value,
        slippageTolerance: document.getElementById("slip-edit").value,
        maxPriceImpact: document.getElementById("maxImpact-edit").value,
        averageXScans: document.getElementById("averageXScans-edit").value,
        dontBuySellUntilFullScans: document.getElementById("dontBuySellUntilFS-edit").checked,
        supportFeeOnTransferTokens: document.getElementById("supportBurn-edit").checked,
        keepTryingTXifFail: document.getElementById("keepTry-edit").checked,
        needTokenApproval: document.getElementById("needAppr-edit").checked,
        checkBalanceOnlyStartup: document.getElementById("checkBalOnlyStartup-edit").checked,
    }
    if(parseInt($('#hidTokenID-edit').val()) != 0){
        inputToken.id = parseInt($('#hidTokenID-edit').val());
    }

    db.inputtokens.put(inputToken).then(function(){
        $('#tokenModal').hide();

        $('#hidTokenID-edit').val('0');

        iaTrades.refreshInactiveTrades();
    }).catch(function(error) {
        console.error("Ooops: " + error);
    });
    

});


/* End of edit section */


module.exports.refreshInactiveTrades = function(){
    $('#card-container-inactive').html('');
    db.inputtokens.count().then( function (c) {
        //console.log(c);
        if(c == 0) {
            const content = `
                <div class="noInactiveTrades">
                    <h1>No Inactive Trades</h1>
                </div>
            `;
            
            $('#card-container-inactive').append(content);
        }
        else {
            db.inputtokens.each(function (tc) {
                //console.log(tc.tokenCode)
                const content = `
                    <div class="card">
                        <div class="card-header">
                            <img class="token-icon" src="./assets/img/ethereum-eth-logo.svg">
                            <input type="checkbox" name="activeBox" value="${ tc.id }" class="activeBox">
                        </div>
                    <div class="card-body">
                        <h3 id="tokenName">${ tc.tokenCode }</h3>
                        <button type="button" class="bttn-material-flat bttn-xs bttn-primary token-inactive-modal-click" value="${ tc.id }">Token Details</button>
                    </div>
                `;

                $('#card-container-inactive').append(content);
            });
        }
    });
}

ipcRenderer.on('enableExecuteButtons', (event, arg) => {
    var checked = $("#cbEnableExecute").is(':checked');

    if(checked){
        $('.execute-token').prop('disabled', false).addClass('bttn-primary').removeClass('bttn-disabled');
    }else{
        $('.execute-token').prop('disabled', true).removeClass('bttn-primary').addClass('bttn-disabled');
    }
    
    $('.execute-token').html('Execute');
});

$('body').on('click','.buyTokenExecute', async function(){
    $('.execute-token').prop('disabled', true).removeClass('bttn-primary').addClass('bttn-disabled');

    var id = $(this).val();
    $(this).html('Executing...');
    console.log('Executing Buy: '+id);
    index.executeBuy(id);
});
$('body').on('click','.sellTokenExecute', async function(){
    $('.execute-token').prop('disabled', true).removeClass('bttn-primary').addClass('bttn-disabled');

    var id = $(this).val();
    $(this).html('Executing...');
    console.log('Executing Sell: '+id);
    index.executeSell(id);
});
$('body').on('click','.approveTokenExecute', async function(){
    $('.execute-token').prop('disabled', true).removeClass('bttn-primary').addClass('bttn-disabled');

    var id = $(this).val();
    $(this).html('Approving...');
    console.log('Executing Approve: '+id);
    index.executeApprove(id);
});



module.exports.startScanning = function(){
    db.inputtokens.toCollection().modify({
        active: false
    }).then(function(){
        $('input[name="activeBox"]:checked').each(function(){
            var thisID = parseInt($(this).val());
            db.inputtokens.where('id').equals(thisID).modify({
                active: true
            });
        });
    });
    
    db.outputbuytokens.clear();
    db.outputselltokens.clear();

    $('#button-active').click();

    index.startScan($("#startupPassword").val());
    passwordModal.style.display = "none";

    status.setActiveStatus();

    
}

module.exports.stopScanning = function(){
    $('#output-buy-table tbody tr').addClass('gray_row');
    $('#output-sell-table tbody tr').addClass('gray_row');
    $('.execute-token').prop('disabled', true).removeClass('bttn-primary').addClass('bttn-disabled');
    $('.approveTokenExecute').prop('disabled', true).removeClass('bttn-primary').addClass('bttn-disabled');

    index.stopScanPrices();
    db.inputtokens.toCollection().modify({
        active: false
    });
    status.setInactiveStatus();
    ipcRenderer.send('hardReloadWindow');
}

module.exports.deleteTokens = function(){
    $('input[name="activeBox"]:checked').each(function(){
        var thisID = parseInt($(this).val());
        db.inputtokens.where('id').equals(thisID).delete();
    });
    notiBox.showNotification('DELETED,Selected Tokens Successfully Deleted.');
}

module.exports.hardReloadWindow = function(){
    ipcRenderer.send('hardReloadWindow');
}