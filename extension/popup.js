const API_KEY = "apiUrl";

document.addEventListener("DOMContentLoaded", async () => {
  const stored = await chrome.storage.local.get([API_KEY]);
  document.getElementById("apiUrl").value = stored[API_KEY] || "http://localhost:5000";

  let currentTabTitle = "";
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const url = tab.url || "";
    currentTabTitle = tab.title || "Untitled Knowledge";
    document.getElementById("pageTitle").textContent = currentTabTitle;
    if (url.includes("youtube.com") || url.includes("youtu.be")) document.getElementById("type").value = "youtube";
    else if (url.includes("twitter.com") || url.includes("x.com")) document.getElementById("type").value = "tweet";
  });

    document.getElementById("saveBtn").addEventListener("click", async () => {
    let apiUrl = document.getElementById("apiUrl").value.trim();
    if (apiUrl.endsWith("/")) apiUrl = apiUrl.slice(0, -1);
    
    const title = currentTabTitle;
    const type = document.getElementById("type").value;
    const description = document.getElementById("description").value.trim();
    const status = document.getElementById("status");

    if (!title) { status.className = "status error"; status.textContent = "Could not fetch page title"; return; }

    await chrome.storage.local.set({ [API_KEY]: apiUrl });
    document.getElementById("saveBtn").disabled = true;
    document.getElementById("saveBtn").textContent = "Saving...";
    status.textContent = "";

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const currentTabUrl = tabs[0].url;
      try {
        const headers = { "Content-Type": "application/json" };
        
        // 1. Try to get token from Backend Cookie
        try {
          const urlObj = new URL(apiUrl);
          const cookie = await chrome.cookies.get({ url: urlObj.origin, name: "jwt" });
          if (cookie) headers["Authorization"] = `Bearer ${cookie.value}`;
        } catch (e) {}

        // 2. Fallback: Try to get token from open ThoughtNet tabs (localStorage)
        if (!headers["Authorization"]) {
          try {
            const allTabs = await chrome.tabs.query({});
            const feTab = allTabs.find(t => t.url.includes("thoughtnet") || t.url.includes("vercel.app"));
            if (feTab) {
              const res = await chrome.scripting.executeScript({
                target: { tabId: feTab.id },
                func: () => localStorage.getItem('thoughtnet_token'),
              });
              const token = res[0].result;
              if (token) headers["Authorization"] = `Bearer ${token}`;
            }
          } catch (e) {}
        }

        const res = await fetch(`${apiUrl}/api/content`, {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({ title, type, url: currentTabUrl, description }),
        });
        const data = await res.json();
        if (data.success) {
          status.className = "status";
          status.textContent = "Saved! AI processing started...";
          setTimeout(() => window.close(), 1500);
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        status.className = "status error";
        status.textContent = err.message || "Failed to save";
        document.getElementById("saveBtn").disabled = false;
        document.getElementById("saveBtn").textContent = "Save to ToughtNet";
      }
    });
  });
});
