import unoPresetGitborlando from '@gitborlando/uno-preset'
import presetRemToPx from '@unocss/preset-rem-to-px'
import {
  Rule,
  defineConfig,
  presetUno,
  toEscapedSelector,
  transformerCompileClass,
  transformerVariantGroup,
} from 'unocss'

const theme = (() => {
  const hslObj = Object.fromEntries(
    new Array(100).fill(0).map((_, i) => [`hsl${i}`, `hsl(var(--hue) 100 ${i})`])
  )
  return {
    colors: { ...hslObj },
  }
})()

const defaultHover: Rule<object> = [
  /d-hover-(bg|border)/,
  ([_, type], { rawSelector }) => {
    if (type === 'bg')
      return `${toEscapedSelector(rawSelector)}:hover { background-color: rgba(138,138,138,0.13) }`
    if (type === 'border') {
      return (
        `@layer widget { ${toEscapedSelector(rawSelector)} { border: 1px solid transparent; } }\n` +
        `${toEscapedSelector(rawSelector)}:hover { border: 1px solid hsl(217 100 50) }`
      )
    }
  },
]

const defaultFont: Rule<object> = [
  /d-font-(label)/,
  ([_, type], { rawSelector }) => {
    const css = (() => {
      if (type === 'label') return `font-size: 11px; color: #626262`
    })()
    return `${toEscapedSelector(rawSelector)} { ${css} }`
  },
]

const defaultScrollBar: Rule<object> = [
  /d-scroll-?(.+)?/,
  ([_, override], { rawSelector }) => {
    const selector = toEscapedSelector(rawSelector)
    return `
      ${selector}::-webkit-scrollbar { width: 4px; height: 4px }
      ${selector}::-webkit-scrollbar-thumb { background: rgba(204, 204, 204, 0.5) }`
  },
]

const gap: Rule<object> = [/gap-(\d+)-(\d+)/, ([_, x, y]) => ({ gap: `${x}px ${y}px` })]

const labelFont: Rule<object> = [/labelFont/, () => ({ 'font-size': '11px', color: '#626262' })]
const normalFont: Rule<object> = [/normalFont/, () => ({ 'font-size': '12px' })]

const borderBottom: Rule<object> = [
  /borderBottom/,
  () => ({ 'border-bottom': '1px solid #E3E3E3' }),
]

const defaultInput: Rule<object> = [
  /d-input/,
  () => ({ border: 'none', outline: 'none', 'background-color': 'transparent' }),
]

const pathFill: Rule<object> = [
  /path-fill-(.+)/,
  ([_, color], { rawSelector }) => {
    return `${toEscapedSelector(rawSelector)} path { fill: ${normalColor(color)} }`
  },
]

export default defineConfig({
  theme,
  presets: [presetUno(), presetRemToPx({ baseFontSize: 4 }), unoPresetGitborlando()],
  transformers: [transformerCompileClass(), transformerVariantGroup()],
  rules: [
    labelFont,
    normalFont,
    borderBottom,
    gap,
    defaultHover,
    defaultScrollBar,
    defaultInput,
    defaultFont,
    pathFill,
  ],
})

function normalColor(val: string) {
  if (theme.colors[val]) return theme.colors[val]
  return val
}
