export function changeQuery(obj) {
    let url = new URL(window.location);
    let query = url.searchParams;
    for (let key of Object.keys(obj)) {
        let target = obj[key];
        if (target == null)
            query.delete(key);
        else
            query.set(key, target)
    }
    window.history.pushState({}, '', url.pathname + url.search)
}

window.onpopstate = function () {
    window.location.reload();
};