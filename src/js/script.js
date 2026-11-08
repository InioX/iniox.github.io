if (window.location.hash) {
    const hash = window.location.hash.slice(1);

    if (hash.includes('/') || hash.startsWith('matugen') || hash.startsWith('site')) {
        const [routePath, ...anchorParts] = hash.split('#');
        const anchor = anchorParts.length ? `#${anchorParts.join('#')}` : '';

        const cleanedRoute = routePath
            .replace(/^\/+/, '')
            .replace(/^site\//, 'home/')
            .replace(/^matugen(\/|$)/, 'docs/matugen$1');

        window.location.replace(`/${cleanedRoute}${anchor}`);
    }
}
