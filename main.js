const { app, BrowserWindow, ipcMain, Menu, MenuItem, webContents } = require("electron");
const path = require("path");

const createWindow = () => {
  const win = new BrowserWindow({
    autoHideMenuBar: true,
    webPreferences: {
      webviewTag: true,
      preload: path.join(__dirname, "preload.js"),
    },
    titleBarStyle: "hidden",
  });
  let menu = new Menu()
  menu.append(new MenuItem({
    label: 'Menu',
    submenu: [{
      role: 'menu',
      label: 'menu',
      accelerator: process.platform === 'darwin' ? 'Cmd+Shift+I' : 'Ctrl+Shift+I',
      click: () => {
        win.webContents.openDevTools();
      }
    }]
  }))
  win.setMenu(menu);
  // win.setMenu(null);
  win.loadFile("index.html");
};

app.whenReady().then(() => {
  ipcMain.on("min", (event) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    win.minimize();
  });
  ipcMain.on("max", (event) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    win.maximize();
  });
  ipcMain.on("close", (event) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    win.close();
  });
  ipcMain.handle('dirname', () => {return __dirname.replace(/\\/g, '/')})
  createWindow();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
