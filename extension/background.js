chrome.contextMenus.create({
  id: "save-to-toughtnet",
  title: "Save to ToughtNet",
  contexts: ["page", "link", "selection"],
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "save-to-toughtnet") {
    chrome.action.openPopup();
  }
});
