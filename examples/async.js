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
