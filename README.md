# Training Log

A read-only, mobile-first training program for GitHub Pages. The interface reads its complete program from `data.json` and remains available offline through the service worker.

## Local preview (optional)

No local tooling is required to deploy the site. To preview it locally, use any static file server. For example, if Python is already installed:

```sh
python3 -m http.server 4173
```

Open `http://localhost:4173`. A server is needed only for local previews because browsers restrict data loading and service workers on `file://` URLs.

## Deploy

Push the files to GitHub, then select **Deploy from a branch** and the repository root in **Settings / Pages**. GitHub Pages serves the files directly; no build step, Node.js, Python, environment variables, database, or backend are required.

Edit `data.json` to update phases, workouts, exercises, and prescribed sets.
