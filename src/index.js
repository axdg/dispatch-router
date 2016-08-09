import { parse } from 'url'
import { _parse } from 'query-string'

function assert(e, msg) {
  if (!e) throw new Error(msg)
}

// TODO: Support url hash paths.
export default function router(match, dispatch/*, hash **/) {
  const _window = new Function('return this')()
  const dom = !!(_window.document && _window.createElement)
  assert(dom, 'dispatch-router can only be used in a browser env')
  assert(typeof match === 'function', '`match` must be a matching function')
  assert(typeof dispatch === 'function', '`dispatch` must be a function')

  const {
    history,
    history: {
      pushState,
      replaceState,
      forward,
      back,
      go,
    },
    location,
  } = _window

  function route() {
    const { href } = location
    const url = parse(href)
    const { params, fn } = match(url.pathname)
    url.params = params
    dispatch(fn(url))
  }

  _window.addEventListener('popstate', route)
  route()

  return {
    pushState(path) {
      pushState(null, null, path)
      route()
    },
    replaceState(path) {
      pushState(null, null, path)
      route()
    },
    forward,
    back,
    go,
  }
}
