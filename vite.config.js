import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// When built inside GitHub Actions, GITHUB_REPOSITORY is "owner/repo-name".
// GitHub Pages serves project sites from /repo-name/, so the base path has
// to match or assets (JS/CSS) will 404. Locally (npm run dev / a plain
// build) this falls back to "/".
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const base = process.env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
