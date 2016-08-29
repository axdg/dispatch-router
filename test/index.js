import expect from 'expect'

import { createStore } from 'redux'

import createRouter from '../src'

function noop(url) { return url }

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
  return {
    ...action,
  }
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

  it('should return the relevant history methods, wrapped or otherwise', () => {})

  it('should dispatch when `pushState` is called', () => {})

  it('should dispatch when `replaceState` is called', () => {})

  it('should dispatch when a `popstate event is fired`', () => {})
})
