import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.resolve("public");
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

const port=Number(process.env.PORT||3000);
http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  let file = path.resolve(root, `.${pathname}`);
  if (file.startsWith(root) && (!fs.existsSync(file) || fs.statSync(file).isDirectory())) {
    const htmlFile = `${file}.html`;
    if (htmlFile.startsWith(root) && fs.existsSync(htmlFile)) file = htmlFile;
  }
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(root, "site", "index.html");
  }
  const size = fs.statSync(file).size;
  const range = request.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
  if (range) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    response.writeHead(206, {
      "accept-ranges": "bytes",
      "cache-control": "no-store",
      "content-length": end - start + 1,
      "content-range": `bytes ${start}-${end}/${size}`,
      "content-type": types[path.extname(file)] || "application/octet-stream",
    });
    fs.createReadStream(file, { start, end }).pipe(response);
    return;
  }
  response.writeHead(200, {
    "accept-ranges": "bytes",
    "cache-control": "no-store",
    "content-length": size,
    "content-type": types[path.extname(file)] || "application/octet-stream",
  });
  fs.createReadStream(file).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Portfolio QA server ready at http://127.0.0.1:${port}`);
});
