import { css } from '@linaria/core'
import CanvasKitInit, {
  CanvasKit,
  Canvas as CKCanvas,
  Surface,
} from 'canvaskit-wasm'
import { useEffect, useRef } from 'react'
import { classes } from 'src/view/styles/classes'

export const Test = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let ck: CanvasKit
    let surface: Surface
    let ctx: CKCanvas

    const init = async () => {
      // 初始化 CanvasKit
      ck = await CanvasKitInit({
        locateFile: (file) => '/node_modules/canvaskit-wasm/bin/' + file,
      })

      if (!canvasRef.current) return

      // 创建 WebGL Surface
      surface = ck.MakeWebGLCanvasSurface(canvasRef.current)!
      if (!surface) {
        console.error('Failed to create surface')
        return
      }

      ctx = surface.getCanvas()

      // 开始绘制
      draw()
    }

    const draw = () => {
      // 清除画布
      ctx.clear(ck.Color(255, 255, 255, 1))

      // 1. 绘制矩形
      const rectPaint = new ck.Paint()
      rectPaint.setColor(ck.Color(66, 133, 244, 1)) // 蓝色
      rectPaint.setStyle(ck.PaintStyle.Fill)
      rectPaint.setAntiAlias(true)
      ctx.drawRect(ck.XYWHRect(50, 50, 200, 100), rectPaint)
      rectPaint.delete()

      // 2. 绘制圆角矩形
      const rrectPaint = new ck.Paint()
      rrectPaint.setColor(ck.Color(234, 67, 53, 1)) // 红色
      rrectPaint.setStyle(ck.PaintStyle.Fill)
      rrectPaint.setAntiAlias(true)
      const rrect = ck.RRectXY(ck.XYWHRect(300, 50, 200, 100), 20, 20)
      ctx.drawRRect(rrect, rrectPaint)
      rrectPaint.delete()

      // 3. 绘制圆形
      const circlePaint = new ck.Paint()
      circlePaint.setColor(ck.Color(251, 188, 5, 1)) // 黄色
      circlePaint.setStyle(ck.PaintStyle.Fill)
      circlePaint.setAntiAlias(true)
      ctx.drawCircle(150, 250, 60, circlePaint)
      circlePaint.delete()

      // 4. 绘制描边圆形
      const strokePaint = new ck.Paint()
      strokePaint.setColor(ck.Color(52, 168, 83, 1)) // 绿色
      strokePaint.setStyle(ck.PaintStyle.Stroke)
      strokePaint.setStrokeWidth(8)
      strokePaint.setAntiAlias(true)
      ctx.drawCircle(350, 250, 60, strokePaint)
      strokePaint.delete()

      // 5. 绘制路径
      const path = new ck.Path()
      path.moveTo(100, 350)
      path.lineTo(200, 350)
      path.lineTo(150, 420)
      path.close()

      const pathPaint = new ck.Paint()
      pathPaint.setColor(ck.Color(156, 39, 176, 1)) // 紫色
      pathPaint.setStyle(ck.PaintStyle.Fill)
      pathPaint.setAntiAlias(true)
      ctx.drawPath(path, pathPaint)
      path.delete()
      pathPaint.delete()

      // 6. 绘制渐变矩形
      const gradientPaint = new ck.Paint()
      const shader = ck.Shader.MakeLinearGradient(
        [300, 350],
        [500, 350],
        [
          ck.Color(255, 0, 0, 1),
          ck.Color(255, 255, 0, 1),
          ck.Color(0, 255, 0, 1),
          ck.Color(0, 255, 255, 1),
          ck.Color(0, 0, 255, 1),
        ],
        [0, 0.25, 0.5, 0.75, 1],
        ck.TileMode.Clamp,
      )
      gradientPaint.setShader(shader)
      gradientPaint.setAntiAlias(true)
      ctx.drawRect(ck.XYWHRect(300, 320, 200, 80), gradientPaint)
      shader.delete()
      gradientPaint.delete()

      // 7. 绘制阴影效果
      ctx.save()
      const shadowPaint = new ck.Paint()
      shadowPaint.setColor(ck.Color(0, 0, 0, 0.3))
      shadowPaint.setMaskFilter(ck.MaskFilter.MakeBlur(ck.BlurStyle.Normal, 5, true))
      ctx.translate(5, 5)
      ctx.drawRRect(ck.RRectXY(ck.XYWHRect(50, 450, 150, 80), 10, 10), shadowPaint)
      ctx.restore()
      shadowPaint.delete()

      // 绘制主体
      const mainPaint = new ck.Paint()
      mainPaint.setColor(ck.Color(255, 255, 255, 1))
      mainPaint.setStyle(ck.PaintStyle.Fill)
      mainPaint.setAntiAlias(true)
      ctx.drawRRect(ck.RRectXY(ck.XYWHRect(50, 450, 150, 80), 10, 10), mainPaint)
      mainPaint.delete()

      // 刷新 surface
      surface.flush()
    }

    init()

    // 清理资源
    return () => {
      if (surface) {
        surface.delete()
      }
    }
  }, [])

  return (
    <div className={cls()}>
      <h2>CanvasKit 最小实现示例</h2>
      <canvas ref={canvasRef} width={600} height={600} className={canvasCls()} />
    </div>
  )
}

const cls = classes(css`
  padding: 20px;
  h2 {
    margin-bottom: 20px;
    color: #333;
  }
`)

const canvasCls = classes(css`
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
`)
