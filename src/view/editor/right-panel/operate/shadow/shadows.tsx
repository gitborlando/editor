import { FC, memo } from 'react'
import { OperateShadow } from '~/editor/operate/shadow'
import { IShadow } from '~/editor/schema/type'
import { useHookSignal } from '~/shared/signal/signal-react'
import { useSubComponent } from '~/shared/utils/normal'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { IconButton } from '~/view/ui-utility/widget/button/icon-button'
import { Divide } from '~/view/ui-utility/widget/divide'
import { Flex } from '~/view/ui-utility/widget/flex'
import { ShadowItemComp } from './shadow-item'

type IShadowComp = {}

export const ShadowComp: FC<IShadowComp> = memo(({}) => {
  const { shadows, isShadowsArray, addShadow } = OperateShadow
  const { classes, css, cx } = useStyles({})
  const hasShadows = isShadowsArray(shadows.value) && shadows.value.length > 0
  useHookSignal(shadows)

  const HeaderComp = useSubComponent([hasShadows], ({}) => {
    const hasShadowsStyle = hasShadows && css({ marginBottom: 8 })
    return (
      <Flex layout='h' className={cx(classes.header, hasShadowsStyle)}>
        <Flex layout='c' className={classes.title}>
          <h4>阴影</h4>
        </Flex>
        <IconButton size={16} style={{ marginLeft: 'auto' }} onClick={addShadow}>
          {Asset.editor.leftPanel.page.add}
        </IconButton>
      </Flex>
    )
  })

  const ShadowListComp = useSubComponent<{ shadows: IShadow[] }>([], ({ shadows }) => {
    return shadows.map((shadow, index) =>
      index !== shadows.length - 1 ? (
        <>
          <ShadowItemComp key={index} shadow={shadow} index={index} />
          <Divide direction='h' margin={6} length={'95%'} thickness={0.2} bgColor='#E3E3E3' />
        </>
      ) : (
        <ShadowItemComp key={index} shadow={shadow} index={index} />
      )
    )
  })

  return (
    <Flex layout='v' sidePadding={6} className={classes.Shadow}>
      <HeaderComp />
      {isShadowsArray(shadows.value) ? (
        <ShadowListComp shadows={shadows.value} />
      ) : (
        <Flex layout='c' className={classes.isMultiShadows}>
          点击 + 重置并修改多个描边
        </Flex>
      )}
    </Flex>
  )
})

type IShadowCompStyle = {} /* & Required<Pick<IShadowComp>> */ /* & Pick<IShadowComp> */

const useStyles = makeStyles<IShadowCompStyle>()((t) => ({
  Shadow: {
    ...t.rect('100%', 'fit-content', 'no-radius', 'white'),
    ...t.default$.borderBottom,
    padding: 8,
  },
  header: {
    ...t.rect('100%', 24),
  },
  title: {
    ...t.labelFont,
  },
  isMultiShadows: {
    ...t.labelFont,
    height: 24,
    marginTop: 8,
    marginRight: 'auto',
  },
}))

ShadowComp.displayName = 'ShadowComp'
