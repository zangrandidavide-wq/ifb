(function () {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var revealElements = document.querySelectorAll('[data-reveal]');

    if (prefersReducedMotion) {
        revealElements.forEach(function (el) { el.classList.add('is-visible'); });
        return;
    }

    if (!revealElements.length || !('IntersectionObserver' in window)) {
        revealElements.forEach(function (el) { el.classList.add('is-visible'); });
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px 0px -6% 0px', threshold: 0.1 });

    revealElements.forEach(function (el) { observer.observe(el); });
})();
