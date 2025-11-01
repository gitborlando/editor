import { Flex, Icon } from '@gitborlando/widget'
import {
  ComponentPropsWithRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import { createPortal } from 'react-dom'
import { useAutoSignal } from 'src/shared/signal/signal-react'
import { stopPropagation, useClickAway } from 'src/shared/utils/event'
import { iife } from 'src/shared/utils/normal'

export type IDropdown = ComponentPropsWithRef<'div'> & {
  options: string[]
  selected: string
  translateArray?: string[]
  isMulti?: boolean
  onSelected: (selected: string) => void
}

export const Dropdown = forwardRef<HTMLDivElement, IDropdown>((props, ref) => {
  const {
    options,
    selected,
    translateArray,
    isMulti,
    onSelected,
    className,
    ...rest
  } = props
  const innerRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLInputElement>(null)
  const show = useAutoSignal(false)
  const bound = { value: { x: 0, y: 0, width: 0, height: 0 } }
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
      className='justify-around wh-fit-28 r-2 pointer normalFont d-hover-bg px-6'
      onMouseDown={() => show.dispatch(!show.value)}
      {...rest}
      ref={innerRef}>
      {iife(() => {
        if (isMulti) return '多值'
        if (!translateArray) return selected
        const index = options.indexOf(selected)!
        return translateArray[index]
      })}
      <Icon
        className='wh-16'
        style={{ rotate: show.value ? '180deg' : '0deg' }}
        url={Assets.editor.leftPanel.page.collapse}
      />
      {show.value &&
        createPortal(
          <Flex
            ref={listRef}
            layout='v'
            className='bg-white rounded-2 fixed normalFont shadow-3-0-rgba(0,0,0,0.5)'
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
                className='h-100% px-6 d-hover-bg'
                style={{ width: bound.value.width, height: bound.value.height }}
                onMouseDown={stopPropagation(() => {
                  onSelected(option)
                  show.dispatch(false)
                })}>
                {translateArray?.[index] || option}
              </Flex>
            ))}
          </Flex>,
          document.querySelector('#draggable-portal')!,
        )}
    </Flex>
  )
})
