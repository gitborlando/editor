import { ElementNode, parse as svgParser } from 'svg-parser'
import { OperateNode } from '~/editor/operate/node'
import { SchemaDefault } from '~/editor/schema/default'
import { IFrame, INode, INodeParent } from '~/editor/schema/type'
import { normalizeColor } from '~/shared/utils/color'

type ISvgProps = {
  x?: number
  y?: number
  cx?: number
  cy?: number
  rx?: number
  ry?: number
  r?: number
  width?: number
  height?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  strokeLinejoin?: string
}

type SvgNode = ElementNode & { properties: ISvgProps }

const parsed = svgParser(`
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="216.23065185546875" height="212.7095947265625" viewBox="0 0 216.23065185546875 212.7095947265625" fill="none">
<path d="M106.031 204.708L128.18 121.163L208.229 103.288L7.53156 7.53088L106.031 204.708Z" stroke="rgba(0, 13, 255, 1)" stroke-width="16" stroke-linejoin="round"  >
</path>
</svg>

`)

// const __dirname = path.dirname(fileURLToPath(import.meta.url))
// const rootDir = path.resolve(__dirname, '')
// writeFileSync(path.resolve(rootDir, 'parsed.json'), JSON.stringify(parsed, null, 2))

export function parseSvg(svg: string) {
  const svgNode = svgParser(svg).children[0] as SvgNode
  return parseSvgNode(svgNode, svgNode)
}

function parseSvgNode(svgNode: SvgNode, parentSvgNode: SvgNode, parentNode?: INodeParent) {
  inheritParentProps(svgNode.properties, parentSvgNode.properties)

  let node!: INode
  const { tagName, properties, children } = svgNode
  const { x, y, rx, cx, cy, r, width, height } = properties
  const { fill } = properties
  const { stroke, strokeWidth, strokeLinejoin } = properties

  if (tagName === 'svg') {
    node = SchemaDefault.frame({ width, height })
  }
  if (tagName === 'rect') {
    node = SchemaDefault.rect({ x, y, width, height })
    if (r) node.radius = r
  }
  if (tagName === 'circle') {
    const [x, y] = [cx! - r!, cy! - r!]
    node = SchemaDefault.ellipse({ x, y, width: r! * 2, height: r! * 2 })
  }
  if (tagName === 'path') {
    node = SchemaDefault.rect()
  }

  node.fills = []
  if (fill && fill !== 'none') {
    const solidColor = normalizeColor(fill)
    const fillColor = SchemaDefault.fillColor(solidColor.color, solidColor.alpha)
    node.fills = [fillColor]
  }

  if (stroke && stroke !== 'none') {
    const solidColor = normalizeColor(stroke)
    const strokeColor = SchemaDefault.fillColor(solidColor.color, solidColor.alpha)
    const nodeStroke = SchemaDefault.stroke({ width: strokeWidth })
    node.strokes = [nodeStroke]
  }

  OperateNode.addNodes([node])
  if (parentNode) OperateNode.insertAt(parentNode, node)

  children.forEach((child) => {
    parseSvgNode(child as SvgNode, svgNode, node as INodeParent)
  })

  return node as IFrame
}

function inheritParentProps(props: ISvgProps, parentProps: ISvgProps) {
  if (!props.fill) props.fill = parentProps.fill
  if (!props.stroke) props.stroke = parentProps.stroke
  if (!props.strokeWidth) props.strokeWidth = parentProps.strokeWidth
  if (!props.strokeLinejoin) props.strokeLinejoin = parentProps.strokeLinejoin
}
