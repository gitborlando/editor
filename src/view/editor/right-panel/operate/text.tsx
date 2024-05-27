import { FC, useRef } from 'react'
import { ITextStyleKey, OperateText } from 'src/editor/operate/text'
import { Schema } from 'src/editor/schema/schema'
import { IText } from 'src/editor/schema/type'
import { StageViewport } from 'src/editor/stage/viewport'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { useDownUpTracker } from 'src/shared/utils/event'
import { iife } from 'src/shared/utils/normal'
import { useMatchPatch, useMemoComp } from 'src/shared/utils/react'
import { DraggableComp } from 'src/view/component/draggable'
import { CompositeInput } from 'src/view/ui-utility/widget/compositeInput'
import { Dropdown } from 'src/view/ui-utility/widget/dropdown'
import { Flex } from 'src/view/ui-utility/widget/flex'

export const TextComp: FC<{}> = ({}) => {
  const { intoEditing, textStyle, textStyleOptions, setTextStyle, toggleTextStyle, afterOperate } =
    OperateText
  const createDownUpTracker = (elFunc: () => HTMLElement | null, key: ITextStyleKey) => {
    useDownUpTracker(elFunc, () => {}, afterOperate.dispatch)
  }

  useHookSignal(intoEditing)
  useMatchPatch('/?/content')
  useMatchPatch('/?/style/...')

  const HeaderComp = useMemoComp([], ({}) => {
    return (
      <Flex className='lay-h wh-100%-24 mb-8'>
        <Flex className='lay-c labelFont'>
          <h4>文本</h4>
        </Flex>
      </Flex>
    )
  })

  const TextEditComp = useMemoComp([], ({}) => {
    const { setTextContent } = OperateText
    const textNode = Schema.find<IText>(intoEditing.value)
    const xy = iife(() => {
      const { x, y, width } = textNode
      return StageViewport.sceneStageToClientXY({ x: x + width, y })
    })
    useMatchPatch(`/${textNode.id}/content`)

    return (
      <DraggableComp
        xy={xy}
        headerSlot={<h6>编辑文本</h6>}
        clickAwayClose={() => !!intoEditing.value}
        closeFunc={() => {
          intoEditing.dispatch('')
          afterOperate.dispatch()
        }}>
        <Flex className='lay-v wh-100%-200'>
          <textarea
            className='wh-100%-200 font-size-14 p-4 resize-none outline-none border-none'
            value={textNode.content}
            onChange={(e) => setTextContent(textNode, e.target.value)}></textarea>
        </Flex>
      </DraggableComp>
    )
  })

  const { fontSize, fontWeight } = textStyle
  const FontSizeWeightComp = useMemoComp([fontSize, fontWeight], ({}) => {
    const inputRef = useRef<HTMLDivElement>(null)
    createDownUpTracker(() => inputRef.current, 'fontSize')
    return (
      <Flex className='lay-h w-100% mb-4'>
        <CompositeInput
          className='mr-4'
          ref={inputRef}
          label='大小'
          value={fontSize.toString()}
          onNewValueApply={(value) => setTextStyle('fontSize', Number(value))}
          afterOperate={() => afterOperate.dispatch()}
        />
        <Dropdown
          className='w-69'
          selected={fontWeight}
          options={textStyleOptions.fontWeight}
          onSelected={(value) => toggleTextStyle('fontWeight', value)}
        />
      </Flex>
    )
  })

  const { align, lineHeight } = textStyle
  const FontAlignComp = useMemoComp([align, lineHeight], ({}) => {
    return (
      <Flex className='lay-h w-100%'>
        <Dropdown
          className='w-80'
          selected={align}
          options={textStyleOptions.align} //@ts-ignore
          isMulti={align === 'multi'}
          translateArray={['左对齐', '居中对齐', '右对齐']}
          onSelected={(value) => toggleTextStyle('align', value)}
        />
        <CompositeInput
          className='size'
          label='行高'
          value={lineHeight.toString()}
          onNewValueApply={(value) => setTextStyle('lineHeight', Number(value))}
          afterOperate={() => afterOperate.dispatch()}
        />
      </Flex>
    )
  })

  return (
    <Flex className='lay-v wh-100%-fit bg-white borderBottom p-8'>
      <HeaderComp />
      {intoEditing.value && <TextEditComp />}
      <FontSizeWeightComp />
      <FontAlignComp />
    </Flex>
  )
}
