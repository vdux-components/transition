/**
 * Imports
 */

import {component, element} from 'vdux'
import filter from '@f/filter-array'
import splice from '@f/splice'
import map from '@f/map-array'
import index from '@f/index'
import omit from '@f/omit'
import has from '@f/has'

/**
 * <Transition/>
 */

export default component({
  initialState ({children}) {
    assertKeyed(children)

    return {
      children,
      childStates: index(getKey, () => ({entering: true}), children)
    }
  },

  render ({state, actions}) {
    return (
      <span>
        {
          map(child => ({
            ...child,
            props: {
              ...child.props,
              $transition: {
                ...(state.childStates[getKey(child)] || {}),
                didEnter: actions.didEnter(getKey(child)),
                didLeave: actions.didLeave(getKey(child))
              }
            }
          }), state.children)
        }
      </span>
    )
  },

  onUpdate (prev, next) {
    if (prev.children !== next.children) {
      assertKeyed(next.children)
      return next.actions.updateChildren(next.children)
    }
  },

  reducer: {
    updateChildren: (state, nextChildren) => mergeChildren(state.children, nextChildren),
    didEnter: (state, key) => {
      const childState = state.childStates[key]

      if (childState && childState.entering) {
        return {
          childStates: childState.leaving
            ? {...childStates, [key]: {...childState, entering: false}}
            : omit(key, state.childStates)
        }
      }

      return state
    },
    didLeave: (state, key) => ({
      children: filter(item => getKey(item) !== key, state.children),
      childStates: omit(key, state.childStates)
    })
  }
})

/**
 * Helpers
 */

function mergeChildren (prev, next) {
  const prevMap = index(getKey, prev)
  const nextMap = index(getKey, next)
  const pendingMap = {}
  const childStates = {}
  let pendingKeys = []
  const children = []

  for (let i = 0; i < prev.length; ++i) {
    const child = prev[i]
    const key = getKey(child)

    if (!has(key, nextMap)) {
      childStates[key] = {
        leaving: true
      }
      pendingKeys.push(key)
    } else if (pendingKeys.length) {
      pendingMap[key] = pendingKeys
      pendingKeys = []
    }
  }

  for (let i = 0; i < next.length; ++i) {
    const child = next[i]
    const key = getKey(child)

    if (!has(key, prevMap)) {
      childStates[key] = {
        entering: true
      }
    }

    if (has(key, pendingMap)) {
      const pending = pendingMap[key]

      for (let j = 0; j < pending.length; ++j) {
        children.push(getChild(pending[j]))
      }
    }

    children.push(child)
  }

  for (let i = 0; i < pendingKeys.length; ++i) {
    children.push(getChild(pendingKeys[i]))
  }

  return {
    childStates,
    children
  }

  function getChild (key) {
    return has(key, nextMap) ? nextMap[key] : prevMap[key]
  }
}

function getKey (vnode) {
  return vnode.key
}

function insertAt (item, idx, list) {
  const key = getKey(item)

  return list.some(child => getKey(child) === key)
    ? list
    : splice(list, idx, 0, item)
}

function assertKeyed (children) {
  for (var i = 0; i < children.length; i++) {
    if (children[i].key === undefined) {
      throw new Error('<Transition/>: children of transition must have `key` prop')
    }
  }
}
