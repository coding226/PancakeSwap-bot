const {
  BrowserWindow,
  Menu,
  MenuItem,
  ipcMain,
  app
} = require('electron')

const menu = new Menu()
menu.append(new MenuItem({
  label: 'Undo',
  accelerator: 'CmdOrCtrl+Z',
  role: 'undo'
}))
menu.append(new MenuItem({
  label: 'Redo',
  accelerator: 'Shift+CmdOrCtrl+Z',
  role: 'redo'
}))
menu.append(new MenuItem({ type: 'separator' }))
menu.append(new MenuItem({
  label: 'Cut',
  accelerator: 'CmdOrCtrl+X',
  role: 'cut'
}))
menu.append(new MenuItem({
  label: 'Copy',
  accelerator: 'CmdOrCtrl+C',
  role: 'copy'
}))
menu.append(new MenuItem({
  label: 'Paste',
  accelerator: 'CmdOrCtrl+V',
  role: 'paste'
}))
menu.append(new MenuItem({
  label: 'Select All',
  accelerator: 'CmdOrCtrl+A',
  role: 'selectall'
}))


app.on('browser-window-created', (event, win) => {
  win.webContents.on('context-menu', (e, params) => {
    menu.popup(win, params.x, params.y)
  })
})

ipcMain.on('show-context-menu', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  menu.popup(win)
})
