import { Rule, defineConfig, presetUno, transformerCompileClass } from 'unocss'

const widthHeightRadius: Rule<object> = [
  /wh-([^-]+)-([^-]+)-?([^-]+)?/,
  ([_, w, h, r]) => ({
    width: normal(w),
    height: normal(h),
    ...(r && { 'border-radius': normal(r) }),
  }),
]

const marginAuto: Rule<object> = [
  /mAuto-(r|t|b|l)/,
  ([_, direct]) => ({ [`margin-${normal(direct)}`]: 'auto' }),
]

const backgroundColor: Rule<object> = [
  /bg-([^-]+)/,
  ([_, color]) => ({ 'background-color': normalColor(color) }),
]

const border: Rule<object> = [
  /b-(\d+)-([^-]+)/,
  ([_, width, color]) => ({ border: `${width}px solid ${normalColor(color)}` }),
]

const boxShadow: Rule<object> = [
  /shadow-(\d+)-(\d+)-(.+)/,
  ([_, x, y, color]) => ({ 'box-shadow': `0px 0px ${x}px ${y}px ${normal(color)}` }),
]

const cursorPointer: Rule<object> = [/pointer/, () => ({ cursor: 'pointer' })]

const labelFont: Rule<object> = [/labelFont/, () => ({ 'font-size': '11px', color: '#626262' })]
const normalFont: Rule<object> = [/normalFont/, () => ({ 'font-size': '12px' })]

const borderBottom: Rule<object> = [/borderBottom/, () => ({ border: '1px solid #E3E3E3' })]

export default defineConfig({
  presets: [presetUno()],
  transformers: [transformerCompileClass()],
  rules: [
    widthHeightRadius,
    marginAuto,
    backgroundColor,
    border,
    cursorPointer,
    labelFont,
    normalFont,
    borderBottom,
    boxShadow,
  ],
  postprocess: [
    (obj) => {
      if (/-[\d]+\W?$/g.test(obj.selector) === false) {
        return obj
      }
      obj.entries.forEach((i) => {
        const value = i[1]
        if (typeof value === 'string' && /(-?[\.\d]+)rem/g.test(value)) {
          i[1] = value.replace(/(-?[\.\d]+)rem/g, (_, p1) => `${p1 / 4}rem`)
        }
      })
    },
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
  if (!/\D/.test(val)) return `hsl(217 100 ${val})`
  return val
}

function testRule(rule: any, test: string) {
  const result = rule[0].exec(test)
  if (result) {
    console.log(rule[1](result))
  }
}

//testRule(widthHeightRadius, 'wh-20-20-99')
