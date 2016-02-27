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
  const {stop} = run(() => <Transition></Transition>)
  
  stop()
  t.end()
})

/**
 * Helpers
 */

function run (app, initialState = {}) {
  return vdux({
    app,
    reducer: state => state,
    initialState
  })
}
