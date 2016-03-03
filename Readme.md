
# transition

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

Transition component, analogous to React&#x27;s ReactTransitionGroup, but in a more declarative style.

## Installation

    $ npm install vdux-transition

## Usage

`<Transition />` injects a special `$transition` prop into all of its children. That prop has `entering`, `leaving`, `didEnter`, and `didLeave`. Example:

```javascript
function Tooltip () {
  return (
    <Transition>
      <InnerTooltip>{props.message}</InnerTooltip>
    </Transition>
  )
}

const InnerTooltip () {
  render ({props}) {
    const {$transition} = props
    const {didEnter, didLeave, entering, leaving} = $transition

    return (
      <div class={{fade_in: entering, fade_out: leaving}} onAnimationEnd={[entering && didEnter, leaving && didLeave]}>
        {children}
      </div>
    )
  }
}
```

## `$transition` prop

  * `entering` - Whether or not the child is currently entering
  * `leaving` - Whether or not the child is currently leaving
  * `didEnter` - Call this when your enter animation finishes
  * `didLeave` - Call this when your leave animation finishes

## See also

  * [CSSTransition](https://github.com/vdux-components/css-transition) - A higher-level transition component for animating classes, a la ReactCSSTransitionGroup/ngAnimate.

## License

MIT
