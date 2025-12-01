# API Routes Backup

Diese API-Routes wurden für Phase 2 (AI Features) erstellt, können aber mit dem aktuellen Static Export (GitHub Pages) nicht verwendet werden.

## Aktivierung der AI Features

Um die vollen AI-Features zu nutzen:

1. **Wechsel zu Vercel Deployment:**
   ```bash
   # In next.config.ts:
   # Entferne oder kommentiere diese Zeilen aus:
   # output: "export",
   # basePath: isProd ? "/CD-System-Flux" : "",
   # assetPrefix: isProd ? "/CD-System-Flux/" : "",
   ```

2. **API Routes wiederherstellen:**
   ```bash
   # Kopiere den Inhalt dieses Ordners nach app/api/
   cp -r api-routes-backup/api/* app/api/
   ```

3. **Umgebungsvariablen setzen (Vercel Dashboard):**
   ```
   ANTHROPIC_API_KEY=your_key_here
   ```

4. **Deploy zu Vercel:**
   ```bash
   vercel
   ```

## Enthaltene Routes

### Phase 2: AI Features
- `recommendations/route.ts` - AI DJ Mode (Track-Empfehlungen)
- `transmissions/route.ts` - Dynamische Narrative
- `companion/route.ts` - AI Chat Companion

### Phase 3: Social Features
- `leaderboard/route.ts` - Infection Leaderboard
- `stats/route.ts` - Global Network Statistics
- `sync/route.ts` - Shared Listening Sessions

## Fallback-Verhalten

### AI Hooks (`hooks/useAI.ts`)
- Wenn API nicht verfügbar → Lokale Pattern-Matching für Empfehlungen
- Wenn API nicht verfügbar → Vordefinierte Transmissions
- Wenn API nicht verfügbar → Lokale Slash-Commands für Companion

### Social Hooks (`hooks/useSocial.ts`)
- Wenn API nicht verfügbar → Simulierte Leaderboard-Daten
- Wenn API nicht verfügbar → Mock Global Stats
- Wenn API nicht verfügbar → Sync Listening deaktiviert

## Backend-Empfehlungen für Production

Für volle Social Features:
- **Datenbank:** Supabase oder Firebase für Leaderboard/Stats
- **Realtime:** WebSocket für Sync Listening
- **Caching:** Redis für Session-Management
