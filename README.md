# routewatch

A lightweight CLI that monitors and diffs Express/Fastify route tables across deployments.

## Installation

```bash
npm install -g routewatch
```

## Usage

Point `routewatch` at your app entry file and it will extract, snapshot, and diff your route table automatically.

```bash
# Take a snapshot of your current routes
routewatch snapshot --app ./src/app.ts --out routes.snapshot.json

# Compare routes against a previous snapshot
routewatch diff --before routes.snapshot.json --app ./src/app.ts
```

**Example output:**

```
✔ GET    /api/users          (unchanged)
✔ POST   /api/users          (unchanged)
+ GET    /api/users/:id      (added)
- DELETE /api/posts/:id      (removed)
~ PUT    /api/users/:id      (method changed)
```

### Options

| Flag | Description |
|------|-------------|
| `--app` | Path to your Express/Fastify app entry point |
| `--out` | Output file for the snapshot |
| `--before` | Snapshot file to diff against |
| `--format` | Output format: `text` (default) or `json` |

## Supported Frameworks

- [Express](https://expressjs.com/)
- [Fastify](https://fastify.dev/)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)