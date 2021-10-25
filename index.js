const { app, BrowserWindow, ipcMain, ipcRenderer, } = require('electron')
const { fstat, fstatSync} = require('fs')
const { Client, Authenticator} = require('minecraft-launcher-core')
const { launch } = require('msmc')
const path = require('path')
const launcher = new Client()
let appdata = app.getPath("appData")

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    title: "Erina World | Launcher",
    icon: path.join(__dirname, "/assets/img/logo.png"),
    autoHideMenuBar: true,
    minWidth: 1000,
    minHeight: 700,
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true
    }
  })
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
  win.webContents["ELECTRON_DISABLE_SECURITY_WARNINGS"] = true;
  win.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
  win.loadFile(path.join(__dirname, "index.html"))
  
  // Pour savoir quelle type de connexion on va utiliser:
  var authtype
  
  // win.webContents.openDevTools()
  ipcMain.on("login", (event, data) => {
        if (!data.p) {
          var auth = Authenticator.getAuth(data.u)
          auth.then(() => {
              win.loadFile(path.join(__dirname, "./appcrack.html"))    
          })
          console.log("Cracked Accounts");
          authtype = "crack";
      } else if (data.u && data.p) {
          var auth = Authenticator.getAuth(data.u, data.p)
          auth.then((user) => {
              win.loadFile(path.join(__dirname, "./app premium.html")).then(() => {
                  win.webContents.send("user", user)
                  console.log(user);
              })    
          })
          console.log("Mojang Accounts");
          authtype = "mojang";
      }
      // event.sender.send("done")
      // win.loadFile(path.join(__dirname, "./app.html"))
      let opts = {
          clientPackage: "https://www.dropbox.com/s/7sy478lexou9h47/Modpack.zip?dl=1",
          // https://www.dropbox.com/s/7sy478lexou9h47/Modpack.zip?dl=1
          authorization: auth,
          root: appdata + "/.erinaWorld",
          version: {
              number: "1.16.5",
              type: "release"
          },
          forge: path.join(appdata + "/.erinaWorld/forge.jar"),
          javaPath:"C:/Program Files/Java/jdk1.8.0_301/bin/java.exe",
          memory: {
              max: "2000M",
              min: "1000M"
          }
      }

      ipcMain.on('settings', (event, data) => {
        opts.memory.min = data.min,
        opts.memory.max = data.max
      })
      
      ipcMain.on("launch", () => {
        launcher.launch(opts);
        launcher.on('debug', (e) => {
        console.log(e)
        win.webContents.send("logs", { log: e })
        });    
        launcher.on('data', (e) => {
            console.log(e)
            win.webContents.send("logs", { log: e })
        });
        // launcher.on('close', (e) => {
          
        //   // let launchbtn = document.getElementById('launch')
        //   // launchbtn.disabled = false
        //   // launchbtn.style.backgroundColor = "#0b8001"
        //   // launchbtn.style.color = "white"
        // });


        })
      })
  }



app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {

    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})