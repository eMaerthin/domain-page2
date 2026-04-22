import { mkdir, writeFile, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

type SearchResult = { title: string; imageUrl: string; pageUrl: string; ext: string; source: string };

type ManifestEntry = {
  query: string;
  file: string;
  title: string;
  pageUrl: string;
  imageUrl: string;
  source: string;
};

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const UNSPLASH_API = "https://api.unsplash.com/search/photos";
const DEFAULT_MANIFEST = resolve(process.cwd(), "public", "assets", "personality", "manifest.json");

function unsplashKey() {
  return process.env.UNSPLASH_ACCESS_KEY ?? "";
}

function flattenUploadUrl(url: string) {
  const marker = "/wikipedia/commons/";
  const idx = url.indexOf(marker);
  return idx >= 0 ? `https://upload.wikimedia.org/${url.slice(idx)}` : url;
}

function resolveArgs() {
  const [query, outputPathArg, manifestArg] = process.argv.slice(2);
  if (!query || !outputPathArg) {
    throw new Error('Usage: node scripts/download_commons_assets.ts "query" "output/path.jpg" [manifest.json]');
  }
  return {
    query,
    outputPath: resolve(outputPathArg),
    manifestPath: manifestArg ? resolve(manifestArg) : DEFAULT_MANIFEST,
  };
}

function extFromUrl(imageUrl: string) {
  if (imageUrl.includes(".png")) return ".png";
  if (imageUrl.includes(".webp")) return ".webp";
  if (imageUrl.includes(".jpg") || imageUrl.includes(".jpeg")) return ".jpg";
  return ".bin";
}

async function commonsSearch(query: string): Promise<SearchResult[]> {
  const url = new URL(COMMONS_API);
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrlimit", "50");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Commons search failed for: ${query}`);
  const json = (await res.json()) as any;
  const pages = json?.query?.pages ?? {};
  return Object.values(pages)
    .map((page: any) => {
      const ii = page.imageinfo?.[0];
      const imageUrl = ii?.url ?? "";
      return { title: page.title, imageUrl, pageUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title ?? "")}`, ext: extFromUrl(imageUrl), source: "commons" } as SearchResult;
    })
    .filter((item: SearchResult) => Boolean(item.imageUrl));
}

async function unsplashSearch(query: string): Promise<SearchResult[]> {
  const key = unsplashKey();
  if (!key) return [];
  const url = new URL(UNSPLASH_API);
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "10");
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Client-ID ${key}` },
  });
  if (!res.ok) throw new Error(`Unsplash search failed for: ${query}`);
  const json = (await res.json()) as any;
  const results = json?.results ?? [];
  return results
    .map((photo: any) => ({
      title: photo?.alt_description ?? photo?.description ?? query,
      imageUrl: photo?.urls?.raw ?? photo?.urls?.full ?? photo?.urls?.regular ?? "",
      pageUrl: photo?.links?.html ?? "",
      ext: ".jpg",
      source: "unsplash",
    }))
    .filter((item: SearchResult) => Boolean(item.imageUrl));
}

async function download(url: string, filePath: string) {
  const uploadUrl = flattenUploadUrl(url);
  const candidates = [
    uploadUrl,
    uploadUrl.replace("https://upload.wikimedia.org/", "https://commons.wikimedia.org/w/index.php?title=Special:FilePath/"),
    uploadUrl.replace("https://upload.wikimedia.org/", "https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/"),
    uploadUrl.replace("https://upload.wikimedia.org/", "https://commons.wikimedia.org/wiki/Special:FilePath/"),
    uploadUrl.replace("https://upload.wikimedia.org/", "https://commons.wikimedia.org/wiki/Special:Redirect/file/"),
  ];

  let lastError: unknown;
  for (const candidateUrl of candidates) {
    try {
      const res = await fetch(candidateUrl);
      if (!res.ok) throw new Error(`Download failed: ${candidateUrl}`);
      const arrayBuffer = await res.arrayBuffer();
      await writeFile(filePath, Buffer.from(arrayBuffer));
      return candidateUrl;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`Download failed: ${url}`);
}

async function searchSources(query: string): Promise<SearchResult[]> {
  const commons = await commonsSearch(query).catch(() => [] as SearchResult[]);
  if (commons.length) return commons;
  return unsplashSearch(query).catch(() => [] as SearchResult[]);
}

async function loadManifest(manifestPath: string): Promise<Record<string, ManifestEntry>> {
  try {
    const raw = await readFile(manifestPath, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, ManifestEntry>) : {};
  } catch {
    return {};
  }
}

async function main() {
  const { query, outputPath, manifestPath } = resolveArgs();
  await mkdir(dirname(outputPath), { recursive: true });

  const results = await searchSources(query);
  if (!results.length) throw new Error(`No image result for: ${query}`);

  let lastError: unknown;
  for (const candidate of results) {
    try {
      const usedUrl = await download(candidate.imageUrl, outputPath);
      const manifest = await loadManifest(manifestPath);
      const key = outputPath.split("/").pop()?.replace(/\.[^.]+$/, "") ?? query;
      manifest[key] = {
        query,
        file: outputPath,
        title: candidate.title,
        pageUrl: candidate.pageUrl,
        imageUrl: usedUrl,
        source: candidate.source,
      };
      await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
      console.log(`Saved ${outputPath}`);
      return;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`Download failed for: ${query}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
