const { Dexie } = require('dexie');
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

const tableContainer = document.getElementById("error-table-container")

function getErrorTableHTML() {
    //Switch out placeholder with strings to be output to screen
    const content =`
        <table id="error-table" class="output-table" style="width:100%;table-layout: fixed;">
            
            <thead>
            <tr>
                <th>Time Stamp</th>
                <th>Code</th>
                <th>Message</th>
            </tr>
            </thead>
            <tbody>
                
            </tbody>
            
        </table>
        <br>
    `;

    tableContainer.innerHTML += content;
}

ipcRenderer.on('getErrorTable', (event, arg) => {
    getErrorTable();
});

function getErrorTable(){
    //console.log('buy table refresh');
    
    var allErrorRows = '';
    
    db.errorlog.reverse().each(function(err){
        var row = '<tr>';

        row += '<td>' + err.timeStamp + '</td>';
        row += '<td>' + err.code + '</td>';
        row += '<td>' + err.message + '</td>';

        row += '</tr>';
        
        allErrorRows += row;
    }).then(() => {
        $('#error-table tbody').html(allErrorRows);
    }).catch (err => {
        console.error(err);
    });
}

module.exports = getErrorTableHTML();
getErrorTable();