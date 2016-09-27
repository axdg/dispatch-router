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

export store
export router
```

It's now pretty trivial to create links using the above router. An example of creating a simple anchor element in plain js would look something like this:


```js
const a = document.createElement('a')
a.addEventListener('click', function (e) {
  e.preventDefault()
  router.pushState('/users')
}, false)
```

Creating a reusable component that uses the router for navigation is also simple. Here's an example of a react component that accepts an href to navigate to and a boolean flag to switch between pushing and replacing state:

```jsx
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

Component based routers like [react-router](https://github.com/ReactTraining/react-router/blob/master/docs/Introduction.md) prefer for location state to be managed by routing components, and passed to child componets as props where requied. The logic behind this is that it makes it possible to easily build heavily nested UIs, which it can - but this paradigm has a few shortcomings:

 - Many (probably most) UIs aren't actually composed of the sort of nested structure that component based routers are designed to help with, and when location is state is passed in at the top level, it's trivial to create **pure** router components should you need them.

 - When the current route and the path or query string params are stored in components, we can only access those values by passing them down to child components, wrapping our components in a `withRouter`-ish HOC, or resorting to gross hacks.

 - We loose the ability to easily derive values from the route params, or perform any operations (especially network requests) that rely on the current url outside of the children of router components. The asyncronously loaded data that is required by our components is a often a deterministic product of the url (in many cases all of the data required for a entire page is). If we are able to hoist the logic for fetching this data out of the components themselves, we can create simpler, more reusable components that are agnostic to the source of their props.

Here is an example of how we can combine a redux async helper middleware like [redux-thunk](https://github.com/gaearon/redux-thunk) with dispatch-router to move our request logic out of components:

**TODO:** Finish this example... add components.

```js
import createStore, { applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import create from 'trie-mux'
import createRouter from 'dispatch-router'

// Some constants
const LOCATION_CHANGE = '@@APP/LOCATION_CHANGE'
const FETCH_BLOG = '@@APP/FETCH_POSTS'
const RECEIVE_BLOG = '@@APP/RECEIVE_BLOG'
const FETCH_POST = '@@APP/FETCH_POST'
const RECEIVE_POST = '@@APP/RECEIVE_POST'

// Just to illustrate the store structure.
const initialState = {
  location: {},
  blog: {},
  posts: {},
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case LOCATION_CHANGE:
      return {
        ...state,
        location: action.page,
      }

    case FETCH_BLOG:
      return {
        ...state,
        blog: {
          fetching: true,
        },
      }

    case RECEIVE_BLOG:
      return {
        ...state,
        blog: {
          fetching: false,
          data: action.data,
        },
      }

    case FETCH_POST:
      return {
        ...state,
        posts: {
          ...state.posts,
          [action.id]: {
            fetching: true,
          },
        },
      }

    case RECEIVE_POST:
      return {
        ...state,
        posts: {
          ...state.posts,
          [action.id]: {
            fetching: false,
            data: action.data,
          },
        },
      }

    default:
      return state
  }
}

// A 404 handler.
function notFound() {
  return {
    type: LOCATION_CHANGE,
    page: 'not found page',
  }
}

function homepage() {
  return function (dispatch, getState) {
    // Should we fetch the data?
    if (!getState().blog.fetching) return

    dispatch({
      type: LOCATION_CHANGE,
      page: 'home page',
    })

    dispatch({
      type: FETCH_BLOG,
    })

    fetch('/api/blog')
      .then(function (res) {
        return res.json()
      })
      .then(function (data) {
        dispatch({
          type: RECEIVE_BLOG,
          data,
        })
      })
  }
}

// The single post page handler.
function post(url) {
  return function (dispatch, getState) {
    const { posts } = getState()

    // Should we fetch the data?
    if (!posts.id || !post.id.fetching) return
    const { id } = url.params

    dispatch({
      type: LOCATION_CHANGE,
      page: 'post page',
    })

    dispatch({
      type: FETCH_POST,
      id,
    })

    fetch(`/api/posts/${id}`)
      .then(function (res) {
        return res.json()
      })
      .then(function (data) {
        dispatch({
          type: RECEIVE_POST,
          data,
          id,
        })
      })
  }
}

const store = createStore(reducer, applyMiddleware(thunk))
const { append, match } = create(notFound)

// The home route.
append('/', homepage)

// The single post route.
append('/:id', post)

const router = createRouter(match, store.dispatch)
```
