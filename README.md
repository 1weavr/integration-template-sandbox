# Sandbox integration template

Adds a capture as an entry on a page in your tool. The logic is one ES module, `index.js`, with no imports, which
1weavr runs isolated. Each call below is answered by the export the manifest names.

## The calls it answers

| Call | Export in `index.js` | Input | Output | Limit |
|---|---|---|---|---|
| `connection.verify` | `whoAmI` | nothing | `{ account }`, shown as "Connected as …" | 10 s, no retry |
| `lookup` (`pages`) | `pages` | `{ lookup, query, cursor, values }` | `{ items: [{ value, label }], next }` | 5 s, no retry |
| `send.file` | `addEntry` | `{ target, report, markdown, outcome, values, marker }` | `{ outcome: "entry", target, ref: { scheme: "id", id }, url }` | 120 s, never retried |
| `send.find` | `findEntry` | `{ target, marker, outcome, since }` | `{ found: true, outcome, target, ref, url }` or `{ found: false }` | 120 s, no retry |

Each export is `(input, host) => output`. `host.fetch(url, { method, headers, json })` is the only I/O: it reaches only
the `hosts` in `manifest.json` and fills `${secret.api_token}` itself, so the token never enters your code. Throw an
`Error` with an HTTP `status` to answer an error: 401 becomes `unauthenticated`; 403, 404 and 422 become `refused`;
429 becomes `rate_limited`; anything else becomes `failed`.

Every call carries `protocol`, `call`, a unique `delivery` id, the `integration`, the `installation` and its
`input`. The answer repeats `call` and `delivery` and is either `{ ok: true, output, effects? }` or
`{ ok: false, error: { code, message } }`, where `code` is `refused`, `failed`, `unauthenticated` or `rate_limited` and
`message` is shown to people as written. An answer that does not match its call's shape is refused and logged.

## What is in it

```
manifest.json   what it is, the hosts it may call, how people connect it, and which export answers each call
index.js        the handlers: each export is (input, host) => answer
icon.svg        its icon in the catalogue (square, flat colour)
fixtures/       test cases: a call, what goes in, the replies your tool gives, and the answer it must give
```

`index.js` has no imports. Its only way out is `host.fetch`, which reaches only the hosts `manifest.json` lists and
fills `${secret.api_token}` itself, so the file never holds a token.

## Make it yours

1. Press **Use this template** and make your own repository.
2. In `manifest.json`, change `id`, `name`, `summary`, `description` and `links`, and replace `your-tool.example`
   with your tool's real host everywhere, including `index.js` and the test cases.
3. Write a handler for each export the manifest names, and add a test case to `fixtures/` for each call.
4. Before it can be listed publicly, `links.privacy`, `links.terms` and a description of 200 characters or more
   are required.

The full guide, with the manifest, test cases and publishing: https://1weavr.com/docs/build-an-integration

## Questions

Email support@1weavr.com, or open an issue on this repository.

## Licence

MIT: copy it, change it and ship it as your own. See `LICENSE`.
