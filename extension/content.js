// Content script - runs on every page
// Can be extended to extract selected text, highlights, etc.
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg.type === "GET_SELECTION") {
    reply({ text: window.getSelection().toString() });
  }
});
