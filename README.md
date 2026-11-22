# Sandbox integration template

A 1weavr integration as **one JavaScript file** that 1weavr runs for you, isolated. Pick it when you need logic
between calls that a manifest cannot express.

This one adds a capture as an entry on a page in your tool, and looks for an earlier entry first so a retry never adds
it twice.

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
