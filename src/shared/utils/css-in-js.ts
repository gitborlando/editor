import { useMemo, useRef } from 'react'
import { createCache } from './cache'

const cssInJsCache = createCache<
  string,
  {
    styleElement: HTMLStyleElement
    contents: Record<string, string>
    count: number
  }
>()

export function useCssInJs(
  deps: any[],
  content: () => string,
  option?: { styleTagName?: string; classNamePrefix?: string }
) {
  const cssInJs = cssInJsCache.getSet(option?.styleTagName || 'default', () => {
    const styleTag = document.createElement('style')
    document.head.appendChild(styleTag)
    return { styleElement: styleTag, contents: {}, count: 0 }
  })
  const index = useRef(cssInJs.count++).current
  const className = `${option?.classNamePrefix || 'default'}-${index}`

  useMemo(() => {
    cssInJs.contents[className] = `.${className} ${content()}`
    cssInJs.styleElement.innerHTML = `@layer cssInJs {\n ${Object.values(cssInJs.contents).join(
      '\n'
    )}\n}`
  }, deps)

  return className
}
