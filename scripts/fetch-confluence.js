import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import TurndownService from "turndown";

dotenv.config();

const BASE_URL = process.env.CONFLUENCE_BASE_URL;
const API_TOKEN = process.env.SOUTIK_API_TOKEN;
const EMAIL = process.env.CONFLUENCE_EMAIL;

// ===== CONFIG =====
const PAGE_ID = "1368064062"; // change if needed
const OUTPUT_FILE = "./confluence-page.md";

// ===== VALIDATION =====
if (!BASE_URL || !API_TOKEN || !EMAIL) {
  console.error("Missing required environment variables.");
  process.exit(1);
}

// ===== AUTH SETUP =====
const auth = Buffer.from(`${EMAIL}:${API_TOKEN}`).toString("base64");

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Basic ${auth}`,
    Accept: "application/json",
  },
});

// ===== MARKDOWN CONVERTER =====
const turndownService = new TurndownService();

// ===== MAIN FUNCTION =====
async function fetchAndSavePage(pageId) {
  try {
    console.log("Fetching page...");

    const response = await client.get(`/rest/api/content/${pageId}`, {
      params: {
        expand: "body.storage,version,title",
      },
    });

    const page = response.data;

    const title = page.title;
    const version = page.version.number;
    const htmlContent = page.body.storage.value;

    console.log(`Fetched: ${title} (v${version})`);

    // Convert HTML → Markdown
    const markdownContent = turndownService.turndown(htmlContent);

    const finalContent = `# ${title}

Version: ${version}

---

${markdownContent}
`;

    // Save to file
    fs.writeFileSync(OUTPUT_FILE, finalContent);

    console.log(`Saved to ${OUTPUT_FILE}`);
  } catch (error) {
    console.error("Error fetching page:");
    console.error(error.response?.data || error.message);
  }
}

// ===== RUN =====
fetchAndSavePage(PAGE_ID);
