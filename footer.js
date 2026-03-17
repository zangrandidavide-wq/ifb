class IfbvFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="py-6 text-center text-sm text-gray-500 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark">
        © 2026 I Follow Beach Volley. Tutti i diritti riservati.
        | <a href="privacy.html" class="hover:text-primary transition-colors">Privacy Policy</a>
        | <a href="termini.html" class="hover:text-primary transition-colors">Termini di Servizio</a>
      </footer>
    `;
  }
}

// Definisce il nuovo tag HTML personalizzato
customElements.define('ifbv-footer', IfbvFooter);