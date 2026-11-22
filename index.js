/**
 * Your notes, as a sandbox integration: one ES module with no imports. Every export the manifest names is a handler
 * `(input, host) => answer`. Its only way out is `host.fetch`, which reaches only the hosts listed in manifest.json and
 * fills `${secret.…}` holes itself, so this file never holds a token.
 *
 * A thrown error with an HTTP `status` becomes the protocol's error (401 signed out; 403, 404 and 422 refused; 429
 * slowed down; anything else failed), and its message is what a person reads.
 */
const API = 'https://notes.your-tool.example/api';
const AUTH = { Authorization: 'Bearer ${secret.api_token}' };

class ToolError extends Error {
  constructor(message, status) { super(message); this.name = 'ToolError'; this.status = status; }
}

/** One call to your tool, failing with words a person can act on. */
async function call(host, path, init = {}) {
  const res = await host.fetch(`${API}${path}`, { method: init.method ?? 'GET', headers: AUTH, json: init.json });
  if (res.status >= 200 && res.status < 300) return res.json;
  if (res.status === 401) throw new ToolError('Your tool no longer accepts this token; connect it again.', 401);
  if (res.status === 404) throw new ToolError('That page is gone, or this token cannot reach it.', 404);
  throw new ToolError(`Your tool answered ${res.status}.`, res.status);
}

/** `connection.verify`: who the token belongs to, shown as "Connected as …". */
export async function whoAmI(_input, host) {
  const me = await call(host, '/me');
  return { account: me.name ?? me.email ?? 'Your tool account' };
}

/** `lookup` "pages": the pages an entry can go on, filtered by what was typed. */
export async function pages(input, host) {
  const rows = await call(host, '/pages');
  const q = (input.query ?? '').toLowerCase();
  return { items: rows.map((p) => ({ value: p.slug, label: p.title })).filter((p) => !q || p.label.toLowerCase().includes(q)), next: null };
}

/** `send.file` "entry": the capture as an entry on the chosen page. The marker lets `findEntry` spot a retry. */
export async function addEntry(input, host) {
  const item = input.report.items[0];
  const picture = item?.attachments?.find((a) => a.role === 'crop')?.url ?? null;
  const made = await call(host, `/pages/${encodeURIComponent(input.target.id)}/entries`, {
    method: 'POST',
    json: { title: input.values.title, body: input.markdown, picture, marker: input.marker },
  });
  return { outcome: 'entry', target: input.target.id, ref: { scheme: 'id', id: made.id }, url: made.url };
}

/** `send.find`: an entry an earlier try already made, found by its marker, so a retry never adds it twice. */
export async function findEntry(input, host) {
  const rows = await call(host, `/pages/${encodeURIComponent(input.target.id)}/entries?marker=${encodeURIComponent(input.marker)}`);
  const hit = rows.find((e) => e.marker === input.marker);
  return hit ? { found: true, outcome: 'entry', target: input.target.id, ref: { scheme: 'id', id: hit.id }, url: hit.url } : { found: false };
}
