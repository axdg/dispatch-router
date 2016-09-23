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

function timeout() {
  return new Promise(function (resolve) {
    setTimeout(() => { resolve() }, 10)
  })
}

function reducer(state = {}, action) {
  const nextState = Object.assign({}, state, action)
  delete nextState.type
  return nextState
}

const { dispatch, getState } = createStore(reducer)
const { pushState, replaceState, forward, back, go } = createRouter(match, dispatch)

describe('router()', function () {
  it('should throw if match is not a function', function () {
    expect(function () {
      createRouter('notafunction', dispatch)
    }).toThrow('match')
  })

  it('should throw if dispatch is not a function', function () {
    expect(function () {
      createRouter(match, 'notafunction')
    }).toThrow('dispatch')
  })

  it('should return the relevant history methods, wrapped or otherwise', function () {
    expect(pushState).toBeA(Function)
    expect(pushState).toNotEqual(history.pushState)
    expect(replaceState).toBeA(Function)
    expect(replaceState).toNotEqual(history.replaceState)
    expect(forward).toBeA(Function)
    expect(back).toBeA(Function)
    expect(go).toBeA(Function)
  })

  it('should dispatch when `pushState` is called', function () {
    pushState('/?x=y')
    expect(getState().pathname).toBe('/')
    expect(getState().params.d).toBe('root')

    pushState('/users')
    expect(getState().pathname).toBe('/users')
    expect(getState().params.d).toBe('users')

    pushState('/users/axdg')
    expect(getState().pathname).toBe('/users/axdg')
    expect(getState().params.d).toBe('user axdg')
  })

  it('should dispatch when `replaceState` is called', function () {
    replaceState('/notaroute')
    expect(getState().pathname).toBe('/notaroute')
    expect(getState().params.d).toBe('not found')

    replaceState('/users/axdg')
    expect(getState().pathname).toBe('/users/axdg')
    expect(getState().params.d).toBe('user axdg')
  })

  it('should dispatch when a `popstate` event is fired', function (done) {
    pushState('/notaroute')
    pushState('/')
    pushState('/users')
    pushState('/users/axdg')

    back()
    timeout()
    .then(function () {
      expect(window.location.pathname).toBe('/users')
      expect(getState().params.d).toBe('users')
      go(-1)
      return timeout()
    })
    .then(function () {
      expect(window.location.pathname).toBe('/')
      expect(getState().params.d).toBe('root')
      forward()
      return timeout()
    })
    .then(function () {
      expect(window.location.pathname).toBe('/users')
      expect(getState().params.d).toBe('users')
      go(-2)
      return timeout()
    })
    .then(function () {
      expect(window.location.pathname).toBe('/notaroute')
      expect(getState().params.d).toBe('not found')
      go(3)
      return timeout()
    })
    .then(function () {
      expect(window.location.pathname).toBe('/users/axdg')
      expect(getState().params.d).toBe('user axdg')
      done()
    })
    .catch(done)
  })
})
