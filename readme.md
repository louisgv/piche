# piche

> UwU A localtunnel based pipe tool to share text quickly from terminal. Created with [create-pastel-app](https://github.com/vadimdemedes/create-pastel-app), inspired by
[fiche](https://github.com/solusipse/fiche).

Made in roughly 9 hours with the help of the following awesome libraries:

- [clipboardy](https://github.com/sindresorhus/clipboardy)
- [fs-extra](https://github.com/jprichardson/node-fs-extra)
- [ink](https://github.com/vadimdemedes/ink)
- [localtunnel](https://github.com/localtunnel/localtunnel)
- [pasteljs](https://github.com/vadimdemedes/pastel)
- [prop-types](https://github.com/facebook/prop-types)
- [react](https://github.com/facebook/react)
- [serve-handler](https://github.com/zeit/serve-handler)
- [uuid](https://github.com/kelektiv/node-uuid)

## Zero-install Usage

> UvU You will need [nodejs >= 10](https://nodejs.org/en/)

### Start piche local tunnel:

```bash
npx piche -s
```

### (Optionally) Piche local temp tunnel:

```bash
npx piche -st
```

> UwU piche will cleanup after itself once exit.

### Pipe data to piche cache and share it with other:

```bash
cat package.json | npx piche
```

## Install globally

```bash
$ npm install -g piche
```

## CLI

```
$ piche --help
piche

UwU A localtunnel based pipe tool to share text quickly from terminal.

Options:
  --help       Show help                                               [boolean]
  --version    Show version number                                     [boolean]
  --start, -s  Start piche server                     [boolean] [default: false]
  --tmp, -t    Use os.tmpdir/.piche instead of os.homedir/.piche
                                                      [boolean] [default: false]
  --clean, -c  Cleanup os.tmpdir/.piche and os.homedir/.piche
                                                      [boolean] [default: false]
  --name, -n   Name of the output file, default: an uuid/v1             [string]
```

## Development

There are 2 available commands:

- `npm run dev` - Start development mode and recompile on change
- `npm run build` - Build a final distributable for npm
