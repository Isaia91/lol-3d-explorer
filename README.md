# LoL 3D Explorer
Site disponible sur : https://lol3dexplorer.netlify.app/

Projet d’exploration interactive de l’univers **League of Legends** en 3D.  
Il permet de :
- Naviguer dans une scène 3D (React + Three.js)
- Explorer les champions (sorts, skins, fiches détaillées)
- Visualiser des galeries et statistiques (pick rate, win rate)
- Utiliser les données Riot (Data Dragon, API Riot)

## Stack
- React 18 + Vite
- @react-three/fiber & @react-three/drei
- Bootstrap 5 (UI)
- Riot API & Data Dragon

## Installation
```bash
npm install
npm run dev
```

## Pages
- **Home** : accueil
- **Champions** : sélection et détails
- **Gallery** : visuels et modèles
- **Stats** : graphiques pick/win rate

---

## Informations importantes
Les données statistiques ont été collectées et stockées en base de données via des appels à l’API de Riot Games.

---
## Données et échantillonage
L’échantillon utilisé pour générer les statistiques provient du top ladder de trois régions :

- Corée (KR)
- Europe (EUW1)
- Amérique du Nord (NA1)

Pour chaque région, j’ai sélectionné les 20 joueurs ayant le plus de LP (League Points, système de points qui détermine le rang des joueurs).
Ensuite, pour chacun de ces joueurs, les 20 dernières parties ont été récupérées et utilisées comme base pour les statistiques.
---
***Méthodologie***

- Sélection des joueurs Challenger (top 20 par région).
- Récupération de leur PUUID.
- Extraction des 20 dernières parties classées soloQ.

Stockage en base PostgreSQL dans trois tables principales :

    -players

    -matches

    -participants

## Api
### Clé API Riot et utilisation

Pour accéder aux données via l’API officielle de Riot Games, une clé API est obligatoire.

- Comment obtenir une clé ?

    - Crée un compte développeur sur le Riot Developer Portal(https://developer.riotgames.com/).

    - Se connecter et génèrer une clé API temporaire (valide 24h).


- Utiliser la clé :
  - Creer un fichier .env a la racine
  - Dans le .env créer la variable : VITE_RIOT_KEY
  - Copier la clé en tant que valeur de la variable dans le fichier .env (exemple : VITE_RIOT_KEY=RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)


- Requete HTTP:
    
    - api_key = "RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    - HEADERS = {"X-Riot-Token": api_key}


- Renouvelle la clé si elle a expiré.

Limites

Les clés de développement sont limitées à un certain nombre de requêtes par minute (environ 20 requêtes / 2 secondes).

Pour un projet en production ou nécessitant plus de volume, il faut demander une clé de production via le portail (soumis à validation par Riot).
