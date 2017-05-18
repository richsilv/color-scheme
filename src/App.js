import './App.css'
import 'tachyons/css/tachyons.min.css'
import oneColor from 'onecolor'
import colorMeasure from 'color-measure'

import React from 'react'

const boundNum = (num, bound) => Math.max(Math.min(num, bound), -bound)
const brighterHue = (color) => boundNum((((color.hue() % 0.33333333) / 0.16666666) % 2) - 1, 1 / 120)
const darkerHue = (color) => boundNum((((color.hue() % 0.33333333) / 0.16666666) % 2) - 1, 1 / 120)
const classNames = [
  'primary-d2',
  'primary-d1',
  'primary',
  'primary-l1',
  'primary-l2',
  'complement'
]
const makeRules = (className, color) => {
  return `
.${className} {
  color: ${color};
}
.bg-${className} {
  background-color: ${color};
}
.b--${className} {
  border-color: ${color};
}
`
}

const App = React.createClass({
  getInitialState () {
    return {
      scheme: null,
      baseColor: ''
    }
  },
  changeBaseColor (evt) {
    this.setState({ baseColor: evt.target.value })
  },
  generateColors (evt) {
    evt.preventDefault()
    let baseColor = oneColor(this.state.baseColor)
    let hex
    const baseLuminance = Math.min(colorMeasure.luminance(baseColor) * 3300, 0.999)
    const shadesBelow = Math.floor(baseLuminance / 0.2)
    const scheme = new Array(5)
    scheme[shadesBelow] = baseColor.hex()
    for (let i = shadesBelow - 1; i >= 0; i -= 1) {
      hex = baseColor
        .saturation((1 - baseColor.saturation()) * 0.18, true)
        .lightness(baseColor.lightness() * -0.25, true)
        .hue(darkerHue(baseColor), true)
        .hex()
      scheme[i] = hex
      baseColor = oneColor(hex)
    }
    baseColor = oneColor(this.state.baseColor)
    for (let i = shadesBelow + 1; i < 5; i += 1) {
      hex = baseColor
        .saturation(baseColor.saturation() * -0.1, true)
        .lightness((1 - baseColor.lightness()) * 0.15, true)
        .hue(brighterHue(baseColor), true)
        .hex()
      scheme[i] = hex
      baseColor = oneColor(hex)
    }
    this.setState({ scheme })
  },
  generateCSS () {
    const { scheme, complement } = this.state
    const css = scheme.concat(complement).reduce((css, color, ind) => {
      return css + makeRules(classNames[ind], color)
    }, '/* Class names inspired by the awesome tachyons - http://tachyons.io */\n')
    const newWindow = window.open('', '_blank')
    newWindow.document.body.innerHTML = `<pre>${css}</pre>`
  },
  render () {
    const { changeBaseColor, generateColors, generateCSS, state: { baseColor, scheme } } = this
    const complement = scheme && oneColor(scheme[2]).hue(0.5, true).saturation(Math.max(1 - oneColor(scheme[2]).saturation(), 0.2)).hex()
    return (
      <div className='flex flex-column items-center justify-center pa3 vh-100 mw-100'>
        <form className='measure mw-100' onSubmit={generateColors}>
          <label htmlFor='baseColor' className='dib mb1 black-80 f6 tracked-tight'>Base Colour</label>
          <div className='flex align-center justify-between'>
            <input name='baseColor' className='flex-auto tracked input-reset ba b--black-20 pa2 db' onChange={changeBaseColor} value={baseColor} />
            <button type='submit' className='flex-none bn dim dib f6 tracked-tight pointer near-white bg-black-80 br2 ba0 ph3 pv2 ml2'>Generate Scheme</button>
          </div>
        </form>
        {scheme
          ? <div className='mt5-ns mt3 flex flex-column flex-row-ns mw7 justify-around'>
            {scheme.map((color) => {
              const textColor = colorMeasure.luminance(oneColor(color)) * 3300 < 0.6 ? 'white' : 'black-80'
              return (
                <div key={color} className='w4 h3 h4-ns flex flex-column items-center justify-center' style={{ backgroundColor: color }}>
                  <div className={`${textColor} f6 tracked`}>{color}</div>
                </div>
              )
            })}
          </div>
          : null
        }
        {complement
          ? <div className='mt5-ns mt3 flex mw7 justify-around'>
            <div key={complement} className='w4 h3 h4-ns flex items-center justify-center' style={{ backgroundColor: complement }}>
              <div className='white f6 tracked'>{complement}</div>
            </div>
          </div>
          : null
        }
        {scheme
          ? <div className='mt5-ns mt3 center'>
            <a href='#' onClick={generateCSS} className='underline link dim pointer f5 black-80'>Get CSS</a>
          </div>
          : null
        }
        <div className='fixed-ns bottom-0 right-0 mt4 mh5 mb4-ns black-60'>
          Made by
          <a className='link dim pointer ml2' style={{color: '#50E3C2'}} href='https://tableflip.io'>
            <img className='h1' style={{marginBottom: '-2px'}} src='https://tableflip.io/img/tableflip.min.svg' /> TABLEFLIP
          </a>
        </div>
      </div>
    )
  }
})

export default App
