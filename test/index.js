/**
 * Imports
 */

import test from 'tape-co'
import vdux from 'vdux/dom'
import sleep from '@f/sleep'
import Transition from '../src'
import logger from 'redux-logger'
import element from 'vdux/element'
import polyfill from 'babel-polyfill'

/**
 * Tests
 */

test('should work', function *(t) {
  const Child = {
    onCreate ({props}) {
      return props.transition.didEnter()
    },

    render ({props}) {
      const {transition} = props
      const {entering, leaving} = transition

      return (
        <div class={{entering, leaving}}></div>
      )
    },

    onUpdate (prev, next) {
      if (!prev.props.transition.leaving && next.props.transition.leaving) {
        return next.props.transition.didLeave()
      } else {
        return removeSelf()
      }
    }
  }

  const {stop} = run(state => <Transition>{state.children}</Transition>, {children: [<Child key='test' />]})

  t.ok($('.entering'), 'added entering class')

  yield sleep(0)
  t.notOk($('.entering'), 'removed entering class')
  t.notOk($('.leaving'), 'did not yet add leaving class')

  yield sleep(0)
  t.ok($('.leaving'), 'added leaving class')

  yield sleep(0)
  t.notOk($('.leaving'), 'removed element')
  stop()
})

/**
 * Helpers
 */

function run (app, initialState = {}) {
  return vdux({
    app,
    reducer,
    // middleware: [logger()],
    initialState
  })
}

function $ (selector) {
  return document.querySelector(selector)
}

function removeSelf () {
  return {
    type: 'remove self'
  }
}

function reducer (state, action) {
  switch (action.type) {
    case 'remove self':
      return {
        ...state,
        children: []
      }
    default:
      return state
  }
}
