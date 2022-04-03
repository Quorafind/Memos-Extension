import { getUrlMentions, getLocalSettings, obsidianRequest } from "./utils";
import { ExtensionLocalSettings } from "./types";
import SendIt, { SendItCommand } from "./sendIt";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: "Send Selection to Memos",
    id: 'memos-selection-context-menu',
    contexts:["selection"],
  });
  chrome.contextMenus.create({
    title: "Send Page Url to Memos",
    id: 'memos-page-context-menu',
    contexts:["page"],
  });
});

chrome.commands.onCommand.addListener((command) => {
  if(command === "memos-selection" || command === "memos-page") {
    SendItCommand(command);
  }
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId == "memos-selection-context-menu") {
    SendIt(info);
  }
  if (info.menuItemId == "memos-page-context-menu") {
    SendIt(info);
  }
});



chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const localSettings: ExtensionLocalSettings = await getLocalSettings(
    chrome.storage.local
  );
  const url = tab.url;

  if (
    !localSettings ||
    !localSettings.apiKey ||
    !url ||
    changeInfo.status !== "loading"
  ) {
    return;
  }

  try {
    const mentions = await getUrlMentions(
      localSettings.apiKey,
      localSettings.insecureMode || false,
      url
    );

    if (mentions.direct.length > 0) {
      chrome.action.setBadgeBackgroundColor({
        color: "#A68B36",
        tabId,
      });
      chrome.action.setBadgeText({
        text: `${mentions.direct.length}`,
        tabId,
      });
    } else if (mentions.mentions.length > 0) {
      chrome.action.setBadgeBackgroundColor({
        color: "#3D7D98",
        tabId,
      });
      chrome.action.setBadgeText({
        text: `${mentions.mentions.length}`,
        tabId,
      });
    } else {
      chrome.action.setBadgeText({
        text: "",
        tabId,
      });
    }

    for (const mention of mentions.direct) {
      const mentionData = await obsidianRequest(
        localSettings.apiKey,
        `/vault/${mention.filename}`,
        {
          method: "get",
          headers: {
            Accept: "application/vnd.olrapi.note+json",
          },
        },
        localSettings.insecureMode || false
      );
      const result = await mentionData.json();

      if (result.frontmatter["web-badge-color"]) {
        chrome.action.setBadgeBackgroundColor({
          color: result.frontmatter["web-badge-color"],
          tabId,
        });
      }
      if (result.frontmatter["web-badge-message"]) {
        chrome.action.setBadgeText({
          text: result.frontmatter["web-badge-message"],
          tabId,
        });
      }
    }
  } catch (e) {
    chrome.action.setBadgeText({
      text: "ERR",
    });
    console.error(e);
  }
});
//
// // Add bubble to the top of the page.
// var bubbleDOM = document.createElement('div');
// bubbleDOM.setAttribute('class', 'selection_bubble');
// document.body.appendChild(bubbleDOM);
//
// // Lets listen to mouseup DOM events.
// document.addEventListener('mouseup', function (e) {
//   var selection = window.getSelection()?.toString();
//   if(selection === undefined){
//     return;
//   }
//   if (selection.length > 0) {
//     renderBubble(e.clientX, e.clientY, selection);
//   }
// }, false);
//
//
// // Close the bubble when we click on the screen.
// document.addEventListener('mousedown', function (e) {
//   bubbleDOM.style.visibility = 'hidden';
// }, false);
//
// // Move that bubble to the appropriate location.
// function renderBubble(mouseX: string | number, mouseY: string | number, selection: string) {
//   bubbleDOM.innerHTML = selection;
//   bubbleDOM.style.top = mouseY + 'px';
//   bubbleDOM.style.left = mouseX + 'px';
//   bubbleDOM.style.visibility = 'visible';
// }
