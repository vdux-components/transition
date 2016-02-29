/**
 * Imports
 */

import test from 'tape'
import vdux from 'vdux/dom'
import element from 'vdux/element'
import Transition from '../src'

/**
 * Tests
 */

test('should work', t => {
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

  t.ok($('.entering'))
  setTimeout(() => {
    t.notOk($('.entering'))
    t.notOk($('.leaving'))

    setTimeout(() => {
      t.ok($('.leaving'))

      setTimeout(() => {
        t.notOk($('.leaving'))
        stop()
        t.end()
      })
    })
  })
})

/**
 * Helpers
 */

function run (app, initialState = {}) {
  return vdux({
    app,
    reducer,
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
