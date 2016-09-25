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
} = createRouter(match)
