import path from "path";

import { app, BrowserWindow, ipcMain, IpcMainEvent } from "electron";
import fs from "fs";
import isDev from "electron-is-dev";
import prepareNext from "electron-next";
import ping from "./ping";
import {execFile as exec} from "child_process";
import {
  checkForUpdate,
  downloadLatest,
  extractGame,
  writeNewGameVersion,
} from "./updater";

app.on("ready", async () => {
  await prepareNext("./renderer");

  const updateWindow = new BrowserWindow({
    width: 300,
    height: 400,
    frame: false,
    resizable: false,
    icon: path.join(__dirname, "../public/64.ico"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const udpdateUrl = isDev
    ? "http://localhost:8000/update"
    : `file://${path.join(__dirname, "../renderer/out/update.html")}`;

  updateWindow.loadURL(udpdateUrl);
  await sleep(2000);

  if (!isDev) {
    const version = fs.readFileSync("./launcher-version.txt", "utf-8");
    const shouldUpdate = await checkForUpdate(version);

    if (shouldUpdate) {
      await downloadLatest((total, received) => {
        updateWindow.webContents.send("received_bytes", received);
        updateWindow.webContents.send("total_bytes", total);
      });
      await sleep(1000);
      process.exit();
    }
  }

  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 635,
    minWidth: 1000,
    minHeight: 635,
    autoHideMenuBar: true,
    frame: false,
    icon: path.join(__dirname, "../public/64.ico"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  updateWindow.close();

  const url = isDev
    ? "http://localhost:8000/"
    : `file://${path.join(__dirname, "../renderer/out/index.html")}`;

  mainWindow.loadURL(url);

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  mainWindow.on("maximize", () => {
    mainWindow.webContents.send("message", "maximize");
  });
  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.send("message", "unmaximize");
  });

  ipcMain.on("message", (_event: IpcMainEvent, message: any) => {
    switch (message) {
      case "minimize": {
        mainWindow.minimize();
        break;
      }
      case "maximize": {
        mainWindow.maximize();
        break;
      }
      case "unmaximize": {
        mainWindow.unmaximize();
        break;
      }
      case "close": {
        mainWindow.hide();
        app.quit();
        break;
      }
    }
  });

  ipcMain.on("checkForUpdates", async (_event: IpcMainEvent, _data: any) => {
    const version = fs.readFileSync("./game/version.txt", "utf-8");
    const shouldUpdate = await checkForUpdate(version, true);
    mainWindow.webContents.send("updateFound", shouldUpdate);
  });

  ipcMain.on("downloadLatest", async (_event: IpcMainEvent, _data: any) => {
    await downloadLatest((total, received) => {
      mainWindow.webContents.send("game_received_bytes", received);
      mainWindow.webContents.send("game_total_bytes", total);
    }, true);
    extractGame();
    await writeNewGameVersion();

    mainWindow.webContents.send("download_completed");
  });

  ipcMain.on("startGame", async (_event: IpcMainEvent, _data: any) => {
    exec("./game/Build/Stratepig.exe");
    mainWindow.close();
  });

  setInterval(async () => {
    const res = await ping();
    mainWindow.webContents.send("server_ping", [res.alive, res.time]);
  }, 1000);
});

const quit = () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
};

app.on("window-all-closed", () => {
  quit();
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
