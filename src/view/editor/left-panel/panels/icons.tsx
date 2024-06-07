import { FC, memo, useMemo, useState } from 'react'
import { InView } from 'react-intersection-observer'
import usePromise from 'react-promise-suspense'
import { useAutoSignal, useHookSignal } from 'src/shared/signal/signal-react'
import { createCache } from 'src/shared/utils/cache'
import { hslBlueColor } from 'src/shared/utils/color'
import { IAnyObject } from 'src/shared/utils/normal'
import { useMemoComp, withSuspense } from 'src/shared/utils/react'
import { Flex } from 'src/view/ui-utility/widget/flex'

type IIconsComp = {}

const categoryLengthCache = createCache<string, number>()

export const IconsComp: FC<IIconsComp> = memo(({}) => {
  const IconsContentComp = ({}) => {
    const categories = ['arco-design', 'iconpark']
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
      const svgSource = usePromise<[string], IAnyObject>(
        (url) => fetch(url).then((res) => res.json()),
        [`https://nvvxaxp63w.bja.sealos.run/get/icons/list?category=${curCategory}`]
      ).Contents

      const length = useAutoSignal(categoryLengthCache.get(curCategory))
      const icons = Object.entries<any>(svgSource).slice(0, length.value)
      useHookSignal(length, (len) => categoryLengthCache.set(curCategory, len))

      return (
        <Flex className={'wh-100%-fit lay-h flex-wrap of-y-auto px-6 gap-10-10 d-scroll'}>
          {icons.map(([name, path]) => (
            <SvgComp key={path.Key} name={name} path={path.Key} />
          ))}
          <InView
            className='wh-100%-30 '
            onChange={(inView) => inView && length.dispatch(length.value + 40)}></InView>
        </Flex>
      )
    })

    const SvgComp = useMemoComp<{ name: string; path: string }>([], ({ name, path }) => {
      const SvgContentComp = useMemoComp([], ({}) => {
        const svgUrl = usePromise<[string], string>(
          (url) => fetch(url).then((res) => res.text()),
          [`https://nvvxaxp63w.bja.sealos.run/get/icons/url?path=${path}`]
        )
        const svgStr = usePromise<[string], string>(
          (url) => fetch(url).then((res) => res.text()),
          [svgUrl]
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
