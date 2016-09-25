function assert(e, msg) {
  if (!e) throw new Error(msg)
}

/**
 * router accepts a `match` function that returns `params` and `fn`
 * and a redux like `dispatch` function. It returns wrappers around
 * the native browser methods for history manipulation methods and
 * dispatches `fn(url)` whenever history state changes. url is location.href
 * as parsed by node's `url.parse()` with `params` assigned to it,
 * if a search string is present, it is parsed with
 *
 * @param {Function} match
 * @param {Function} dispatch
 * @return {Object} wrapped history methods.
 */
export default function createRouter(match, dispatch) {
  const dom = (window !== undefined && window.document && window.document.createElement)
  assert(dom, 'dispatch-router can only be used in a browser env')
  assert(typeof match === 'function', '`match` must be a function')
  assert(typeof dispatch === 'function', '`dispatch` must be a function')

  function route() {
    const { pathname, search, hash } = window.location
    const { params, fn } = match(pathname)

    // TODO: Probably only dispatch the params?
    dispatch(fn({
      pathname,
      params,
      search,
      hash,
    }))
  }

  window.addEventListener('popstate', function () {
    route()
  })
  route()

  const history = window.history

  return {
    pushState(path) {
      history.pushState(null, null, path)
      route()
    },

    replaceState(path) {
      history.replaceState(null, null, path)
      route()
    },

    forward: history.forward,
    back: history.back,
    go: history.go,
  }
}
