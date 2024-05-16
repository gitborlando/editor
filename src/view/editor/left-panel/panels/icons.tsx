import { FC, memo, useMemo, useState } from 'react'
import { InView } from 'react-intersection-observer'
import usePromise from 'react-promise-suspense'
import { useAutoSignal, useHookSignal } from '~/shared/signal/signal-react'
import { createCache } from '~/shared/utils/cache'
import { hslBlueColor } from '~/shared/utils/color'
import { IAnyObject } from '~/shared/utils/normal'
import { useMemoComp, withSuspense } from '~/shared/utils/react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'

type IIconsComp = {}

const staticHost = 'http://103.103.201.42:17937'

const categoryLengthCache = createCache<string, number>()

export const IconsComp: FC<IIconsComp> = memo(({}) => {
  const IconsContentComp = ({}) => {
    const { classes } = useStyles({})
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
        <Flex layout='h' className={classes.categories}>
          {categories.map((category) => {
            const selectCss = curCategory === category && { color: hslBlueColor(60) }
            return (
              <Flex
                key={category}
                layout='h'
                className='category'
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
        <Flex layout='h' className={classes.list}>
          {icons.map(([name, path]) => (
            <SvgComp key={path} name={name} path={path} />
          ))}
          <InView
            style={{ width: '100%', height: 30 }}
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
          <Flex draggable layout='c' className={classes.svg} onDragStart={onDragStart}>
            <Flex layout='c' dangerouslySetInnerHTML={{ __html: svgStr }} />
          </Flex>
        )
      })
      return withSuspense(<SvgContentComp />)
    })

    return (
      <Flex layout='v' className={classes.Icons}>
        <CategoryComp />
        <SvgListComp />
      </Flex>
    )
  }

  return withSuspense(<IconsContentComp />)
})

type IIconsCompStyle = {} /* & Required<Pick<IIconsComp>> */ /* & Pick<IIconsComp> */

const useStyles = makeStyles<IIconsCompStyle>()((t) => ({
  Icons: {
    ...t.rect('100%', '100%', 'no-radius', 'white'),
  },
  categories: {
    ...t.rect('100%', 'fit-content', 'no-radius'),
    paddingInline: 6,
    gap: '6px 6px',
    cursor: 'pointer',
    '& .category': {
      ...t.rect('fit-content', 'fit-content', 5, '#F5F5F5'),
      padding: 6,
      marginBlock: 10,
      ...t.default$.font.normal,
    },
  },
  list: {
    ...t.rect('100%', 'fit-content', 'no-radius'),
    flexWrap: 'wrap',
    overflowY: 'auto',
    ...t.default$.scrollBar,
    paddingInline: 6,
    gap: '10px 10px',
  },
  svg: {
    ...t.rect(48, 48, 5),
    ...t.default$.hover.background,
    cursor: 'pointer',
  },
}))

IconsComp.displayName = 'IconsComp'
