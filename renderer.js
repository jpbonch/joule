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
  let webviews = document.getElementById("webviews").children;
  [...webviews].find(view => view.dataset.index == activeTabIndex).goBack();
});

document.getElementById("forward").addEventListener("click", function (e) {
  let webviews = document.getElementById("webviews").children;
  [...webviews].find(view => view.dataset.index == activeTabIndex).goForward();
});

function setTabActiveHandler(e) {
  if (this != e.target) {
    return;
  }
  setTabActive(e.target);
}


function closeTabHandler(e) {
  closeTab(e.target.parentElement);
}


function setTabActive(toSet) {
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
  [...webviews].find(view => view.dataset.index == tab.dataset.index).remove();
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
    `<div class="tab"><span class="tabttitle"></span></div>`
  );
  newTab.addEventListener("click", setTabActiveHandler);
  newTab.dataset.index = totalTabs;
  tabs.appendChild(newTab);

  let closeButton = elementFromHTML('<button class="close">X</button>') 
  closeButton.addEventListener("click", closeTabHandler)
  newTab.appendChild(closeButton);
  
  
  createNewWebview(url, newTab);
  setTabActive(newTab);

  
}

function createNewWebview(url, tab) {
  let webviews = document.getElementById("webviews");
  let newview = elementFromHTML(
    `<webview src="` + url + `" autosize="on"></webview>`
  );
  newview.style = `width: 100%;
    height: calc(100vh - 60px);
    position: fixed;
    display: flex;
    top: 60px;
    left: 0`;

newview.addEventListener("did-finish-load", ()=>{
  tab.children[0].innerHTML = newview.getTitle()
})
newview.dataset.index = totalTabs;
totalTabs++;
  webviews.appendChild(newview);
}

document.onkeydown = async function (e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() == "t") {
    createNewTab("file://" + await window.electronAPI.dirname() + "/newtab.html");
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() == "w") {
    let tabs = document.getElementById("tabs").children;
    closeTab([...tabs].find(tab => tab.dataset.index == activeTabIndex))
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() == "r") {
    handleReload(e);
  } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() == "i") {
    let webviews = document.getElementById("webviews").children;
    [...webviews].find(view => view.dataset.index == activeTabIndex).openDevTools();
  }
};

(async function() {
  // createNewTab("file://" + await window.electronAPI.dirname() + "/newtab.html");
  createNewTab("https://youtube.com");
})();



document.getElementById("url").addEventListener("keydown", (e) => {
  console.log(e.key)
  let tabs = document.getElementById("tabs").children;
  console.log(e.target.value)
  if (e.key == "Enter") {
  // change src of webview
  // change tab name
  let webviews = document.getElementById("webviews").children;
  var strict = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gi;
  var less = /([-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gi;
  if (e.target.value.match(new RegExp(strict))) {
    [...webviews].find(view => view.dataset.index == activeTabIndex).loadURL(e.target.value);
    
  } else if (e.target.value.match(new RegExp(less))) {
    [...webviews].find(view => view.dataset.index == activeTabIndex).loadURL("https://" + e.target.value);
    e.target.value = "https://" + e.target.value
  } else {
    [...webviews].find(view => view.dataset.index == activeTabIndex).loadURL("https://www.google.com/search?q=" + e.target.value);
    e.target.value = "https://www.google.com/search?q=" + e.target.value
  }
 
  
}
});


// implement keboard shortcutrs: undo, redo, cut, copy, paste, select all, zoom in, zoom out
//change url when change tab
//fix webview component not deleting
// bookmarks
//setings with themes
//autofill in url bar
// fix when closing tabs it deselects/ selects first  