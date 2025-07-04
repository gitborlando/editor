export const hue$ = createSignal(280)

export const theme$ = createSignal({
  color: {
    primary: 'oklch(0.65 0.25 280)',
    border: 'oklch(0.90 0.03 280)',
    hover: 'oklch(0.95 0.03 280)',
    active: 'oklch(0.85 0.1 280)',
    disabled: 'oklch(0.98 0.00 280)',
    text: 'oklch(0.6 0.2 280)',
    background: 'oklch(0.96 0.00 280)',
    shadow: 'oklch(0.8 0.03 280)',
  },
})

hue$.hook((hue) => {
  theme$.value.color!.primary = `oklch(0.65 0.25 ${hue})`
  theme$.value.color!.border = `oklch(0.90 0.03 ${hue})`
  theme$.value.color!.hover = `oklch(0.95 0.03 ${hue})`
  theme$.value.color!.active = `oklch(0.85 0.1 ${hue})`
  theme$.value.color!.disabled = `oklch(0.98 0.00 ${hue})`
  theme$.value.color!.text = `oklch(0.6 0.2 ${hue})`
  theme$.value.color!.background = `oklch(0.96 0.00 ${hue})`
  theme$.value.color!.shadow = `oklch(0.8 0.03 ${hue})`
  theme$.dispatch()
})
