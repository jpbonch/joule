window.onload = function () {
  const { ipcRenderer } = require("electron");

  document.body.addEventListener("click", (e) => {
    ipcRenderer.sendToHost("ipc-message");
  });

  document.onkeydown = function handle(e) {
    console.log(e);
    ipcRenderer.sendToHost(
      "ipc-message",
      e.code,
      e.key,
      e.shiftKey,
      e.altKey,
      e.ctrlKey,
      e.metaKey,
      e.repeat
    );
  };
};
