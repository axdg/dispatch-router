import expect from 'expect'

import { createStore } from 'redux'

import createRouter from '../src'

const UPDATE_LOCATION = 'UPDATE_LOCATION'
function noop(url) { return Object.assign(url, { type: UPDATE_LOCATION }) }

function match(path) {
  if (path === '/') {
    return {
      params: { d: 'root' },
      fn: noop,
    }
  }

  if (path === '/users') {
    return {
      params: { d: 'users' },
      fn: noop,
    }
  }

  if (path === '/users/axdg') {
    return {
      params: { d: 'user axdg' },
      fn: noop,
    }
  }

  return {
    params: { d: 'not found' },
    fn: noop,
  }
}

function reducer(state = {}, action) {
  const nextState = Object.assign({}, state, action)
  delete nextState.type
  return nextState
}

const { dispatch } = createStore(reducer)

describe('router()', () => {
  it('should throw if match is not a function', () => {
    expect(function () {
      createRouter('notafunction', dispatch)
    }).toThrow('match')
  })

  it('should throw if dispatch is not a function', () => {
    expect(function () {
      createRouter(match, 'notafunction')
    }).toThrow('dispatch')
  })

  it('should return the relevant history methods, wrapped or otherwise', () => {
    const {
      pushState,
      replaceState,
      forward,
      back,
      go
    } = createRouter(match, dispatch)

    expect(pushState).toBeA(Function)
    expect(pushState).toNotEqual(history.pushState)

    expect(replaceState).toBeA(Function)
    expect(replaceState).toNotEqual(history.replaceState)

    expect(forward).toBeA(Function)
    expect(forward).toEqual(history.forward)

    expect(back).toBeA(Function)
    expect(back).toEqual(history.back)

    expect(go).toBeA(Function)
    expect(go).toEqual(history.go)
  })

  it('should dispatch when `pushState` is called', () => {

  })

  it('should dispatch when `replaceState` is called', () => {

  })

  it('should dispatch when a `popstate event is fired`', () => {

  })
})
