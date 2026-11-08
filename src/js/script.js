if (window.location.hash) {
    let route = window.location.hash.substring(1);

    route = route.replace(/^\/+/, '');
    route = route.replace(/^site\//, 'home/');
    route = route.replace(/^matugen(\/|$)/, 'docs/matugen$1');

    window.location.replace('/' + route);
}
