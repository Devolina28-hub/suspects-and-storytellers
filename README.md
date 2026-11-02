# Suspects & Storytellers: Scribble & Bluff (online)

Real-time multiplayer party game. Each player uses their own phone or laptop.

## How a round works
1. Everyone privately sees their role and word. Regular players share ONE word; the Impostor gets a different,
   unrelated word (from a different category). Words are only sent to the player they belong to.
2. Players draw one at a time, in room order, each with a countdown. Submitting (or running out of time) moves to the
   next player. Submitted drawings appear for everyone straight away. Disconnected or stuck players are skipped.
3. Discussion with a synced timer, a drawing gallery and the room chat.
4. Secret voting with a timer (chat paused). Ties let the Impostor escape.
5. Reveal, Impostor's final guess (of the group word), funniest-entry vote, recap with both words, 3 rounds, final results.
Scoring is unchanged: +100 per correct vote, +200 Impostor escapes, +150 correct final guess, +50 funniest entry.

## Settings (host, in the lobby)
Drawing time per turn, discussion time, voting time.

## Run locally
    npm install
    npm start
Open http://localhost:3000 in several windows or phones on the same Wi-Fi.

## Deploy (free): Render
Push to GitHub, then render.com > New > Web Service > pick the repo (render.yaml is included).
Build: npm install   Start: npm start. Netlify/Vercel static hosting cannot run this server (WebSockets).
Rooms live in memory, so run a single instance; a restart ends running games.

## Chat rules (enforced on the server)
Room members only, 200 characters max, 0.7 s between messages, duplicates ignored, history of the last 100 messages
replayed on reconnect, paused during voting. Messages are rendered as plain text.
