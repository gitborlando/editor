import { FC, memo, useMemo, useState } from 'react'
import { InView } from 'react-intersection-observer'
import usePromise from 'react-promise-suspense'
import { useAutoSignal, useHookSignal } from '~/shared/signal/signal-react'
import { createCache } from '~/shared/utils/cache'
import { hslBlueColor } from '~/shared/utils/color'
import { IAnyObject } from '~/shared/utils/normal'
import { useMemoComp, withSuspense } from '~/shared/utils/react'
import { Flex } from '~/view/ui-utility/widget/flex'

type IIconsComp = {}

const staticHost = 'http://103.103.201.42:17937'

const categoryLengthCache = createCache<string, number>()

export const IconsComp: FC<IIconsComp> = memo(({}) => {
  const IconsContentComp = ({}) => {
    const svgSource = usePromise<[string], IAnyObject>(
      (url) => fetch(url).then((res) => res.json()),
      [staticHost + '/svg-source/list.json']
    )
    const categories = Object.keys(svgSource)
    const [curCategory, setCurCategory] = useState(categories[0])

    useMemo(() => {
      categories.forEach((category) => categoryLengthCache.getSet(category, () => 60))
    }, [])

    const CategoryComp = useMemoComp([curCategory], () => {
      return (
        <Flex className={'lay-h wh-100%-fit px-10 gap-6-6 pointer'}>
          {categories.map((category) => {
            const selectCss = curCategory === category && { color: hslBlueColor(60) }
            return (
              <Flex
                key={category}
                className='lay-h wh-fit-fit-5 bg-[#F5F5F5] p-6 my-10 normalFont'
                style={{ ...selectCss }}
                onClick={() => setCurCategory(category)}>
                {category}
              </Flex>
            )
          })}
        </Flex>
      )
    })

    const SvgListComp = useMemoComp([curCategory], ({}) => {
      const length = useAutoSignal(categoryLengthCache.get(curCategory))
      const icons = Object.entries<string>(svgSource[curCategory]).slice(0, length.value)
      useHookSignal(length, (len) => categoryLengthCache.set(curCategory, len))

      return (
        <Flex className={'wh-100%-fit lay-h flex-wrap of-y-auto px-6 gap-10-10 d-scroll'}>
          {icons.map(([name, path]) => (
            <SvgComp key={path} name={name} path={path} />
          ))}
          <InView
            className='wh-100%-30 '
            onChange={(inView) => inView && length.dispatch(length.value + 40)}></InView>
        </Flex>
      )
    })

    const SvgComp = useMemoComp<{ name: string; path: string }>([], ({ name, path }) => {
      const SvgContentComp = useMemoComp([], ({}) => {
        const svgStr = usePromise<[string], string>(
          (url) => fetch(url).then((res) => res.text()),
          [`${staticHost}/svg-source${path}`]
        )
        const onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
          e.dataTransfer.setData(
            'text/plain',
            JSON.stringify({ event: 'dropSvg', data: { svgStr, name } })
          )
        }
        return (
          <Flex
            draggable
            className={'lay-c wh-48-48-5 d-hover-bg pointer'}
            onDragStart={onDragStart}>
            <Flex className='lay-c' dangerouslySetInnerHTML={{ __html: svgStr }} />
          </Flex>
        )
      })
      return withSuspense(<SvgContentComp />)
    })

    return (
      <Flex className={'lay-v wh-100%-100% bg-white'}>
        <CategoryComp />
        <SvgListComp />
      </Flex>
    )
  }

  return withSuspense(<IconsContentComp />)
})
