# Sikandar App

Local dev

1. Install dependencies:

```bash
npm install
```

2. Start mock API and dev server together (recommended):

```bash
npm run dev
```

- `npm run mock` starts a small Express mock server on `http://localhost:3000`.
- `npm start` runs the Angular dev server (port printed in the console).

If you prefer to run servers separately, first run `npm run mock` in one terminal and `npm start` in another.

3. Open the app in your browser and click "View Today's Inventory".

Testing

```bash
npm test
```

Notes

- The app will fall back to demo data if the backend is unreachable.
- To push changes to a remote, add a remote and run `git push <name> <branch>`.
