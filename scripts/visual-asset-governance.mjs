const VISUAL_REFERENCE_KEYS = new Set(["assetId", "publicAssetId", "beforeAssetId", "shippedAssetId"]);

export function deriveRuntimeVisualSlots(content) {
  const slots = [];
  function visit(value, projectId, location = []) {
    if (Array.isArray(value)) {
      value.forEach((entry, index) => visit(entry, projectId, [...location, index]));
      return;
    }
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      const next = [...location, key];
      if (VISUAL_REFERENCE_KEYS.has(key) && typeof child === "string") {
        slots.push({ projectId, slotId: next.join("."), assetId: child });
      } else if (key !== "sourceArchives") {
        visit(child, projectId, next);
      }
    }
  }
  for (const [projectId, project] of Object.entries(content.projects || {})) {
    visit(project, projectId);
  }
  return slots;
}

function requireSitePath(publicPath, label) {
  if (typeof publicPath !== "string" || !publicPath.startsWith("/site/")) {
    throw new Error(`${label} must resolve through an allowed /site/ public path`);
  }
}

export function validateRuntimeVisualAssets({ slots, assetManifest, publicAssetExists = () => true }) {
  if (!Array.isArray(slots)) throw new Error("Runtime visual slots must be an array");
  const items = assetManifest?.items;
  if (!items || typeof items !== "object" || Array.isArray(items)) {
    throw new Error("Asset Manifest items must be an object");
  }

  const slotOwners = new Set();
  const activePublicPaths = new Map();
  for (const slot of slots) {
    const projectId = typeof slot?.projectId === "string" ? slot.projectId.trim() : "";
    const slotId = typeof slot?.slotId === "string" ? slot.slotId.trim() : "";
    const assetId = typeof slot?.assetId === "string" ? slot.assetId.trim() : "";
    if (!projectId || !slotId || !assetId) {
      throw new Error("Derived visual slot must define projectId, slotId and assetId");
    }

    const slotOwner = `${projectId}/${slotId}`;
    if (slotOwners.has(slotOwner)) throw new Error(`Duplicate active visual slot: ${slotOwner}`);
    slotOwners.add(slotOwner);

    const record = items[assetId];
    if (!record) throw new Error(`Derived visual slot references an unknown asset: ${slotOwner} -> ${assetId}`);
    if (record.id !== assetId) throw new Error(`Asset Manifest identity mismatch: ${assetId}`);
    if (record.publicBuild !== true) throw new Error(`Runtime asset is not approved for public build: ${assetId}`);

    let resolvedPath;
    if (record.assetStatus === "production") {
      requireSitePath(record.publicPath, `Production asset ${assetId}`);
      resolvedPath = record.publicPath;
      const previous = activePublicPaths.get(resolvedPath);
      if (previous && previous !== assetId) {
        throw new Error(`Duplicate active semantic asset path: ${previous}, ${assetId}`);
      }
      activePublicPaths.set(resolvedPath, assetId);
    } else {
      const fallbackId = typeof record.placeholderFallbackAssetId === "string"
        ? record.placeholderFallbackAssetId.trim()
        : "";
      const fallback = fallbackId ? items[fallbackId] : null;
      if (!fallback) throw new Error(`Non-production runtime asset has no approved fallback: ${assetId}`);
      requireSitePath(fallback.publicPath, `Fallback asset ${fallbackId}`);
      resolvedPath = fallback.publicPath;
    }

    if (!publicAssetExists(resolvedPath)) {
      throw new Error(`Resolved runtime asset file is missing: ${assetId} -> ${resolvedPath}`);
    }
  }
  return { slotCount: slots.length, uniqueAssetCount: new Set(slots.map((slot) => slot.assetId)).size };
}
