import { FC, Fragment } from 'react'
import { OperateStroke } from 'src/editor/operate/stroke'
import { IStroke } from 'src/editor/schema/type'
import { useMatchPatch, useMemoComp } from 'src/shared/utils/react'
import Asset from 'src/view/ui-utility/assets'
import { IconButton } from 'src/view/ui-utility/widget/button/icon-button'
import { CompositeInput } from 'src/view/ui-utility/widget/compositeInput'
import { Divide } from 'src/view/ui-utility/widget/divide'
import { Dropdown } from 'src/view/ui-utility/widget/dropdown'
import { Flex } from 'src/view/ui-utility/widget/flex'
import { PickerOpener } from './picker/picker-opener'

export const StrokeComp: FC<{}> = ({}) => {
  const { strokes, addStroke, isMultiStrokes } = OperateStroke
  const hasStrokes = strokes.length > 0
  useMatchPatch('/?/strokes/...')

  const HeaderComp = useMemoComp([hasStrokes], ({}) => {
    return (
      <Flex className={`lay-h wh-100%-24 ${hasStrokes && 'mb-8'}`}>
        <Flex className='lay-c labelFont'>
          <h4>描边</h4>
        </Flex>
        <IconButton size={16} style={{ marginLeft: 'auto' }} onClick={addStroke}>
          {Asset.editor.leftPanel.page.add}
        </IconButton>
      </Flex>
    )
  })

  const StrokeListComp = useMemoComp<{ strokes: IStroke[] }>([], ({ strokes }) => {
    return strokes.map((stroke, index) =>
      index !== strokes.length - 1 ? (
        <Fragment key={index}>
          <StrokeItemComp key={index} stroke={stroke} index={index} />
          <Divide direction='h' margin={6} length={'95%'} thickness={0.2} bgColor='#E3E3E3' />
        </Fragment>
      ) : (
        <StrokeItemComp key={index} stroke={stroke} index={index} />
      )
    )
  })

  const StrokeItemComp = useMemoComp<{
    stroke: IStroke
    index: number
  }>([], ({ stroke, index }) => {
    const { afterOperate, setStroke, toggleStroke, deleteStroke } = OperateStroke

    return (
      <Flex className='lay-v wh-100%-fit'>
        <Flex className='wh-100%-28 mb-4'>
          <PickerOpener fill={stroke.fill} index={index} impact='stroke' />
          <IconButton
            size={16}
            style={{ marginLeft: 'auto' }}
            onClick={() => toggleStroke(index, ['visible'], !stroke.visible)}>
            {stroke.visible ? Asset.editor.shared.visible : Asset.editor.shared.unVisible}
          </IconButton>
          <IconButton size={16} onClick={() => deleteStroke(index)}>
            {Asset.editor.shared.minus}
          </IconButton>
        </Flex>
        <Flex className='wh-100%-28'>
          <CompositeInput
            className='wh-92-28-2 mr-4 px-6 d-hover-bg [&_.label]:w-28'
            label='粗细'
            needStepHandler={false}
            value={stroke.width.toString()}
            onNewValueApply={(width) => setStroke(index, ['width'], Number(width))}
            afterOperate={() => afterOperate.dispatch()}
          />
          <Dropdown
            className='wh-54-100%-2'
            selected={stroke.align}
            options={['inner', 'center', 'outer'] as const}
            onSelected={(selected) => toggleStroke(index, ['align'], selected as IStroke['align'])}
            translateArray={['内部', '居中', '外部']}
          />
        </Flex>
      </Flex>
    )
  })

  return (
    <Flex className='lay-v wh-100%-fit bg-white borderBottom p-8'>
      <HeaderComp />
      {isMultiStrokes ? (
        <Flex className='lay-c h-24 mt-8 mr-auto labelFont'>点击 + 重置并修改多个描边</Flex>
      ) : (
        <StrokeListComp strokes={strokes} />
      )}
    </Flex>
  )
}
