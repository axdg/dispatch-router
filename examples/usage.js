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
