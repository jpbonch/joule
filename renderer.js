let activeTabIndex = -1;
let totalTabs = 0;

document.getElementById("min-btn").addEventListener("click", function (e) {
  window.electronAPI.min();
});

document.getElementById("max-btn").addEventListener("click", function (e) {
  window.electronAPI.max();
});

document.getElementById("close-btn").addEventListener("click", function (e) {
  window.electronAPI.close();
});

document.getElementById("newTab").addEventListener("click",async function (e) {
  createNewTab("file://" + await window.electronAPI.dirname() + "/newtab.html");
});

document.getElementById("refresh").addEventListener("click", function (e) {
  handleReload(e);
});

document.getElementById("back").addEventListener("click", function (e) {
  handleBack(e)
});

document.getElementById("forward").addEventListener("click", function (e) {
 handleForward(e);
});

function handleBack(e) {
  let webviews = document.getElementById("webviews").children;
  [...webviews].find(view => view.dataset.index == activeTabIndex).goBack();
}

function handleForward(e) {
  let webviews = document.getElementById("webviews").children;
  [...webviews].find(view => view.dataset.index == activeTabIndex).goForward();
}

function setTabActiveHandler(e) {
  if (this != e.target) {
    return;
  }
  setTabActive(e.target);
}


function closeTabHandler(e) {
  closeTab(e.target.parentElement);
}


async function setTabActive(toSet) {
  // set currently active tab inactive
  let webviews = document.getElementById("webviews").children;
  let tabs = document.getElementById("tabs").children;
  
  if (activeTabIndex != -1) {
    let activeTab = [...tabs].find(tab => tab.dataset.index == activeTabIndex);
    
    activeTab.style.backgroundColor = "black";
    activeTab.style.color = "yellowgreen";

    // deactivate webview
    let activeView = [...webviews].find(view => view.dataset.index == activeTabIndex);
    // activeView.style.display = "none";
    activeView.style.width = "0";
    activeView.style.height = "0";
    // activeView.style.flex = "0 1";
}

  // set this one actve
  toSet.style.backgroundColor = "yellowgreen";
  toSet.style.color = "black";
  // [...webviews].find(view => view.dataset.index == toSet.dataset.index).style.display = "inline-flex !important";
  [...webviews].find(view => view.dataset.index == toSet.dataset.index).style.width = "100%";
  [...webviews].find(view => view.dataset.index == toSet.dataset.index).style.height = "100%";
    // activeView.style.flex = "0 1";
  activeTabIndex = toSet.dataset.index;

  let url = document.getElementById("url");
  if (toSet.dataset.url == "file://" + await window.electronAPI.dirname() + "/newtab.html"){
    url.value = "";
  } else {
    url.value = toSet.dataset.url;
  }
  
}

function closeTab(tab) {
  let tabs = document.getElementById("tabs");
  let webviews = document.getElementById("webviews");
  let tabsChildren = tabs.children;
  if (tabsChildren.length == 1) {
    window.electronAPI.close();
  }
  if (tab.dataset.index == activeTabIndex) {
    if (activeTabIndex == 0) {
      setTabActive([...tabsChildren].find(tab => tab.dataset.index > activeTabIndex));
    } else {
      setTabActive([...tabsChildren].reverse().find(tab => tab.dataset.index < activeTabIndex));
    }
  }
  tabs.removeChild(tab);
  //delete webview
  // webviews.removeChild([...webviews].find(view => view.dataset.index == tab.dataset.index));
  [...webviews.children].find(view => view.dataset.index == tab.dataset.index).remove();
}

function handleReload(e) {
  let webviews = document.getElementById("webviews").children;
  [...webviews].find(view => view.dataset.index == activeTabIndex).reload();
}

function elementFromHTML(str) {
  var wrapper = document.createElement("div");
  wrapper.innerHTML = str;
  return wrapper.firstChild;
}

function createNewTab(url) {
  let tabs = document.getElementById("tabs");

  let newTab = elementFromHTML(
    `<div class="tab"><img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs" class="favicon"/><span class="tabttitle"></span></div>`
  );
  newTab.addEventListener("click", setTabActiveHandler);
  newTab.dataset.index = totalTabs;
  newTab.dataset.url = url;
  tabs.appendChild(newTab);

  let closeButton = elementFromHTML('<button class="close">X</button>') 
  closeButton.addEventListener("click", closeTabHandler)
  newTab.appendChild(closeButton);
  
  document.getElementById("url").focus();
  createNewWebview(url, newTab);
  setTabActive(newTab);

  
}

function createNewWebview(url, tab) {
  let webviews = document.getElementById("webviews");
  let newview = elementFromHTML(
    `<webview preload="./viewPreload.js" src="` + url + `" autosize="on"></webview>`
  );
  newview.style = `width: 100%;
    height: calc(100vh - 61px);
    position: fixed;
    display: flex;
    top: 61px;
    left: 0`;

newview.addEventListener("did-finish-load", async ()=>{
  tab.children[1].innerText = newview.getTitle();
  let domain = new URL(newview.getURL());
  domain = domain.hostname;
  if (newview.getURL() == "file:///" + await window.electronAPI.dirname() + "/newtab.html") {
    tab.children[0].src = "./globe.png"
  } else {
    tab.children[0].src = `http://www.google.com/s2/favicons?domain=${domain}`;
  }
})

newview.addEventListener("context-menu", (e) => {
  let contextmenu = document.getElementById("contextmenu");
  let contextmenuSelect = document.getElementById("contextmenuSelect");
  if (e.params.x > document.documentElement.clientWidth - 250) {
    e.params.x -= 250
  }
  
  if (e.params.selectionText != ""){
    if (e.params.y > document.documentElement.clientHeight - 60) {
      e.params.y -= 60
    }
  contextmenuSelect.style.display = "block";
  contextmenu.style.display = "none";
  contextmenuSelect.style.top = e.params.y + "px";
  contextmenuSelect.style.left = e.params.x + "px";
} else {
  if (e.params.y > document.documentElement.clientHeight - 170) {
    e.params.y -= 170
  }
  contextmenu.style.display = "block";
  contextmenuSelect.style.display = "none";
  contextmenu.style.top = e.params.y + "px";
  contextmenu.style.left = e.params.x + "px";
  }
});

newview.addEventListener("ipc-message", (e)=>{
  let contextmenu = document.getElementById("contextmenu");
  let contextmenuSelect = document.getElementById("contextmenuSelect");
  console.log(e.args)
  if (e.args.length == 7) { // if is a keypress
    let event = new KeyboardEvent('keydown', {
      code: e.args[0],
      key: e.args[1],
      shiftKey: e.args[2],
      altKey: e.args[3],
      ctrlKey: e.args[4],
      metaKey: e.args[5],
      repeat: e.args[6]
    });
    shortcutHandler(event);
  } else if (e.args.length == 0) { // if is a click
    contextmenuSelect.style.display = "none";
    contextmenu.style.display = "none";
  } else if (e.args.length == 1) {
    handleURL(e.args[0]);
  }
})


newview.dataset.index = totalTabs;

totalTabs++;
  webviews.appendChild(newview);
}
document.onkeydown = shortcutHandler;
async function shortcutHandler(e) {
  let contextmenu = document.getElementById("contextmenu");
  let contextmenuSelect = document.getElementById("contextmenuSelect");
  let webviews = document.getElementById("webviews").children;
  let currView = [...webviews].find(view => view.dataset.index == activeTabIndex);
  if ((e.ctrlKey || e.metaKey) && e.key == "t") {
    createNewTab("file://" + await window.electronAPI.dirname() + "/newtab.html");
    contextmenuSelect.style.display = "none";
    contextmenu.style.display = "none";
  } else if ((e.ctrlKey || e.metaKey) && e.key == "w") {
    let tabs = document.getElementById("tabs").children;
    closeTab([...tabs].find(tab => tab.dataset.index == activeTabIndex))
    contextmenuSelect.style.display = "none";
    contextmenu.style.display = "none";
  } else if ((e.ctrlKey || e.metaKey) && e.key == "r") {
    handleReload(e);
    contextmenuSelect.style.display = "none";
    contextmenu.style.display = "none";
  } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key == "I") {
    handleInspect();
  } else if ((e.ctrlKey || e.metaKey) && e.key == "f") {
    document.getElementById("findMenu").style.display = "block";
    document.getElementById("findInput").focus();
    contextmenuSelect.style.display = "none";
    contextmenu.style.display = "none";
  } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key == "V") {
    currView.pasteAndMatchStyle();
    contextmenuSelect.style.display = "none";
    contextmenu.style.display = "none";
  } else if (e.key == "Escape") {
    currView.stopFindInPage("keepSelection");
    document.getElementById("findMenu").style.display = "none";
    contextmenuSelect.style.display = "none";
    contextmenu.style.display = "none";
  } else if ((e.ctrlKey || e.metaKey) && e.key == "p") {
    handlePrint();
  } else if ((e.ctrlKey || e.metaKey) && e.key == "=") {
    handleZoom(0.1);
  } else if ((e.ctrlKey || e.metaKey) && e.key == "-") {
    handleZoom(-0.1);
  }
  
};

function handlePrint() {
  let contextmenu = document.getElementById("contextmenu");
  let contextmenuSelect = document.getElementById("contextmenuSelect");
  let webviews = document.getElementById("webviews").children;
  let currView = [...webviews].find(view => view.dataset.index == activeTabIndex);
  currView.printToPDF({});
  contextmenuSelect.style.display = "none";
  contextmenu.style.display = "none";
}

function handleInspect(x, y) {
   let contextmenu = document.getElementById("contextmenu");
  let contextmenuSelect = document.getElementById("contextmenuSelect");
  let webviews = document.getElementById("webviews").children;
  let currView = [...webviews].find(view => view.dataset.index == activeTabIndex);

  if (x && y) {
    currView.inspectElement(x, y);
  } else {
    currView.openDevTools();
  }
  
    contextmenuSelect.style.display = "none";
    contextmenu.style.display = "none";
}

function handleZoom(change) {
  let contextmenu = document.getElementById("contextmenu");
  let contextmenuSelect = document.getElementById("contextmenuSelect");
  let webviews = document.getElementById("webviews").children;
  let currView = [...webviews].find(view => view.dataset.index == activeTabIndex);
  currView.setZoomFactor(currView.getZoomFactor()+ change)
  document.getElementById("currentZoom").innerText = Math.round(currView.getZoomFactor() * 100) + "%"
  document.getElementById("zoomMenu").style.display = "block";
  let timeout = setTimeout(() => {document.getElementById("zoomMenu").style.display = "none"}, 5000)
  contextmenuSelect.style.display = "none";
  contextmenu.style.display = "none";
}

(async function() {
  createNewTab("file://" + await window.electronAPI.dirname() + "/newtab.html");
  // createNewTab("https://youtube.com");
})();

function handleURL(url) {
  let urlInput = document.getElementById("url");
  urlInput.value = url;
  let webviews = document.getElementById("webviews").children;
  var strict = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gi;
  var less = /([-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gi;
  if (url.match(new RegExp(strict))) {
    [...webviews].find(view => view.dataset.index == activeTabIndex).loadURL(url);
    
  } else if (url.match(new RegExp(less))) {
    [...webviews].find(view => view.dataset.index == activeTabIndex).loadURL("https://" + url);
    urlInput.value = "https://" + url;
  } else {
    [...webviews].find(view => view.dataset.index == activeTabIndex).loadURL("https://www.google.com/search?q=" + url);
    urlInput.value = "https://www.google.com/search?q=" + url;
  }
  let tabs = document.getElementById("tabs").children;
  [...tabs].find(tab => tab.dataset.index == activeTabIndex).dataset.url = urlInput.value;
}

document.getElementById("url").addEventListener("keydown", (e) => {
  
  if (e.key == "Enter") {

  handleURL(e.target.value);
  
  
}
});

document.getElementById("findInput").addEventListener("input", () => {
  let findInput = document.getElementById("findInput");
  let webviews = document.getElementById("webviews").children;
  [...webviews].find(view => view.dataset.index == activeTabIndex).findInPage(findInput.value, {
    forward: true,
    findNext: true,
    matchCase: false
  });
})

document.getElementById("findNext").addEventListener("click", () => {
  let webviews = document.getElementById("webviews").children;
  let findInput = document.getElementById("findInput");
  [...webviews].find(view => view.dataset.index == activeTabIndex).findInPage(findInput.value, {
    forward: true,
    findNext: false,
    matchCase: false
  });
})

document.getElementById("findPrev").addEventListener("click", () => {
  let webviews = document.getElementById("webviews").children;
  let findInput = document.getElementById("findInput");
  [...webviews].find(view => view.dataset.index == activeTabIndex).findInPage(findInput.value, {
    forward: false,
    findNext: false,
    matchCase: false
  });
})

document.getElementById("closeFindMenu").addEventListener("click", () => {
  document.getElementById("findMenu").style.display = "none";
})

document.body.addEventListener("click", (e) => {
  contextmenu = document.getElementById("contextmenu");
  contextmenuSelect = document.getElementById("contextmenuSelect");
  if (e.target != contextmenu && e.target != contextmenuSelect) {
    contextmenu.style.display = "none";
    contextmenuSelect.style.display = "none";
  }
})

document.getElementById("contextBack").addEventListener("click", (e)=>{
  handleBack(e);
})

document.getElementById("contextForward").addEventListener("click", (e)=>{
  handleForward(e);
})

document.getElementById("contextReload").addEventListener("click", (e)=>{
  handleReload(e);
})

document.getElementById("contextPrint").addEventListener("click", (e)=>{
  handlePrint();
})

document.getElementById("contextSource").addEventListener("click", (e)=>{
  let webviews = document.getElementById("webviews").children;
  let currView = [...webviews].find(view => view.dataset.index == activeTabIndex);
  createNewTab("view-source:" + currView.getURL());
})

document.getElementById("contextInspect").addEventListener("click", (e)=>{
   let contextmenu = document.getElementById("contextmenu");
   handleInspect(parseInt(contextmenu.style.left, 10), parseInt(contextmenu.style.top, 10));
})

document.getElementById("contextCopy").addEventListener("click", (e)=>{
  let webviews = document.getElementById("webviews").children;
  let currView = [...webviews].find(view => view.dataset.index == activeTabIndex);
  currView.copy();
})

document.getElementById("contextSelectInspect").addEventListener("click", (e)=>{
  let contextmenu = document.getElementById("contextmenu");
  handleInspect(parseInt(contextmenu.style.left, 10), parseInt(contextmenu.style.top, 10));
})

document.getElementById("zoomInButton").addEventListener("click", ()=>{
  handleZoom(0.1);
})

document.getElementById("zoomOutButton").addEventListener("click", ()=>{
  handleZoom(-0.1);
})




//draggable tabs
//settings menu with themes and history
// bookmarks
//autofill in url bar
// download manager

// fix print to pdf