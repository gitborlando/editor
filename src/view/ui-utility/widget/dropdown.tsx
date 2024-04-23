import { ComponentPropsWithRef, forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useAutoSignal, useSignal } from '~/shared/signal-react'
import { stopPropagation, useClickAway } from '~/shared/utils/event'
import { iife } from '~/shared/utils/normal'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import Asset from '../assets'
import { Icon } from './icon'

export type IDropdown = ComponentPropsWithRef<'div'> & {
  options: string[]
  selected: string
  translateArray?: string[]
  onSelected: (selected: string) => void
}

export const Dropdown = forwardRef<HTMLDivElement, IDropdown>((props, ref) => {
  const { options, selected, translateArray, onSelected, className, ...rest } = props
  const { classes, cx } = useStyles({})
  const innerRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLInputElement>(null)
  const show = useAutoSignal(false)
  const bound = useSignal({ x: 0, y: 0, width: 0, height: 0 })
  useImperativeHandle(ref, () => innerRef.current!, [])
  useEffect(() => {
    if (!innerRef.current) return
    bound.value = innerRef.current?.getBoundingClientRect()
  }, [innerRef.current])
  useClickAway({
    when: () => show.value,
    insideTest: (dom) => dom === listRef.current,
    callback: () => show.dispatch(false),
  })
  return (
    <Flex
      layout='h'
      justify='space-between'
      className={cx(classes.Dropdown, className)}
      onMouseDown={() => show.dispatch(!show.value)}
      {...rest}
      ref={innerRef}>
      {iife(() => {
        if (!translateArray) return selected
        const index = options.findIndex((i) => i === selected)!
        return translateArray[index]
      })}
      <Icon size={16} rotate={show.value ? 180 : 0}>
        {Asset.editor.leftPanel.page.collapse}
      </Icon>
      {show.value &&
        createPortal(
          <Flex
            ref={listRef}
            layout='v'
            className={classes.list}
            style={{
              left: bound.value.x,
              top: bound.value.y,
              width: bound.value.width,
              transform: `translateY(${bound.value.height}px)`,
            }}>
            {options.map((option, index) => (
              <Flex
                key={option}
                layout='h'
                className='listItem'
                style={{ width: bound.value.width, height: bound.value.height }}
                onMouseDown={stopPropagation(() => {
                  onSelected(option)
                  show.dispatch(false)
                })}>
                {translateArray?.[index] || option}
              </Flex>
            ))}
          </Flex>,
          document.querySelector('#draggable-portal')!
        )}
    </Flex>
  )
})

type IDropdownStyle = {} /* & Required<Pick<IDropdown>> */ /* & Pick<IDropdown> */

const paddingInline = 6

const useStyles = makeStyles<IDropdownStyle>()((t) => ({
  Dropdown: {
    ...t.rect('fit-content', 28, 2),
    ...t.cursor('pointer'),
    ...t.default$.font.normal,
    ...t.default$.hover.background,
    paddingInline,
  },
  list: {
    borderRadius: 2,
    backgroundColor: 'white',
    ...t.fixed(),
    ...t.default$.font.normal,
    boxShadow: '0 0 3px -1px rgba(0,0,0,0.5)',
    '& .listItem': {
      height: '100%',
      paddingInline,
      ...t.default$.hover.background,
    },
  },
}))

Dropdown.displayName = 'Dropdown'
