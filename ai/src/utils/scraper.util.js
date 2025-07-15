import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import * as cheerio from "cheerio";
import cron from "node-cron";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
puppeteer.use(StealthPlugin());

const ALL_SITES = {
  "iefa.org": "https://www.iefa.org/scholarships",
  "daad.de": "https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/",
  "mastersportal.com": "https://www.mastersportal.com/search/scholarships/master",
  "scholarshipowl-nursing": "https://scholarshipowl.com/scholarship-list/by-major/nursing-scholarships",
  "scholarshipowl-merit": "https://scholarshipowl.com/scholarship-list/by-type/merit-based-scholarships",
  "fastweb.com": "https://www.fastweb.com/college-scholarships/scholarships"
};

let browser;

async function getBrowser() {
  if (browser) return browser;
  browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  return browser;
}

async function getHTML(url) {
  const b = await getBrowser();
  const page = await b.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36");
  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 35000 });
    const html = await page.content();
    await page.close();
    return html;
  } catch {
    await page.close();
    return null;
  }
}

/* ================= SMART SUBJECT SCORING ================= */
function detectSubjectSmart(title = "", description = "") {
  const t = title.toLowerCase();
  const d = description.toLowerCase();
  const categories = [
    { name: "Medical & Health", keywords: [/medical/g, /health/g, /nursing/g, /nurse/g, /pharmacy/g, /mbbs/g] },
    { name: "Business", keywords: [/business/g, /mba/g, /management/g, /finance/g, /economics/g, /marketing/g] },
    { name: "Information Technology (IT)", keywords: [/computer science/g, /software/g, /programming/g, /coding/g, /\bai\b/g, /\bit\b/g, /data science/g] },
    { name: "Engineering", keywords: [/engineering/g, /mechanical/g, /electrical/g, /civil/g, /robotics/g, /\bstem\b/g] },
    { name: "Science", keywords: [/biology/g, /chemistry/g, /physics/g, /math/g, /science/g] },
    { name: "Law", keywords: [/\blaw\b/g, /legal/g, /justice/g] },
    { name: "Arts & Humanities", keywords: [/design/g, /fashion/g, /music/g, /media/g, /film/g, /arts/g] }
  ];

  let scores = categories.map(cat => {
    let score = 0;
    cat.keywords.forEach(regex => {
      score += ((t.match(regex) || []).length * 25) + ((d.match(regex) || []).length * 2);
    });
    return { name: cat.name, score };
  });

  const winner = scores.sort((a, b) => b.score - a.score)[0];
  return winner.score >= 15 ? winner.name : "General";
}

/* ================= 🛠️ IMPROVED DEADLINE EXTRACTION ================= */
function extractDeadlineSmart(text) {
  // 1. Look for specific deadline labels first
  const labelMatch = text.match(/(?:Deadline|Expires|Ends|Due on)[:\s]+([^\n.]{5,30})/i);
  if (labelMatch && labelMatch[1]) {
    return labelMatch[1].trim();
  }

  // 2. Flexible Date Regex (Handles: "Oct 15", "October 15, 2025", "15/12/2025", etc.)
  const dateRegex = /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s\d{1,2}(?:st|nd|rd|th)?(?:,?\s\d{4})?|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/gi;
  
  const matches = text.match(dateRegex);
  if (matches) {
    // Return the first valid date found, prioritizing dates with years
    const withYear = matches.find(d => d.match(/\d{4}/));
    return withYear || matches[0];
  }

  return "Check Website";
}

/* ================= EXTRACTION HELPERS ================= */
function extractAmountSmart(text) {
  const moneyRegex = /((?:\$|€|£|USD|EUR)\s?\d{1,3}(?:[.,]\d{3})*(?:\.\d{2})?)|(Full\sTuition|Full\sFunding|Fully\sFunded)/i;
  const match = text.match(moneyRegex);
  return match ? match[0] : null;
}

/* ================= ENRICH ================= */
async function enrich(s) {
  const html = await getHTML(s.detailUrl);
  if (!html) return null;

  const $ = cheerio.load(html);
  
  // Target description areas
  let description = "";
  if (s.provider === "iefa.org") {
    description = $(".scholarship-description").text().trim() || $(".award-description").text().trim();
  } else if (s.provider === "daad.de") {
    description = $(".detail-content").text().trim();
  }

  if (!description || description.length < 50) {
    $("nav, footer, header, script, style, .cookie-banner, noscript").remove();
    description = $("p").map((_, el) => $(el).text().trim()).get().filter(t => t.length > 100).slice(0, 3).join(" ");
  }

  const bodyText = $("body").text().replace(/\s+/g, ' ');
  
  // Clean description
  description = description.replace(/\s+/g, ' ').replace(/featured|sponsor:|got it!|cookie consent/gi, "").trim();

  // Smart Deadline logic
  let deadline = extractDeadlineSmart(bodyText);
  // Special check for IEFA "Submission Deadline" label
  if (deadline === "Check Website") {
     const iefaDeadline = $("li:contains('Submission Deadline')").text() || $("div:contains('Deadline')").text();
     if (iefaDeadline) deadline = iefaDeadline.replace(/Submission Deadline/gi, "").trim();
  }

  const amount = extractAmountSmart(bodyText) || extractAmountSmart(s.title);

  if (description.length < 20 && !amount) return null;

  return {
    scholarshipId: Math.random().toString(36).substr(2, 9),
    title: s.title.split('|')[0].split('-')[0].trim(),
    provider: s.provider,
    subject: detectSubjectSmart(s.title, bodyText),
    detailUrl: s.detailUrl,
    description: description.length > 500 ? description.substring(0, 500) + "..." : description,
    amount: amount || "Varies",
    deadline: deadline.length > 30 ? deadline.substring(0, 30) : deadline
  };
}

/* ================= MAIN LOGIC ================= */
export async function scrapeAllScholarships() {
  console.log("🚀 Starting Smart Scrape with Improved Deadline Detection...");
  let allLinks = [];

  for (const [name, url] of Object.entries(ALL_SITES)) {
    const html = await getHTML(url);
    if (!html) continue;
    const $ = cheerio.load(html);
    
    $("a").each((_, el) => {
      const title = $(el).text().trim();
      const href = $(el).attr("href");
      if (!title || !href || title.length < 15) return;
      if (/login|register|about|faq|privacy|winners/i.test(title)) return;
      
      allLinks.push({
        title,
        provider: name,
        detailUrl: href.startsWith("http") ? href : new URL(href, url).href
      });
    });
  }

  const uniqueLinks = allLinks.filter((v, i, a) => a.findIndex(t => t.detailUrl === v.detailUrl) === i);
  const results = [];

  for (const link of uniqueLinks.slice(0, 40)) {
    console.log(`   🔍 Analyzing: ${link.title}`);
    const item = await enrich(link);
    if (item) results.push(item);
  }

  return results;
}

export function initAutomation() {
    cron.schedule("0 0 1 * *", async () => {
        try {
            const results = await scrapeAllScholarships();
            const DB_URL = process.env.BACKEND_BULK_API;
            if (results.length > 0 && DB_URL) {
                await axios.post(DB_URL, { scholarships: results });
            }
        } catch (err) { console.error(err); }
    });
}