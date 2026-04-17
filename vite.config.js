import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'
import { pathToFileURL } from 'url'

// Load ALL env vars (including non-VITE_ ones like RESEND_API_KEY)
// so serverless handlers can read them via process.env during local dev.
// .env.local is loaded first so it takes priority over .env (Vite convention).
for (const envFile of ['.env.local', '.env']) {
  try {
    const envPath = path.resolve(envFile)
    if (fs.existsSync(envPath)) {
      for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx < 1) continue
        const key = trimmed.slice(0, eqIdx).trim()
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^"|"$/g, '')
        if (!process.env[key]) process.env[key] = val
      }
    }
  } catch { /* ignore */ }
}

/**
 * Lightweight adapter that serves Vercel-style serverless functions
 * (api/**\/*.js  →  export default handler(req, res))
 * directly from the Vite dev server so you don't need `vercel dev`.
 */
function vercelApiPlugin() {
  let root
  return {
    name: 'vercel-api-dev',
    configResolved(cfg) { root = cfg.root },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()
        const urlPath = req.url.split('?')[0]
        const filePath = path.join(root, `${urlPath}.js`)
        try {
          const fileUrl = pathToFileURL(filePath).href
          const mod = await import(`${fileUrl}?t=${Date.now()}`)
          if (typeof mod.default !== 'function') return next()

          // Parse JSON body for POST / PUT / PATCH
          if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            const chunks = []
            for await (const chunk of req) chunks.push(chunk)
            try { req.body = JSON.parse(Buffer.concat(chunks).toString()) }
            catch { req.body = {} }
          }

          // Vercel-compatible helpers
          res.status = (code) => { res.statusCode = code; return res }
          res.json = (data) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
          }

          await mod.default(req, res)
        } catch (err) {
          if (err.code === 'ERR_MODULE_NOT_FOUND') return next()
          console.error('[vercel-api-dev]', err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: err.message, userMessage: 'Errore interno del server.' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), vercelApiPlugin()],
})
