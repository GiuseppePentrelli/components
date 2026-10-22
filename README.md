# Components

I componenti UI che costruisco a mano, in HTML, CSS e JavaScript, senza framework né build.

Vetrina: **[giuseppepentrelli.github.io/components](https://giuseppepentrelli.github.io/components/)**

## Usare un componente in un'altra pagina

Ogni componente ha una pagina sua, che si apre da sola o si carica in un iframe:

```html
<iframe src="https://giuseppepentrelli.github.io/components/cards/cars-card/"
        title="Cars Card" loading="lazy" style="border:0; width:100%; height:740px"></iframe>
```

Dentro un iframe la pagina del componente non scorre mai, perché `embed.js` mette `overflow: hidden` su `html` e `body`, e manda alla pagina che la carica un messaggio `{ type: 'component:height', height }` con l'altezza che le serve. Chi la carica può ascoltarlo e adattare l'iframe, come fa la vetrina in `app.js`.

## Aggiungere un componente

1. Crea la cartella `<categoria>/<nome>/` con `index.html`, `style.css` ed eventuali immagini in `media/`.
2. In `index.html` includi `<script src="../../embed.js" defer></script>`.
3. Aggiungi il componente in `components.js`.
4. Fai il push: GitHub Pages pubblica i file così come sono, senza build.

Per provarlo in locale basta aprire `index.html` nel browser.
