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

const { dispatch, getState } = createStore(reducer)

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
    const {
      pushState,
      replaceState,
      forward,
      back,
      go,
    } = createRouter(match, dispatch)

    expect(pushState).toBeA(Function)
    expect(pushState).toNotEqual(history.pushState)

    expect(replaceState).toBeA(Function)
    expect(replaceState).toNotEqual(history.replaceState)

    expect(forward).toBeA(Function)

    expect(back).toBeA(Function)

    expect(go).toBeA(Function)
  })

  it('should dispatch when `pushState` is called', function () {
    const { pushState } = createRouter(match, dispatch)

    pushState('/?x=y')
    expect(getState().pathname).toBe('/')
    expect(getState().params.d).toBe('root')
    expect(getState().query.x).toBe('y')

    pushState('/users')
    expect(getState().pathname).toBe('/users')
    expect(getState().params.d).toBe('users')

    pushState('/users/axdg')
    expect(getState().pathname).toBe('/users/axdg')
    expect(getState().params.d).toBe('user axdg')
  })

  it('should dispatch when `replaceState` is called', function () {
    const { replaceState } = createRouter(match, dispatch)

    replaceState('/notaroute')
    expect(getState().pathname).toBe('/notaroute')
    expect(getState().params.d).toBe('not found')

    replaceState('/users/axdg')
    expect(getState().pathname).toBe('/users/axdg')
    expect(getState().params.d).toBe('user axdg')
  })

  it('should dispatch when a `popstate` event is fired', function (done) {
    const {
      dispatch: _dispatch,
      getState: _getState,
      subscribe,
    } = createStore(reducer)
    const { pushState, forward, back, go } = createRouter(match, _dispatch)

    pushState('/')
    pushState('/users')
    pushState('/users/axdg')
    pushState('/notaroute')

    const states = []
    subscribe(function () {
      states.push(_getState())
    })

    go(-3)
    forward()
    back()
    forward()
    forward()
    back()

    setTimeout(function () {
      try {
        expect(states.length).toBe(6)
        expect(states.map(s => s.params.d)).toEqual([
          'root',
          'users',
          'root',
          'users',
          'user axdg',
          'users',
        ])
      } catch (err) {
        return done(err)
      }
      return done()
    }, 100)
  })
})
