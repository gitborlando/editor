import { CSSProperties } from 'react'

interface IFont {
	color?: CSSProperties['color']
	fontSize?: number
	fontWeight?: number
}

function _font(color: CSSProperties['color']): IFont
function _font(color: CSSProperties['color'] | 'default', fontSize: number): IFont
function _font(color: CSSProperties['color'] | 'default', fontSize: number | 'default', fontWeight: number): IFont
function _font(
	color: CSSProperties['color'] | 'default',
	fontSize?: number | 'default',
	fontWeight?: number | 'default'
): IFont {
	return {
		...(color !== 'default' && { color }),
		...(fontSize && fontSize !== 'default' && { fontSize }),
		...(fontWeight && fontWeight !== 'default' && { fontWeight }),
	}
}

export const font = _font
