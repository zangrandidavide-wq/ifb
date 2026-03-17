/**
 * fetchEvent.js
 * Fetches clinic.html, parses the DOM, and injects event data
 * into the Breaking News card on index.html.
 */
(async function loadFeaturedEvent() {
    try {
        const response = await fetch('clinic.html');
        if (!response.ok) {
            throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // 1. Title: textContent of the <h1>
        const h1 = doc.querySelector('h1');
        if (h1) {
            const titleEl = document.getElementById('dynamic-event-title');
            if (titleEl) titleEl.textContent = h1.textContent.trim();
        }
       // 2. Meta (Date/Location): first <span> with class 'bg-accent-yellow'
const metaSpan = doc.querySelector('span.bg-accent-yellow');
if (metaSpan) {
    const metaEl = document.getElementById('dynamic-event-meta');
    if (metaEl) {
        // 1. Estrae il testo grezzo (es: "sunny Marina di Massa | 24 - 26 Aprile")
        const rawText = metaSpan.textContent;
        
        // 2. Pulisce la stringa rimuovendo la legatura dell'icona
        const cleanText = rawText.replace('sunny', '').trim();
        
        // 3. Inietta l'icona seguita dai dati puliti
        metaEl.innerHTML = `<span class="material-icons text-base">sunny</span> ${cleanText}`;
    }
}

        // 3. Description: <p> immediately after <h1> inside the header
        const header = doc.querySelector('header');
        if (header) {
            const headerH1 = header.querySelector('h1');
            if (headerH1) {
                // Find the next sibling <p> element after h1
                let sibling = headerH1.nextElementSibling;
                while (sibling && sibling.tagName !== 'P') {
                    sibling = sibling.nextElementSibling;
                }
                if (sibling) {
                    const descEl = document.getElementById('dynamic-event-desc');
                    if (descEl) descEl.textContent = sibling.textContent.trim();
                }
            }
        }

    } catch (error) {
        console.error('[fetchEvent] Impossibile caricare i dati dell\'evento:', error);
        // Fallback: keep placeholder text already in the HTML
    }
})();
