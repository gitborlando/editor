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
  const hslB = Object.fromEntries(
    new Array(100).fill(0).map((_, i) => [`hslb${i}`, `hsl(217 100 ${i})`])
  )
  return {
    colors: { ...hslB },
  }
})()

const widthHeightRadius: Rule<object> = [
  /wh-([^-]+)-?([^-]+)?-?([^-]+)?/,
  ([_, w, h, r]) => ({
    width: normal(w),
    height: normal(h ?? w),
    ...(r && { 'border-radius': normal(r) }),
  }),
]

const layout: Rule<object> = [
  /lay-(h|v|c)/,
  ([_, d]) => {
    if (d === 'h') return { 'align-items': 'center' }
    if (d === 'v') return { 'align-items': 'center', 'flex-direction': 'column' }
    if (d === 'c') return { 'align-items': 'center', 'justify-content': 'center' }
  },
]

const border: Rule<object> = [
  /b-(\d+)-([^-]+)-?(t|r|b|l)?/,
  ([_, width, color, direction]) => ({
    [`border${direction ? `-${normal(direction)}` : ''}`]: `${width}px solid ${normalColor(color)}`,
  }),
]

const boxShadow: Rule<object> = [
  /shadow-(\d+)-(\d+)-([^-]+)-?(inset)?/,
  ([_, x, y, color, inset]) => ({
    'box-shadow': `${inset || ''} 0px 0px ${x}px ${y}px ${normal(color)}`,
  }),
]

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

const cursorPointer: Rule<object> = [/pointer/, () => ({ cursor: 'pointer' })]

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
  presets: [presetUno(), presetRemToPx({ baseFontSize: 4 })],
  transformers: [transformerCompileClass(), transformerVariantGroup()],
  rules: [
    widthHeightRadius,
    layout,
    border,
    cursorPointer,
    labelFont,
    normalFont,
    borderBottom,
    boxShadow,
    gap,
    defaultHover,
    defaultScrollBar,
    defaultInput,
    defaultFont,
    pathFill,
  ],
})

function normal(val: string) {
  if (val === 'r') return 'right'
  if (val === 'l') return 'left'
  if (val === 't') return 'top'
  if (val === 'b') return 'bottom'
  if (val === 'fit') return 'fit-content'
  if (!/\D/.test(val)) return val + 'px'
  return val
}

function normalColor(val: string) {
  if (theme.colors[val]) return theme.colors[val]
  return val
}
