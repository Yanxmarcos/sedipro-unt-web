export function normalizeResourceText(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// A visual variant is one gallery entry; export formats remain download choices.
export function resourceGalleryEntries(catalog) {
  return catalog.assets.flatMap((asset) =>
    asset.variants.map((variant) => ({
      id: `${asset.id}:${variant.id}`,
      asset,
      variant,
      label: `${asset.name} · ${variant.name}`,
      searchText: normalizeResourceText(
        `${asset.name} ${asset.tags.join(" ")} ${variant.name}`,
      ),
    })),
  );
}

export function filterResourceEntries(entries, category, query) {
  const terms = normalizeResourceText(query.trim())
    .split(/\s+/)
    .filter(Boolean);
  return entries.filter(
    (entry) =>
      (category === "todos" || entry.asset.category === category) &&
      terms.every((term) => entry.searchText.includes(term)),
  );
}
