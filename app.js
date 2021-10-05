const { app, BrowserWindow, ipcMain, ipcRenderer, } = require('electron')
const { Client, Authenticator} = require('minecraft-launcher-core')
const path = require('path')
const launcher = new Client()
let appdata = app.getPath("appData")
let win, opts

function createWindow () {
  // Create the browser window.
    win = new BrowserWindow({
        title: "Erina World | Launcher",
        icon: path.join(__dirname, "/assets/img/logo.png"),
        autoHideMenuBar: true,
        minWidth: 1000,
        minHeight: 700,
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        }
    })
    process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
    win.webContents["ELECTRON_DISABLE_SECURITY_WARNINGS"] = true;
    win.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
    win.loadFile(path.join(__dirname, "index.html"))
    // win.webContents.openDevTools()
}

ipcMain.on('settings', (event, data) => {
    opts.memory.min = data.min
    opts.memory.max = data.max
})

app.whenReady().then(() => {
    createWindow()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on("login", (event, data) => {
    if (!data.p) {
        auth = Authenticator.getAuth(data.u)
        auth.then(() => {
            win.loadFile(path.join(__dirname, "./app/crack.html"))    
        })
        console.log("Cracked Accounts");
    } else if (data.u && data.p) {
        auth = Authenticator.getAuth(data.u, data.p)
        auth.then((user) => {
        win.loadFile(path.join(__dirname, "./app/premium.html")).then(() => {
            win.webContents.send("user", user)
                console.log(user);
            })
        })
        console.log("Mojang Accounts");
    }
    // event.sender.send("done")
    // win.loadFile(path.join(__dirname, "./app.html"))
    opts = {
        clientPackage: "https://www.dropbox.com/s/gip94ekzir47lmo/Modpack.zip?dl=1",
        authorization: auth,
        root: appdata + "/.erinaWorld",
        version: {
            number: "1.12.2",
            type: "release"
        },
        forge: path.join(appdata + "/.erinaWorld/forge.jar"),
        memory: {
            max: "2000",
            min: "1000"
        }
    }
})

ipcMain.on("msLogin", () => {
    msmc.getElectron().FastLaunch(
        (call) => {
            // The function is called when the login has been successful
            console.log("Login successful");
            var accessToken = call.access_token;
            //console.log(call);
            var profile = {
                name: call.profile.name,
            };
            auth = msmc.getMCLC().getAuth(call)
            auth.then(() => {
                setTimeout(() => {
                    win.loadFile(path.join(__dirname, "./app/prenium.html")).then(() => {
                        win.webContents.send("user", profile)
                        console.log(profile);
                    })
                }, 1000);
            })
            opts = {
                clientPackage: "https://www.dropbox.com/s/gip94ekzir47lmo/Modpack.zip?dl=1",
                authorization: auth,
                root: appdata + "/.erinaWorld",
                version: {
                    number: "1.12.2",
                    type: "release"
                },
                forge: path.join(appdata + "/.erinaWorld/forge.jar"),
                memory: {
                    max: "2000",
                    min: "1000"
                }
            }
        },
        (update) => {
            switch (update.type) {
                case "Starting":
                    console.log("Checking user started!");
                    win.webContents.send('_loginSuccess', {msg: "Checking user started!"})
                    break;
                case "Loading":
                    console.log("Loading:", update.data, "-", update.percent + "%");
                    win.webContents.send('loading', {msg: `${update.data} - ${update.percent}%`, percent: `${update.percent}%`})
                    break;
                case "Rejection":
                    console.error("Fetch rejected!", update.data);
                    win.webContents.send('error', { error: "Fetch rejected!", msg: update.data})
                    break;
                case "Error":
                    console.error("MC-Account error:", update.data);
                    win.webContents.send('error', { error: "MC-Account Error", msg: update.data})
                    break;
                case "Cancelled":
                    console.error("User clicked cancel!");
                    win.webContents.send('_loginCancelled', null)
                    break;	
            }
        }
    )
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
})