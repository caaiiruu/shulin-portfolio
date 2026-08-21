/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    // Project routes use generated initial documents from the canonical SSOT.
    // The shared client renderer then enhances the same identity into the dialog.
    const projectMatch = url.pathname.match(/^\/site\/work\/([^/]+)\/?$/);
    if (projectMatch) {
      const projectDocumentUrl = new URL(`/site/work/${projectMatch[1]}.html`, request.url);
      const projectResponse = await env.ASSETS.fetch(new Request(projectDocumentUrl, {
        method: "GET",
        headers: request.headers,
      }));
      if (projectResponse.ok) {
        const routedResponse = new Response(projectResponse.body, projectResponse);
        routedResponse.headers.set("Content-Location", `/site/work/${projectMatch[1]}.html`);
        return routedResponse;
      }
    }

    // Preserve the existing two-segment programme/stage route contract. These
    // pages are enhanced from the shared work shell rather than canonical
    // top-level project documents.
    if (/^\/site\/work\/[^/]+\/[^/]+\/?$/.test(url.pathname)) {
      const workShellUrl = new URL("/site/work.html", request.url);
      const workShellResponse = await env.ASSETS.fetch(new Request(workShellUrl, {
        method: "GET",
        headers: request.headers,
      }));
      if (workShellResponse.ok) {
        const routedResponse = new Response(workShellResponse.body, workShellResponse);
        routedResponse.headers.set("Content-Location", "/site/work.html");
        return routedResponse;
      }
    }

    const response = await handler.fetch(request, env, ctx);
    const secured = new Response(response.body, response);
    secured.headers.set("Content-Security-Policy", "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' mailto:; img-src 'self' data: blob:; media-src 'self' blob:; style-src 'self'; script-src 'self'; frame-src https://www.figma.com; connect-src 'self'; font-src 'self'; upgrade-insecure-requests");
    secured.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    secured.headers.set("X-Content-Type-Options", "nosniff");
    secured.headers.set("X-Frame-Options", "DENY");
    secured.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    secured.headers.set("Cross-Origin-Resource-Policy", "same-origin");
    secured.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    secured.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()");
    return secured;
  },
};

export default worker;
