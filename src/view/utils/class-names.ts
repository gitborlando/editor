export function mergeClassNames(
  customClass: string,
  ...args: [...string[], Record<string, boolean>]
) {
  const baseClassNames = args.slice(0, -1).map((name) => `g-${name}`)
  const props = args[args.length - 1] as Record<string, boolean>
  const propsClassNames: string[] = []
  baseClassNames.forEach((name) => {
    Object.entries(props).forEach(([key, value]) => {
      if (Boolean(value)) propsClassNames.push(`${name}-${key}`)
    })
  })
  return [...baseClassNames, ...propsClassNames, customClass].join(' ')
}
