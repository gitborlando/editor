import { FC, memo } from 'react'
import { theme$ } from 'src/global/theme'
import { matchCase } from 'src/shared/utils/normal'
import { Flex } from 'src/view/component/flex/flex'

export const CompTestComp: FC<{}> = memo(({}) => {
  return (
    <Flex layout='v' gap={6} className='wh-400-fit bd-1-gray px-10'>
      {Object.entries(theme$.value.color!).map(([key, value]) =>
        matchCase(key, {
          primary: (
            <Flex
              layout='h'
              key={key}
              block='x'
              className='h-100'
              style={{ backgroundColor: value }}>
              {key}
              {value}
            </Flex>
          ),
          border: (
            <Flex
              layout='h'
              key={key}
              block='x'
              className='h-100'
              style={{ border: `1px solid ${value}` }}>
              {key}
              {value}
            </Flex>
          ),
          hover: (
            <Flex
              layout='h'
              key={key}
              block='x'
              className='h-100'
              style={{ backgroundColor: value }}>
              {key}
              {value}
            </Flex>
          ),
          active: (
            <Flex
              layout='h'
              key={key}
              block='x'
              className='h-100'
              style={{ backgroundColor: value }}>
              {key}
              {value}
            </Flex>
          ),
          disabled: (
            <Flex
              layout='h'
              key={key}
              block='x'
              className='h-100'
              style={{ backgroundColor: value }}>
              {key}
              {value}
            </Flex>
          ),
          text: (
            <Flex layout='h' key={key} block='x' className='h-100' style={{ color: value }}>
              {key}
              {value}
            </Flex>
          ),
          background: (
            <Flex
              layout='h'
              key={key}
              block='x'
              className='h-100'
              style={{ backgroundColor: value }}>
              {key}
              {value}
            </Flex>
          ),
          shadow: (
            <Flex
              layout='h'
              key={key}
              block='x'
              className='h-100'
              style={{ boxShadow: `0 0 10px ${value}` }}>
              {key}
              {value}
            </Flex>
          ),
        })
      )}
    </Flex>
  )
})
