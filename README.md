# Suspects & Storytellers: Scribble & Bluff (online)

Real-time multiplayer. Each player uses their own phone or laptop. The server keeps the game state and
sends every player only their own secret (the Impostor never receives the word until the round is over).

## Run locally
    npm install
    npm start
Open http://localhost:3000 in two or more browser windows (or phones on the same Wi-Fi: http://YOUR-PC-IP:3000).

## Put it online (free): Render
1. Push this folder to a GitHub repo.
2. render.com > New > Web Service > connect the repo. (render.yaml is included, so settings fill in themselves.)
   Build command: npm install   Start command: npm start
3. Open the https://....onrender.com link and share it. Free instances sleep when idle; the first load can take ~30s.
Railway, Fly.io, Glitch or any Node host work the same way. Netlify/Vercel static hosting will NOT work:
they cannot keep WebSocket connections open.

## Notes
- Rooms live in server memory. Restarting the server ends all games. Run a single instance.
- Players who refresh or lose connection rejoin automatically (token stored in the browser).
- Invite link format: https://YOUR-SITE/?room=ABCD
