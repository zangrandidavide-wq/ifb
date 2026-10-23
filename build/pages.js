// Configurazione Tailwind di ogni pagina.
// Riproduce esattamente il vecchio `tailwind.config = {...}` che ogni pagina
// aveva inline quando usava il CDN: la build genera il CSS di ogni pagina e lo
// inserisce nella pagina stessa, nel blocco <style data-inline="tailwind">.
//
// Per aggiungere una pagina nuova: aggiungi una voce qui sotto, metti come
// ultimo elemento dell'<head> della pagina il blocco vuoto
//   <style data-inline="tailwind"></style>
// e lancia `npm run build:css`.

const BASE_COLORS = {
    'primary': '#7f13ec',
    'primary-dark': '#5e0eb3',
    'secondary': '#FFD700',
    'background-light': '#f7f6f8',
    'background-dark': '#191022',
};
const ACCENT = { 'accent-yellow': '#FFD700' };
const SAND = { 'sand': '#fdfbf7', 'sand-dark': '#231b2e' };

const FONT = { 'display': ['Lexend', 'sans-serif'] };
const RADIUS = { 'DEFAULT': '1rem', 'lg': '2rem', 'xl': '3rem', 'full': '9999px' };

const ALL_PLUGINS = ['forms', 'container-queries'];

// Animazioni condivise da metodo e sedi
const GRADIENT_SHIFT = {
    keyframes: {
        'fade-in-down': {
            '0%': { opacity: '0', transform: 'translateY(-8px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-shift': {
            '0%': { 'background-position': '0% 50%' },
            '50%': { 'background-position': '100% 50%' },
            '100%': { 'background-position': '0% 50%' },
        },
    },
    animation: {
        'fade-in-down': 'fade-in-down 0.3s ease-out both',
        'gradient-shift': 'gradient-shift 12s ease infinite',
    },
};

// Pagina "standard" del sito: dark mode a classe, font Lexend, angoli arrotondati
function page(colors, extra = {}, plugins = ALL_PLUGINS) {
    return {
        darkMode: 'class',
        plugins,
        theme: {
            extend: {
                colors,
                fontFamily: FONT,
                borderRadius: RADIUS,
                ...extra,
            },
        },
    };
}

module.exports = {
    'IFB_corsi': page({ ...BASE_COLORS, ...ACCENT, ...SAND }, {
        keyframes: {
            'fade-in-down': {
                '0%': { opacity: '0', transform: 'translateY(-16px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            'fade-in-up': {
                '0%': { opacity: '0', transform: 'translateY(24px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            'fade-in': {
                '0%': { opacity: '0' },
                '100%': { opacity: '1' },
            },
            'shimmer': {
                '0%': { backgroundPosition: '-200% 0' },
                '100%': { backgroundPosition: '200% 0' },
            },
        },
        animation: {
            'fade-in-down': 'fade-in-down 0.7s ease-out both',
            'fade-in-up': 'fade-in-up 0.7s ease-out both',
            'fade-in': 'fade-in 0.7s ease-out both',
            'shimmer': 'shimmer 3s linear infinite',
        },
    }),

    'clinic': page({ ...BASE_COLORS, ...ACCENT, ...SAND }),

    'coaches': page({ ...BASE_COLORS }),

    'contatti': page({ ...BASE_COLORS, ...ACCENT, ...SAND }, {}, ['container-queries']),

    'faq': page({ ...BASE_COLORS, ...ACCENT, ...SAND }),

    'federali': page({ ...BASE_COLORS, ...ACCENT }),

    // Pannello di gestione: niente dark mode a classe e raggi standard di Tailwind
    'gestione-tornei': {
        plugins: ['forms'],
        theme: {
            extend: {
                colors: {
                    'primary': '#7f13ec',
                    'primary-dark': '#5e0eb3',
                    'secondary': '#FFD700',
                    'background-light': '#f7f6f8',
                    'stage': '#120b1a',
                },
                fontFamily: FONT,
            },
        },
    },

    'glossario': page({ ...BASE_COLORS, ...SAND }, {
        keyframes: {
            'card-in': { '0%': { opacity: '0', transform: 'translateY(14px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
            'modal-in': { '0%': { opacity: '0', transform: 'translateY(16px) scale(.98)' }, '100%': { opacity: '1', transform: 'none' } },
        },
        animation: {
            'card-in': 'card-in .45s cubic-bezier(.22,1,.36,1) backwards',
            'modal-in': 'modal-in .3s cubic-bezier(.22,1,.36,1) both',
        },
    }),

    'index': page({ ...BASE_COLORS, ...SAND }, {
        keyframes: {
            'fade-in-down': {
                '0%': { opacity: '0', transform: 'translateY(-8px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            'fade-in-up': {
                '0%': { opacity: '0', transform: 'translateY(20px)' },
                '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            'hero-settle': {
                '0%': { transform: 'scale(1.08)' },
                '100%': { transform: 'scale(1)' },
            },
        },
        animation: {
            'fade-in-down': 'fade-in-down 0.3s ease-out both',
            'fade-in-up': 'fade-in-up 0.5s ease-out both',
            'hero-settle': 'hero-settle 2.4s cubic-bezier(.22,.61,.36,1) both',
        },
    }),

    'metodo': page({ ...BASE_COLORS, ...SAND }, GRADIENT_SHIFT),

    'privacy': page({ ...BASE_COLORS, ...SAND }),

    'rookie-league': page({ ...BASE_COLORS, ...SAND }),

    'sedi': page({ ...BASE_COLORS, ...SAND }, GRADIENT_SHIFT),

    'servizio': page({ ...BASE_COLORS, ...SAND }),

    'tornei': page({ ...BASE_COLORS, ...ACCENT }),

    'valutazioni': page({ ...BASE_COLORS, ...ACCENT, ...SAND }),
};
