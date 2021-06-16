const Store = require('electron-store')
const ethers = require('ethers');

const bytenode = require('bytenode');
var processor = require('../../bot-functions/processor.jsc');
// var processor = require('../../bot-functions/processor');

processor.checkProjectTokens();

const setupModal = document.getElementById("setup-modal")
const walletModal = document.getElementById("keys-modal")
const setupButton = document.getElementById("setup-button")
const walletButton = document.getElementById("wallet-button")
const closeSetupButton = document.getElementById("close-setup");
const closeKeysButton = document.getElementById("close-key");
const checkBoxPriv = document.getElementById("privateKeyPass");

const keySuccessMsg = document.getElementById("keySuccessMsg");
const settingsSuccessMsg = document.getElementById("settingsSuccessMsg");

const { ipcRenderer } = require('electron');

const notiBox = require('../../assets/notiBox');

$("#pubKey").text(localStorage["WalletPublicKey"]);

checkBoxPriv.onclick = function() {
    let privKeyInput = document.getElementById("privKey");
    if(privKeyInput.type === "password") {
        privKeyInput.type = "text";
    }
    else {
        privKeyInput.type = "password";
    }
}

setupButton.onclick = function() {
    setupModal.style.display = "block";
    settingsSuccessMsg.style.display = "none";

    var settings = JSON.parse(localStorage["settings"]);

    document.getElementById("scanDelayMS").value = settings.scanDelayMS;
    document.getElementById("infuraAPI").value = settings.infuraAPI;
    document.getElementById("alchemyAPI").value = settings.alchemyAPI;
    document.getElementById("etherAPI").value = settings.etherAPI;
    document.getElementById("poktAPI").value = settings.poktAPI;
    document.getElementById("customHTTP").value = settings.customHTTP;
    document.getElementById("customWSS").value = settings.customWSS;
    document.getElementById("quorum").value = settings.quorum;
    document.getElementById("network").value = settings.network;
    document.getElementById("dex").value = settings.dex;
    document.getElementById("defGas").value = settings.defGas;
    document.getElementById("gasSpeed").value = settings.gasSpeed;
    document.getElementById("gasAdd").value = settings.gasAdd;
    document.getElementById("gasMax").value = settings.gasMax;
    document.getElementById("waitTx").value = settings.waitTx;
    document.getElementById("etherscanGas").value = settings.etherscanGasLink;
    document.getElementById("sendAppr").value = settings.spendApproveAmt;
    document.getElementById("minEth").value = settings.minimumEthToKeep;
}

closeSetupButton.onclick = function() {
    setupModal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == setupModal) {
        setupModal.style.display = "none";
    }
}

closeKeysButton.onclick = function() {
    $("#privKey").val('');
    $("#passWord").val('');
    $("#passWordConfirm").val('');
    walletModal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == walletModal) {
        walletModal.style.display = "none";
    }
}

walletButton.onclick = function() {
    walletModal.style.display = "block";
}

function showReloadDialog(){
    $('#reload-modal').show();
}

$('body').on('click','.reloadWindow', async function(){
    ipcRenderer.send('hardReloadWindow');
});

//Grab form submit button
let formSubmit = document.getElementById("submit-setup-button")

formSubmit.addEventListener('click', () => {
    var settings = {
        scanDelayMS: document.getElementById("scanDelayMS").value,
        infuraAPI: document.getElementById("infuraAPI").value,
        alchemyAPI: document.getElementById("alchemyAPI").value,
        etherAPI: document.getElementById("etherAPI").value,
        poktAPI: document.getElementById("poktAPI").value,
        customHTTP: document.getElementById("customHTTP").value,
        customWSS: document.getElementById("customWSS").value,
        quorum: document.getElementById("quorum").value,
        network: document.getElementById("network").value,
        dex: document.getElementById("dex").value,
        defGas: document.getElementById("defGas").value,
        gasSpeed: document.getElementById("gasSpeed").value,
        gasAdd: document.getElementById("gasAdd").value,
        gasMax: document.getElementById("gasMax").value,
        waitTx: document.getElementById("waitTx").value,
        etherscanGasLink: document.getElementById("etherscanGas").value,
        spendApproveAmt: document.getElementById("sendAppr").value,
        minimumEthToKeep: document.getElementById("minEth").value
    };

    localStorage["settings"] = JSON.stringify(settings);

    $('#setup-modal').hide();
    showReloadDialog();
    //processor.checkProjectTokens();
});


let keySubmit = document.getElementById("key-setup-button")

keySubmit.addEventListener('click', () => {
    if($("#passWord").val() == "" || $("#privKey").val() == ""){
        notiBox.showNotification('Keys Invalid,Check your key or password, both must not be blank!');
        return;
    }
    if($("#passWord").val() != $("#passWordConfirm").val()){
        notiBox.showNotification("Password Mismatch,Your passwords entered don't match!");
        return;
    }

    const signerSetup = new ethers.Wallet(document.getElementById("privKey").value);
    const encryptedWallet = signerSetup.encrypt(document.getElementById("passWord").value);

    encryptedWallet.then(function(wallet){
        localStorage["WalletPublicKey"] = signerSetup.address;
        localStorage["WalletPrivateKeyEnc"] = wallet;

        $("#pubKey").text(signerSetup.address);
        $("#privKey").val('');
        $("#passWord").val('');
        $("#passWordConfirm").val('');
        
        notiBox.showNotification("Success!,Private keys saved and encrypted successfully!");
        $('#keys-modal').hide();
        processor.checkProjectTokens();
    });
});