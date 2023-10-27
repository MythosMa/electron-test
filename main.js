const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('node:path')

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog();
  if (!canceled) {
    return filePaths[0];
  }
}
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  ipcMain.on("set-title", (event, title) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    win.setTitle(title);
  });

  const menu = Menu.buildFromTemplate([
    {
      label: "加減测试",
      submenu: [
        {
          click: () => win.webContents.send("update-counter", 1),
          label: "++",
        },
        {
          click: () => win.webContents.send("update-counter", -1),
          label: "--",
        },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);

  win.loadFile("index.html");
};

app.whenReady().then(() => {
  ipcMain.handle("ping", () => "pong");
  ipcMain.handle("dialog:openFile", handleFileOpen);
  ipcMain.on('counter-value', (_event, value) => {
    console.log(value) // will print value to Node console
  })
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
