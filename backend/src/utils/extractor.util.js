import axios from 'axios';
import * as cheerio from 'cheerio';

const detectContentType = (url) => {
  if (!url) return "note";
  const normalized = url.toLowerCase();
  if (normalized.includes("youtube.com") || normalized.includes("youtu.be")) return "youtube";
  if (normalized.includes("twitter.com") || normalized.includes("x.com")) return "tweet";
  if (normalized.split('?')[0].endsWith(".pdf")) return "pdf";
  if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(normalized)) return "image";
  return "article";
};

const extractFromUrl = async (url) => {
  const type = detectContentType(url);

  if (type === 'youtube') {
    return await extractYoutube(url);
  }

  if (type === 'pdf') {
    try {
      const filename = url.split('/').pop().split('?')[0].replace(/%20/g, ' ').replace(/-/g, ' ').replace(/_/g, ' ').replace('.pdf', '');
      return { 
        title: filename.charAt(0).toUpperCase() + filename.slice(1), 
        siteName: "PDF Document",
        rawText: `This is a PDF document located at ${url}.` 
      };
    } catch { return { title: "PDF Document", siteName: "PDF" }; }
  }

  try {
    const { data } = await axios.get(url, {
      timeout: 10000,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ToughtNet/1.0)" },
    });
    const $ = cheerio.load(data);
    $("script, style, nav, footer, header, iframe").remove();
    const title = $("meta[property=\"og:title\"]").attr("content") || $("title").text() || "";
    const description = $("meta[property=\"og:description\"]").attr("content") || $("meta[name=\"description\"]").attr("content") || "";
    const thumbnail = $("meta[property=\"og:image\"]").attr("content") || "";
    const siteName = $("meta[property=\"og:site_name\"]").attr("content") || "";
    const author = $("meta[name=\"author\"]").attr("content") || $("meta[property=\"article:author\"]").attr("content") || "";
    let favicon = $("link[rel=\"icon\"]").attr("href") || $("link[rel=\"shortcut icon\"]").attr("href") || "";
    try {
      const base = new URL(url);
      if (favicon && !favicon.startsWith("http")) favicon = favicon.startsWith("/") ? `${base.origin}${favicon}` : `${base.origin}/${favicon}`;
      if (!favicon) favicon = `${base.origin}/favicon.ico`;
    } catch {}
    const rawText = $("article, main, .content, .post-body, body").first().text().replace(/\s+/g, " ").trim().slice(0, 8000);
    return { title: title.trim(), description: description.trim(), thumbnail, siteName, author, favicon, rawText };
  } catch (err) {
    console.error("Extraction error:", err.message);
    const fallbackTitle = url.split('/').pop().split('?')[0] || "Web Article";
    return { title: fallbackTitle };
  }
};

const extractYoutube = async (url) => {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  const videoId = match ? match[1] : null;
  
  const result = {
    videoId,
    thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null,
    embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : null,
    title: "YouTube Video",
    siteName: "YouTube"
  };

  if (videoId) {
    try {
      const { data } = await axios.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (data) {
        result.title = data.title;
        result.author = data.author_name;
        result.thumbnail = data.thumbnail_url || result.thumbnail;
      }
    } catch (err) {
      console.error("YouTube oembed error:", err.message);
    }
  }
  return result;
};

export { extractFromUrl, extractYoutube, detectContentType };
