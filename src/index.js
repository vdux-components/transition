/**
 * Imports
 */

import handleActions from '@f/handle-actions'
import createAction from '@f/create-action'
import difference from '@f/difference'
import filter from '@f/filter-array'
import element from 'vdux/element'
import splice from '@f/splice'
import map from '@f/map-array'
import index from '@f/index'
import omit from '@f/omit'

/**
 * Transition component
 */

function initialState ({children, local}) {
  assertKeyed(children)

  return {
    children,
    childStates: index(getKey, child => initialChildState(child, local), children)
  }
}

function onUpdate (prev, next) {
  if (prev.children !== next.children) {
    assertKeyed(next.children)

    const {local} = next
    return [
      map((child, idx) => local(willEnter)({child, idx, local}), difference(next.children, prev.children, getKey)),
      map(child => local(willLeave)(getKey(child)), difference(prev.children, next.children, getKey))
    ]
  }
}

function render ({state, local}) {
  return (
    <span>
      {
        map(child => ({
          ...child,
          props: {
            ...child.props,
            transition: {
              ...state.childStates[getKey(child)],
              didEnter: local(didEnter, getKey(child)),
              didLeave: local(didLeave, getKey(child))
            }
          }
        }), state.children)
      }
    </span>
  )
}

/**
 * Actions
 */

const willEnter = createAction('<Transition/>: component will enter')
const didEnter = createAction('<Transition/>: component did enter')

const willLeave = createAction('<Transition/>: component will leave')
const didLeave = createAction('<Transition/>: component did leave')

/**
 * Reducer
 */

const reducer = handleActions({
  [willEnter]: (state, {child, idx, local}) => ({
    ...state,
    children: insertAt(child, idx, state.children),
    childStates: {
      ...state.childStates,
      [getKey(child)]: initialChildState(child, local)
    }
  }),
  [didEnter]: (state, key) => ({
    ...state,
    childStates: {
      ...state.childStates,
      [key]: {
        ...state.childStates[key],
        entering: false
      }
    }
  }),
  [willLeave]: (state, key) => ({
    ...state,
    childStates: {
      ...state.childStates,
      [key]: {
        ...state.childStates[key],
        leaving: true
      }
    }
  }),
  [didLeave]: (state, key) => ({
    ...state,
    children: withoutKey(key, state.children),
    childStates: omit(state.childStates, key)
  })
})

/**
 * Helpers
 */

function initialChildState () {
  return {
    entering: true,
    leaving: false
  }
}

function getKey (vnode) {
  return vnode.key
}

function withoutKey (key, list) {
  return filter(item => getKey(item) !== key, list)
}

function insertAt (item, idx, list) {
  return splice(list, idx, 0, item)
}

function assertKeyed (children) {
  for (var i = 0; i < children.length; i++) {
    if (children[i].key === undefined) {
      throw new Error('<Transition/>: children of transition must have `key` prop')
    }
  }
}

/**
 * Exports
 */

export default {
  initialState,
  onUpdate,
  render,
  reducer
}
