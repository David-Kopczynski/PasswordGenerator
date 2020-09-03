const { app, Tray, clipboard, Menu } = require("electron");
const path = require("path");
const fs = require("fs");

var tray;
var dataJSON;

function apppath() {
  return path.join(app.getAppPath(), ...arguments);
}

app.on("ready", function (event) {
  tray = new Tray(apppath("icon.ico"));

  tray.setToolTip("Generate Secure Password");

  fs.readFile(apppath("app", "menu.json"), "utf8", (err, data) => {
    if (err) throw err;

    dataJSON = JSON.parse(data);

    // Store items and add click events
    let newData = JSON.parse(data);
    for (var key in newData.items)
      newData.items[key].click = (event) => {
        for (var item in dataJSON.items) {
          if (dataJSON.items[item].label === event.label)
            dataJSON.items[item].checked = event.checked;
        }

        fs.writeFile(
          apppath("app", "menu.json"),
          JSON.stringify(dataJSON),
          function (err) {
            if (err) return console.log(err);
          }
        );
      };

    tray.setContextMenu(Menu.buildFromTemplate(newData.items));
  });

  // Generate and copy password to clipboard
  tray.on("click", () => {
    // Load settings by dataJSON
    var settings = {};
    for (var key in dataJSON.items)
      settings[dataJSON.items[key].label] = dataJSON.items[key].checked;

    // Generate Password
    var length = settings["Extra Long"] ? 64 : 32,
      charset =
        "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz" +
        (settings["Capital Letters"]
          ? "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ"
          : "") +
        (settings["Numbers"] ? "01234567890123456789" : "") +
        (settings["Special Characters"] ? "!§$%&/()=?°+~*#',;.:-_<>|²³" : ""),
      retVal = "";

    for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.random() * n);
    }

    // Write to clipboard
    clipboard.writeText(retVal, "password");
  });
});
