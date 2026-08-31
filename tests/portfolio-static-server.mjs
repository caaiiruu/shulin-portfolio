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
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

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
  response.writeHead(200, {
    "cache-control": "no-store",
    "content-type": types[path.extname(file)] || "application/octet-stream",
  });
  fs.createReadStream(file).pipe(response);
}).listen(3000, "127.0.0.1", () => {
  console.log("Portfolio QA server ready at http://127.0.0.1:3000");
});
