# M2 MBDS React

## Nom du projet
**Punto Game**

## Dépôt GitHub
https://github.com/MateusLopes16/m2-mbds-react

## Participants et tâches effectuées

### Tâches collectives

Ces fonctionnalités ont été développées en collaboration *(MateusLopes16, MarvStunt et Natfike)* :

- Mise en place des composants de rendu du plateau et liaison WebSocket (création/rejoindre une partie)
- Gestion du lancement de partie, initialisation du jeu et premier tour du joueur
- Interactions du plateau de jeu et intégration WebSocket
- Ajout de l'écran de fin de partie et de la condition de victoire
- Implémentation du replay

---

### 1) Mateus Lopes
- **Nom** : Lopes
- **Prénom** : Mateus
- **Identifiant GitHub** : `MateusLopes16`
- **Tâches individuelles** :
  - CSS du lobby, salle d'attente et affichage du jeu
  - Responsive global de l'application
  - Page des règles
  - Conception des interfaces

---

### 2) Marvin Conil
- **Nom** : Conil
- **Prénom** : Marvin
- **Identifiant GitHub** : `MarvStunt`
- **Tâches individuelles** :
  - Amélioration de la salle d'attente : démarrage/quitter une partie, intégration SweetAlert2
  - Ajout du serveur MongoDB et sauvegarde des parties dans la base

---

### 3) Erwan Hain
- **Nom** : Hain
- **Prénom** : Erwan
- **Identifiant GitHub** : `Natifke`
- **Tâches individuelles** :
  - Adaptation du projet pour le déploiement Firebase / Google Cloud
  - Hébergement du projet sur Google Cloud

---

## BONUS — URL du projet en ligne
- URL du projet : https://m2-react-front.web.app/

## Lancer le projet from scratch

> Prérequis : Node.js + npm, Docker, Docker Compose.

### 1) Cloner le repo
```bash
git clone https://github.com/MateusLopes16/m2-mbds-react.git
cd m2-mbds-react
```

### 2) Démarrer MongoDB avec Docker Compose (obligatoire)
```bash
docker compose -f back/docker-compose.yaml up -d
```

### 3) Configurer le backend
```bash
cd back
cp .env.example .env
npm install
node Server.js
```

### 4) Configurer le frontend (dans un autre terminal, depuis la racine du repo)
```bash
cd client
cp .env.example .env
npm install
npm run dev
```

### 5) Accès
- Frontend Vite : `http://localhost:5173`
- Backend API : `http://localhost:3000`
