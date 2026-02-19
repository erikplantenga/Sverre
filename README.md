# Sverre Wintersport Slideshow

Kindvriendelijke fullscreen slideshow voor foto's en video's van de wintersport in Hirschegg (Der Berghof), 23 t/m 28 februari 2026.

## Inhoud van dit project

- `index.html` - pagina met wachtwoord en slideshow.
- `styles.css` - vormgeving, inclusief `Foto's en Filmpjes/Achtergrond.jpg` als achtergrond.
- `script.js` - logica voor slideshow, toetsen, swipe en video.
- `media.json` - lijst met foto-/videobestanden en captions.
- `generate-media-json.mjs` - maakt automatisch een nieuwe `media.json` op basis van bestanden in de map.

## Browsers en apparaten

De site is getest en werkt op **iPad**, **iPhone**, **Chrome**, **Safari**, **Firefox** en **Edge**. Swipe werkt op aanraakschermen; fullscreen gebruikt de juiste API per browser (inclusief Safari). Op iPad/iPhone starten video’s standaard zonder geluid (vanwege browserregels); tik op **Geluid aan** om geluid te horen.

## Lichte wachtwoordbeveiliging

Deze site gebruikt een simpele client-side code (makkelijk voor familiegebruik, niet waterdicht).

1. Open `script.js`.
2. Pas bovenaan deze regel aan:

```js
const ACCESS_CODE = "sverre";
```

## Media beheren (toevoegen/verwijderen)

Je kunt het op 2 manieren doen.

### Makkelijkste manier (aanrader)

1. Zet nieuwe foto's/video's in deze map.
2. Verwijder bestanden die je niet meer wilt tonen.
3. Draai dit commando in deze map:

```bash
node generate-media-json.mjs
```

Klaar: `media.json` wordt automatisch opnieuw opgebouwd.

Let op:
- Gebruik de map `Foto's en Filmpjes` voor alle media.
- `Achtergrond.jpg` wordt automatisch overgeslagen in de slideshow (blijft achtergrond).
- Bestandsnaam wordt automatisch de caption (bijv. `IMG_1234.jpeg` -> `IMG 1234`).

### Handmatig (optioneel)

Werk `media.json` zelf bij met de gewenste bestandsnamen/captions.

Voorbeeld van een item:

```json
{
  "type": "image",
  "src": "./mijn-foto.jpg",
  "caption": "Sverre op de piste"
}
```

Voor video:

```json
{
  "type": "video",
  "src": "./mijn-video.mp4",
  "caption": "Sneeuwactie!"
}
```

Tip: als `.MOV` niet goed afspeelt in een browser, zet de video om naar `.mp4`.

## Bediening slideshow

- `Vorige` / `Volgende` knoppen.
- `Play` / `Pauze`.
- `Geluid aan/uit` voor video's.
- `Fullscreen`.
- Toetsenbord:
  - Pijltjes links/rechts: vorige/volgende.
  - Spatie: play/pauze.
  - `M`: geluid aan/uit.
  - `F`: fullscreen.
- Op mobiel/tablet: swipe links/rechts op de media.

## Online zetten met GitHub Pages

Voer deze stappen uit in de projectmap:

```bash
git init
git add .
git commit -m "Add wintersport slideshow site"
git branch -M main
git remote add origin https://github.com/<jouw-gebruikersnaam>/<repo-naam>.git
git push -u origin main
```

Daarna op GitHub:

1. Open je repository.
2. Ga naar **Settings** -> **Pages**.
3. Kies bij Source: **Deploy from a branch**.
4. Kies branch `main` en map `/ (root)`.
5. Klik **Save**.

Na ongeveer 1 minuut staat je site live op:

`https://<jouw-gebruikersnaam>.github.io/<repo-naam>/`
