# Punto Game - Contexte Projet pour IA

Ce README est pense pour donner a une IA (Copilot, agent, LLM) le contexte complet de l'application afin d'etre operationnelle rapidement sur le codebase.

## 1) Vision rapide

- Domaine: jeu Punto multijoueur en temps reel.
- Frontend: React + TypeScript + Vite.
- Backend: Node.js + Express + Socket.IO.
- Persistance: MongoDB (replays de parties).
- Flux principal: Lobby -> Salle d'attente -> Partie -> Leaderboard.
- Flux secondaire: Lecture de replay par `sessionId`.

## 2) Objectif fonctionnel

L'application permet de:

- Creer une room (session) ou rejoindre une room existante.
- Lancer une partie (host uniquement).
- Jouer en tours avec pose de cartes sur un plateau 6x6.
- Marquer des points avec alignements de 4 cartes de meme couleur.
- Finir la partie a 2 points.
- Sauvegarder puis rejouer une partie terminee.

## 3) Architecture technique

### Frontend (`client/`)

- Point d'entree: `client/src/main.tsx`
  - Monte `BrowserRouter` et `WebSocketProvider` autour de `App`.
- Routing: `client/src/App.tsx`
  - `/` lobby
  - `/lobby/:id` salle d'attente
  - `/Game/:id` partie
  - `/leaderboard/:id` fin de partie
  - `/replay/:id` lecture replay
  - `/rules` page regles
- Etat temps reel global: `client/src/service/WebSocket.tsx`
  - Contexte React + connexion `socket.io-client`
  - Synchronise `currentGame`, `activePlayerName`, `currentCard`, `winningLine`, `lastPlacedPosition`.
- Ecrans clefs:
  - Lobby: `client/src/components/lobby/Lobby.tsx`
  - Waiting room: `client/src/components/lobby/Waiting.tsx`
  - Jeu: `client/src/components/game/Game.tsx` + `GameView.tsx`
  - Plateau: `client/src/components/game/board/Board.tsx`
  - Replay: `client/src/components/game/replay/ReplayGame.tsx`

### Backend (`back/`)

- Point d'entree: `back/Server.js`
  - API HTTP + CORS + boot Socket.IO + connexion MongoDB.
- Socket server: `back/sockets/index.js`
- Handlers metier socket: `back/sockets/events.js`
  - Gestion rooms, joueurs, lancement partie, tours, score, fin de partie.
- Logique de jeu: `back/model/Game.js`
  - Initialisation joueurs/cartes/couleurs, regles de placement, detection victoire.
- Persistance replay: `back/mongodb/index.js` + `replayEvent.model.js`

### Persistance

- Collection MongoDB: `game_replay_events`.
- Schema volontairement souple (`strict: false`) pour stocker un objet JSON de replay.

## 4) Modele de jeu (important pour IA)

- Plateau: 6x6.
- Etats de case:
  - `unplacableSpot`
  - `placableSpot`
  - `card`
  - `placableCard`
- Une carte peut etre placee:
  - sur `placableSpot`
  - ou sur `placableCard` (si carte cible de valeur plus faible).
- Condition de point: aligner 4 cartes de meme couleur (horizontal, vertical, diagonal).
- Fin de partie: un joueur atteint 2 points.
- Apres un point non terminal:
  - animation/attente `WINNING_LINE_HIGHLIGHT_MS = 2400`
  - suppression de la meilleure carte (plus forte valeur) de la couleur gagnante pour le joueur marqueur
  - reset du plateau avec retour des cartes restantes dans les mains
  - tour suivant

## 5) Contrat Socket.IO

### Events client -> serveur

- `joinRoom`: `{ id?: string, player: { name, score, color, isHost } }`
- `leaveRoom`: `{ id, playerName }`
- `startGame`: `{ id, playerName }`
- `placeCard`: `{ card, position: { x, y } }`

### Events serveur -> client

- `joinedRoom`: etat room initial
- `addPlayerToRoom`: joueur ajoute
- `deletePlayerInRoom`: room mise a jour apres depart/deconnexion
- `gameStarted`: etat de jeu initialise
- `playerTurn`: carte active + etat de jeu
- `gameUpdated`: etat de jeu + position posee
- `playerPoint`: etat de jeu + winningLine + position posee
- `gameEnded`: etat final + winningLine + position posee
- `error`: `{ message }`

## 6) API HTTP

- `GET /` -> health basique
- `GET /replays` -> liste des replays (resume)
- `GET /replays/:sessionId` -> replay detaille

## 7) Structure du replay stocke

Objet principal (`type: gameReplay`):

- `sessionId`
- `winner`
- `replayMoveCount`
- `currentPlayerIndex`
- `players[]` (name, isHost, color, score, cardsRemaining)
- `game[]` timeline des tours

Chaque element de `game[]` contient notamment:

- `turn`
- `playerName`
- `playedCard` (`value`, `color`)
- `position` (`x`, `y`)
- `playerScores[]`
- `scoringPlayerName` (si point)
- `winningLine` (si point)
- `boardState` snapshot complet du plateau

## 8) Demarrage local

Prerequis:

- Node.js + npm
- Docker + Docker Compose

### 1. Cloner

```bash
git clone https://github.com/MateusLopes16/m2-mbds-react.git
cd m2-mbds-react
```

### 2. Demarrer MongoDB

```bash
docker compose -f back/docker-compose.yaml up -d
```

### 3. Backend

```bash
cd back
cp .env.example .env
npm install
node Server.js
```

### 4. Frontend (nouveau terminal)

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

### 5. URLs

- Frontend: `http://localhost:5173`
- Backend HTTP/Socket: `http://localhost:3000`

## 9) Variables d'environnement

### Backend (`back/.env`)

- `DEFAULT_MONGODB_URI` (exemple dans `.env.example`)
- `PORT` (par defaut 3000)
- `MONGODB_URI` optionnelle (prioritaire si definie)

### Frontend (`client/.env`)

- `VITE_SOCKETSERVERURL=http://localhost:3000`
- `VITE_API_URL=http://localhost:3000` (actuellement peu exploite, l'app utilise surtout `VITE_SOCKETSERVERURL`)

## 10) Limitations et points d'attention

- Etat des rooms en memoire serveur (`games` dans `back/sockets/events.js`):
  - non persistant
  - non partage entre instances (important en deploiement multi-instance)
- Le replay est effectivement persiste en base a la fin de partie (`score === 2`).
- `back/package.json` contient `"start": "node server.js"` alors que le fichier est `Server.js` (attention aux environnements Linux case-sensitive).
- Le client force `transports: ["websocket"]` (pas de fallback polling).

## 11) Guide de contexte pour une IA (copier-coller)

Tu travailles sur Punto Game.
Stack: frontend React/TS (Vite), backend Node/Express/Socket.IO, MongoDB pour les replays.
Le coeur metier est dans `back/model/Game.js` et `back/sockets/events.js`.
Le state temps reel frontend est centralise dans `client/src/service/WebSocket.tsx`.
Avant toute modification:
1) preserve le contrat des events socket,
2) ne casse pas la timeline de replay,
3) garde la logique de victoire (4 alignees, partie a 2 points),
4) valide les impacts front + back.

## 12) Credits

Projet realise par:

- Mateus Lopes (`MateusLopes16`)
- Marvin Conil (`MarvStunt`)
- Erwan Hain (`Natifke`)

URL publique (historique): https://m2-react-front.web.app/
