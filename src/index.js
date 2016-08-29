import url from 'url'
import qs from 'query-string'

/**
 * A simple assert.
 */

function assert(e, msg) {
  if (!e) throw new Error(msg)
}

/**
 * router accepts a `match` function that returns `params` and `fn`
 * and a redux like `dispatch` function. It returns wrappers around
 * the native browser methods for history manipulation methods and
 * dispatches `fn(url)` whenever history state changes. url is location.href
 * as parsed by node's `url.parse()` with `params` assigned to it.
 *
 * @param {Function} match
 * @param {Function} dispatch
 * @return {Object} wrapped history methods.
 */
const _window = window
const dom = !!(window !== undefined && _window.document && _window.document.createElement)

export default function createRouter(match, dispatch) {
  assert(dom, 'dispatch-router can only be used in a browser env')
  assert(typeof match === 'function', '`match` must be a function')
  assert(typeof dispatch === 'function', '`dispatch` must be a function')

  /**
   * Respond to `pushState`, `replaceState` or on a `popstate` event.
   */

  function route() {
    const _url = JSON.parse(JSON.stringify(url.parse(_window.location.href)))
    const { params, fn } = match(_url.pathname)
    _url.params = params
    if (_url.search) _url.query = qs.parse(_url.search)
    dispatch(fn(_url))
  }

  _window.addEventListener('popstate', function () {
    route()
  })
  route()

  const history = _window.history

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
