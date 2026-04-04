import axios from 'axios';
import * as cheerio from 'cheerio';

const extractFromUrl = async (url) => {
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
    return {};
  }
};

const extractYoutube = (url) => {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  const videoId = match ? match[1] : null;
  return {
    videoId,
    thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null,
    embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : null,
  };
};

const detectContentType = (url) => {
  if (!url) return "note";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("twitter.com") || url.includes("x.com")) return "tweet";
  if (url.endsWith(".pdf")) return "pdf";
  if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)) return "image";
  return "article";
};

export { extractFromUrl, extractYoutube, detectContentType };
