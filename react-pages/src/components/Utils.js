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
    window.history.pushState(obj, '', url.pathname + url.search)
}

export function urlDecorator(klass) {
    return function(callingFunction) {
        let alias_mount = klass.prototype.componentDidMount;
        let alias_unmount = klass.prototype.componentWillUnmount;
        klass.prototype.componentDidMount = function() {
            this._binding_url_decorator_function = function() {
                callingFunction.call(this);
            }.bind(this);
            window.addEventListener('popstate', this._binding_url_decorator_function);
            if (alias_mount != null) alias_mount.call(this);
        }
        klass.prototype.componentWillUnmount = function() {
            window.removeEventListener('popstate', this._binding_url_decorator_function);
            if (alias_unmount != null) alias_unmount.call(this);
        }
    }
}