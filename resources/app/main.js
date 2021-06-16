// require('update-electron-app')({
//   logger: require('electron-log')
// })

const path = require('path')
const glob = require('glob')
const fs = require('fs')
const { app, BrowserWindow, ipcMain, Notification } = require('electron')

const { promises } = require('dns')

const debug = /--debug/.test(process.argv[2])

if (process.mas) app.setName('Trade Butler Bot')

let mainWindow = null

function initialize () {
  makeSingleInstance()

  loadDemos()

  function createWindow () {
    const windowOptions = {
      width: 1080,
      minWidth: 680,
      height: 840,
      title: app.getName(),
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true
      }
    }

    if (process.platform === 'linux') {
      windowOptions.icon = path.join(__dirname, 'assets/img/top-hat-logo-color.svg')
    }

    mainWindow = new BrowserWindow(windowOptions)
    mainWindow.loadURL(path.join('file://', __dirname, '/index.html'))

    // Launch fullscreen with DevTools open, usage: npm run debug
    if (debug) {
      mainWindow.webContents.openDevTools()
      mainWindow.maximize()
      require('devtron').install()
    }

    mainWindow.on('closed', () => {
      mainWindow = null
    })
  }

  app.on('ready', () => {
    createWindow()
  })

  ipcMain.on('hardReloadWindow', (event, arg) => {
    mainWindow.reload();
  });

  

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  })

  // custom vars
  
  // custom functions
  ipcMain.on('showNotification', (event, arg) => {
    var arguments = arg.split(',');
    const notification = {
      title: arguments[0],
      body: arguments[1]
    }

    new Notification(notification).show()
    event.reply('showClientNoti', arg)
  });


  ipcMain.on('memPoolScanning', (event, arg) => {
    event.reply('mpScanning');
  });
  ipcMain.on('memPoolFound', (event, arg) => {
    event.reply('mpFound');
  });
  ipcMain.on('memPoolMessage', (event, arg) => {
    event.reply('mpMessage', arg);
  });
  ipcMain.on('memPoolMessageAppend', (event, arg) => {
    event.reply('mpMessageAppend', arg);
  });

  ipcMain.on('refreshWallet', (event, arg) => {
    event.reply('getWalletData');
  });

  ipcMain.on('refreshBuyTable', (event, arg) => {
    event.reply('getBuyTable');
  });
  ipcMain.on('refreshSellTable', (event, arg) => {
    event.reply('getSellTable');
  });
  ipcMain.on('refreshTxTable', (event, arg) => {
    event.reply('getTxTable');
  });
  
  ipcMain.on('startTimerEvent', (event, arg) => {
    event.reply('startTimer', arg);
  });
  ipcMain.on('stopTimerEvent', (event, arg) => {
    event.reply('stopTimer', arg);
  });

  ipcMain.on('enableExecuteButtons', (event, arg) => {
    event.reply('enableExecuteButtons');
  });
  
}



// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance () {
  if (process.mas) return

  app.requestSingleInstanceLock()

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

// Require each JS file in the main-process dir
function loadDemos () {
  const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
  files.forEach((file) => { require(file) })
}

initialize()