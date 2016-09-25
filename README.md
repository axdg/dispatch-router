# dispatch-router

> A router for client side redux apps

[![Circle CI](https://circleci.com/gh/axdg/dispatch-router/tree/master.svg?style=shield)](https://circleci.com/gh/axdg/dispatch-router/tree/master)

### Installation

Install the package with [npm](https://www.npmjs.com/) and add it to your dependencies:

```
npm install --save dispatch-router
```
### Usage

```js
import createStore from 'redux'
import create from 'trie-mux'
import createRouter from 'dispatch-router'

/**
 * Set up a 404 handler and some other
 * routes, as well as a reducer...
 */

const {
  append,
  match,
} = create(notFound)

const {
  dispatch,
  getState,
  subscribe,
} = createStore(reducer)

const {
    pushState,
    replaceState,
    forward,
    back,
    go,
} = createRouter(match, dispatch)
```

`createRouter` takes two arguments, a 'matching' function and the `dispatch` method of a redux instance. The matching function can be anything that takes the [`pathname`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/pathname) portion of a URL and returns an object containing `params` (a hash of k/v pairs extracted from the path), and `fn` (a handler function). For more detail about this, please see [trie-mux](https://github.com/axdg/trie-mux) or [regex-mux](https://github.com/axdg/regex-mux) both are mux creators that return a `match` function.

The functions `pushState`, `replaceState`, `forward`, `back` and `go` are all equivalent to the corresponding [HTML5 history api](https://developer.mozilla.org/en-US/docs/Web/API/History_API) methods, except that `pushState` and `replaceState` take a single argument - the route to navigate to.

If `pushState`, `replaceState`, `forward`, `back` or `go` all called, or whenever a user navigates your app using the browser controls, the supplied `match` function is called with the new `pathname`, the returned `params` are passed to `fn`, and the return value passed to redux's `dispatch`.

Here's how you might set it up and use it in a real world app:

```jsx
import createStore from 'redux'
import create from 'trie-mux'
import createRouter from 'dispatch-router'

const LOCATION_CHANGE = '@@APP/LOCATION_CHANGE'

function reducer(state, action) {
  if (action.type === LOCATION_CHANGE) {
    const nextState = { ...action }
    delete nextState.type
    return nextState
  }

  return state
}

function notFound() {
  return {
    type: LOCATION_CHANGE,
    page: 'not found page',
  }
}

function homepage() {
  return {
    type: LOCATION_CHANGE,
    page: 'home page',
  }
}

const store = createStore(reducer)
const { append, match } = create(notFound)

append('/', homepage)

const router = createRouter(match, store.dispatch)

/**
 * It's now pretty trivial to create links
 * using the above router. An example of
 * creating a simple anchor element in
 * plain js would look something like this;
 */

const a = document.createElement('a')
a.addEventListener('click', function (e) {
  e.preventDefault()
  router.pushState('/users')
}, false)

/**
 * Creating a reusable component that uses
 * the router for navigation is also simple.
 * Here's an example of a react component
 * that accepts an href to navigate to and
 * a boolean flag to switch between pushing
 * and replacing state;
 */

const { pushState, replaceState } = router

class Anchor extends Component {
  render() {
    const { href, push = true } = this.props

    return (
      <a
        href={href}
        onClick={function(e) {
          e.preventDefault()
          push ? pushState(href) : replaceState(href)
        }}
      />
    )
  }
}

Anchor.propTypes = {
  href: PropTypes.string.isRequired,
  push: PropTypes.bool,
}

/**
 * Example usage of the above component;
 */

<Anchor href="/homepage" />
```

### Why?

Applications that use redux use it to manage global state, and the applications current url **is global state**. This module is just designed to make it easy to keep redux and url in sync. 

Component based routers like [react-router](https://github.com/ReactTraining/react-router/blob/master/docs/Introduction.md) prefer for this state to be managed by routing components, and passed to child componets as props where requied. The logic behind this is that it makes it possible to easily build heavily nested UIs, which it can - but this paradigm has a few shortcomings:

 - The current route and the path or query string params are stored in components, if we want to access those values outside of that component, we have to pass them down to children, or wrap out components in a `withRouter` HOC.

 - We don't have the ability to derive and values from the route params, or perform any operations (especially network requests) that rely on the current url outside of components.

### TODO: 

 - Examples of dispatches with a bunch of derived values
 - Examples of using redux thunk for network requests based on the route.
