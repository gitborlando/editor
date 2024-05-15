import { FC, useRef } from 'react'
import { ITextStyleKey, OperateText } from '~/editor/operate/text'
import { Schema } from '~/editor/schema/schema'
import { IText } from '~/editor/schema/type'
import { StageViewport } from '~/editor/stage/viewport'
import { useHookSignal } from '~/shared/signal/signal-react'
import { useDownUpTracker } from '~/shared/utils/event'
import { iife } from '~/shared/utils/normal'
import { useMemoComp } from '~/shared/utils/react'
import { DraggableComp } from '~/view/component/draggable'
import { makeStyles } from '~/view/ui-utility/theme'
import { CompositeInput } from '~/view/ui-utility/widget/compositeInput'
import { Dropdown } from '~/view/ui-utility/widget/dropdown'
import { Flex } from '~/view/ui-utility/widget/flex'

type ITextComp = {}

export const TextComp: FC<ITextComp> = ({}) => {
  const { classes, theme: t, css, cx } = useStyles({})
  const { intoEditing, textStyle, textStyleOptions, setTextStyle, toggleTextStyle, afterOperate } =
    OperateText
  const createDownUpTracker = (elFunc: () => HTMLElement | null, key: ITextStyleKey) => {
    useDownUpTracker(elFunc, () => {}, afterOperate.dispatch)
  }

  useHookSignal(intoEditing)

  const HeaderComp = useMemoComp([], ({}) => {
    return (
      <Flex layout='h' className={classes.header}>
        <Flex layout='c' className={classes.title}>
          <h4>文本</h4>
        </Flex>
      </Flex>
    )
  })

  const TextEditComp = useMemoComp([{}], ({}) => {
    const { setTextContent } = OperateText
    const textNode = Schema.find<IText>(intoEditing.value)
    const xy = iife(() => {
      const { x, y, width } = textNode
      return StageViewport.sceneStageToClientXY({ x: x + width, y })
    })

    return (
      <DraggableComp
        xy={xy}
        headerSlot={<h6>编辑文本</h6>}
        clickAwayClose={() => !!intoEditing.value}
        closeFunc={() => {
          intoEditing.dispatch('')
          afterOperate.dispatch()
        }}>
        <Flex layout='v' className={classes.textArea}>
          <textarea
            className={'input'}
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
      <Flex layout='h' className={classes.fontSizeWeight}>
        <CompositeInput
          className='size'
          ref={inputRef}
          label='大小'
          value={fontSize.toString()}
          onNewValueApply={(value) => setTextStyle('fontSize', Number(value))}
          afterOperate={() => afterOperate.dispatch()}
        />
        <Dropdown
          className='weight'
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
      <Flex layout='h' className={css({ width: '100%' })}>
        <Dropdown
          className={css({ width: 80 })}
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
    <Flex layout='v' sidePadding={6} className={classes.Text}>
      <HeaderComp />
      {intoEditing.value && <TextEditComp />}
      <FontSizeWeightComp />
      <FontAlignComp />
    </Flex>
  )
}

type ITextCompStyle = {} /* & Required<Pick<ITextComp>> */ /* & Pick<ITextComp> */

const useStyles = makeStyles<ITextCompStyle>()((t) => ({
  Text: {
    ...t.rect('100%', 'fit-content', 'no-radius', 'white'),
    ...t.default$.borderBottom,
    padding: 8,
  },
  header: {
    ...t.rect('100%', 24),
    marginBottom: 8,
  },
  title: {
    ...t.labelFont,
  },
  textArea: {
    ...t.rect('100%', 200),
    '& .input': {
      ...t.rect('100%', 200),
      fontSize: 14,
      padding: 4,
      resize: 'none',
      outline: 'none',
      border: 'none',
    },
  },
  fontSizeWeight: {
    width: '100%',
    marginBottom: 4,
    '& .size': {
      marginRight: 4,
    },
    '& .weight': {
      width: 69,
    },
  },
}))

TextComp.displayName = 'TextComp'
