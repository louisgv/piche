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

> piche will cleanup all the data piped on SIGINT.

### Pipe data to piche and share it with other:

```bash
echo hello world | npx piche
```

### (Optionally) Pipe data to piche with a custom name:

```bash
echo hello world | npx piche -n="hello.txt"
```


## Why piche?

- The files are all hosted locally. Your data pipe through localtunnel temporarily. Once piche is shutdown, your data remains on your local machine.
- When you want to quickly share some log that carry sensitive data (which you shouldn't in the first place) and disable it right away after recipent has received it.

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
