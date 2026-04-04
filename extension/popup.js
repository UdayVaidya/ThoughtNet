const API_KEY = "apiUrl";

document.addEventListener("DOMContentLoaded", async () => {
  const stored = await chrome.storage.local.get([API_KEY]);
  document.getElementById("apiUrl").value = stored[API_KEY] || "http://localhost:5000";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const url = tab.url || "";
    document.getElementById("title").value = tab.title || "";
    if (url.includes("youtube.com") || url.includes("youtu.be")) document.getElementById("type").value = "youtube";
    else if (url.includes("twitter.com") || url.includes("x.com")) document.getElementById("type").value = "tweet";
  });

  document.getElementById("saveBtn").addEventListener("click", async () => {
    const apiUrl = document.getElementById("apiUrl").value.trim();
    const title = document.getElementById("title").value.trim();
    const type = document.getElementById("type").value;
    const description = document.getElementById("description").value.trim();
    const status = document.getElementById("status");

    if (!title) { status.className = "status error"; status.textContent = "Title is required"; return; }

    await chrome.storage.local.set({ [API_KEY]: apiUrl });
    document.getElementById("saveBtn").disabled = true;
    document.getElementById("saveBtn").textContent = "Saving...";
    status.textContent = "";

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const url = tabs[0].url;
      try {
        const res = await fetch(`${apiUrl}/api/content`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, type, url, description }),
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
