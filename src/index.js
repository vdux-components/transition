/**
 * Imports
 */

import handleActions from '@f/handle-actions'
import createAction from '@f/create-action'
import difference from '@f/difference'
import element from 'vdux/element'
import map from '@f/map-array'
import reduce from '@f/reduce'
import index from '@f/index'
import omit from '@f/omit'

/**
 * Transition component
 */

function initialState ({children, local}) {
  return {
    children,
    childStates: reduce((acc, child, idx) => {
      acc[getKey(child)] = initialChildState(child, idx, local)
      return acc
    }, {}, children)
  }
}

function onUpdate (prev, next) {
  if (prev.children !== next.children) {
    const {local} = next

    return [
      map((child, idx) => local(willEnter)({child, idx, local}), difference(next.children, prev.children)),
      map(child => local(willLeave)(getKey(child)), difference(prev.children, next.children))
    ]
  }
}

function render ({state}) {
  console.log('transition rerender', state)

  return (
    <span>
      {map(child => ({...child, props: {...child.props, transition: state.childStates[getKey(child)]}}), state.children)}
    </span>
  )
}

/**
 * Actions
 */

const willEnter = createAction('<Transition/>: component will enter')
const didEnter = createAction('<Transition/>: component did enter')

const willLeave = createAction('<transition/>: component will leave')
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

function initialChildState (child, local) {
  return {
    entering: true,
    leaving: false,
    didEnter: local(didEnter, getKey(child)),
    didLeave: local(didLeave, getKey(child))
  }
}

function getKey (vnode) {
  return vnode.key
}

function withoutKey (key, list) {
  return list.filter(item => getKey(item) !== key)
}

function insertAt (item, idx, list) {
  list = list.slice(0)
  list.splice(idx, 0, item)
  return list
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
