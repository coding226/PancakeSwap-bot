const { ipcRenderer } = require('electron')
const mempool = require('../renderer-process/bot/mempool');

function getWalletData(){
    var appVersion = require('electron').remote.app.getVersion();
    $('#appVersion').text(appVersion);


    $("#wallet-footer").html('<div class="btn-collapse"><button id="btnCollapse" class="bttn-material-flat bttn-xs" >&larr; Collapse</button></div>');

    if (localStorage.getItem("settings") === null) {
        var settings = {"scanDelayMS":"5000","infuraAPI":"","alchemyAPI":"","etherAPI":"","poktAPI":"","customHTTP":"","customWSS":"","quorum":"1","network":"eth-ropsten","dex":"uniswap","defGas":"20","gasSpeed":"fast","gasAdd":"2","gasMax":"500000","waitTx":"20","etherscanGasLink":"https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=","spendApproveAmt":"0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF","minimumEthToKeep":"0.1"};
    }else{
        var settings = JSON.parse(localStorage["settings"]);
    }

    if(settings.dex == 'uniswap'){
        $('#lblDEX').text("Uniswap");
    } else if(settings.dex == 'sushiswap'){
        $('#lblDEX').text("Sushi Swap");
    } else if(settings.dex == 'pancakeswap'){
        $('#lblDEX').text("Pancake Swap V1");
    } else if(settings.dex == 'pancakeswapv2'){
        $('#lblDEX').text("Pancake Swap V2");
    } else if(settings.dex == 'julswap'){
        $('#lblDEX').text("JulSwap");
    } else if(settings.dex == 'streetswap'){
        $('#lblDEX').text("StreetSwap");
    }

    if(settings.network == 'eth-mainnet'){
        $('#lblNetwork').text("Ethereum Mainnet");
    } else if(settings.network == 'bsc-mainnet'){
        $('#lblNetwork').text("BSC Mainnet");
    } else if(settings.network == 'eth-ropsten'){
        $('#lblNetwork').text("Ethereum Ropsten Test");
    }
    
    
    
    if(localStorage["WalletPublicKey"] != "") {
        if (localStorage.getItem("WalletPublicKey") === null) {
            var shortWalletKey = '<span style="color:red">None Setup</span>';
        }
        else{
            var shortWalletKey = localStorage["WalletPublicKey"].substr(0, 6)
                + '...' + localStorage["WalletPublicKey"].substr(38, 4);
        }
        let content = `
            <svg height="30" width="30" style="float: left;">
                <circle id="status-circle" cx="15" cy="15" r="5" stroke="green" stroke-width="1" fill="none"/>
            </svg>
            <div id="wallet-header" class="wallet-header">
                <div id="copy-key-button" class="copy-key-button">
                    <div id="key-text" class="key-text">
                        ${shortWalletKey}
                    </div>
                    <input type="hidden" id="walletAddress" value="${ localStorage["WalletPublicKey"] }" />
                </div>
            </div>
        `;

        $("#wallet-footer").append(content);

        // ETH
        content = `
            <div id="wallet-item" class="wallet-item">
                <div id="wallet-item-text" class="wallet-item-text">
                    ETH/BNB: ${ parseFloat(localStorage["ethAmount"]).toFixed(5) }
                </div>
            </div>
        `;

        $("#wallet-footer").append(content);

        // TBB
        content = `
            <div id="wallet-item" class="wallet-item">
                <div id="wallet-item-text" class="wallet-item-text">
                TBB: ${ parseFloat(localStorage["tbbAmount"]).toFixed(2) }
                </div>
            </div>
        `;

        $("#wallet-footer").append(content);
        
        // LP tokens
        if(localStorage["lpAmount"] != 0) {
            content = `
                <div id="wallet-item" class="wallet-item">
                    <div id="wallet-item-text" class="wallet-item-text">
                        ETH-LP: &nbsp;&nbsp; ${ parseFloat(localStorage["lpAmount"]).toFixed(2) }
                    </div>
                </div>
            `;

            $("#wallet-footer").append(content);
        }

        // LP tokens
        if(localStorage["bscTBBAmount"] != 0) {
            content = `
                <div id="wallet-item" class="wallet-item">
                    <div id="wallet-item-text" class="wallet-item-text">
                        bTBB: &nbsp;&nbsp; ${ parseFloat(localStorage["bscTBBAmount"]).toFixed(2) }
                    </div>
                </div>
            `;

            $("#wallet-footer").append(content);
        }
        if(localStorage["bscLPAmount"] != 0) {
            content = `
                <div id="wallet-item" class="wallet-item">
                    <div id="wallet-item-text" class="wallet-item-text">
                        BSC-LP: &nbsp;&nbsp; ${ parseFloat(localStorage["bscLPAmount"]).toFixed(2) }
                    </div>
                </div>
            `;

            $("#wallet-footer").append(content);
        }
        
    }
    else {
        const content = `
            <svg height="30" width="30" style="float: left;">
                <circle id="status-circle" cx="15" cy="15" r="5" stroke="black" stroke-width="1" fill="none"/>
            </svg>
            <div id="wallet-header" class="wallet-header">
                <div id="key-text-inactive" class="key-text-inactive">
                    Not Logged into Wallet see Settings
                </div>
            </div>
        `;

        $("#wallet-footer").append(content);
    }
    mempool.loadMemPoolForm();
}

//const copyKeyButton = document.getElementById("copy-key-button")
//const copyValue = document.getElementById("key-text").value

$('body').on('click', '#copy-key-button', function() {
    var link = $("#walletAddress").val();
    var tempInput = document.createElement("input");
    tempInput.style = "position: absolute; left: -1000px; top: -1000px";
    tempInput.value = link;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    console.log("Copied the text:", tempInput.value);
    document.body.removeChild(tempInput);
});

$('body').on('click', '#btnCollapse', function() {
    var navElem = $('.nav');
    if(navElem.width() > 150){
        $(this).html('Expand &rarr;');
        navElem.css('width','100px').addClass('nav-collapsed');
    }else{
        $(this).html('&larr; Collapse');
        navElem.css('width','340px').removeClass('nav-collapsed');
    }
    
});

getWalletData();

ipcRenderer.on('getWalletData', (event, arg) => {
    getWalletData();
});