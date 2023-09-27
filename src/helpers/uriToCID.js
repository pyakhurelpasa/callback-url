// Extracts CID from specific URI format

export function uriToCID(url) {
  const matches = url.match(/\/([a-z0-9]+)\./i);
  return matches ? matches[1] : null;
}
