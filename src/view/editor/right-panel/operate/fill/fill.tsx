import { FC, Fragment } from 'react'
import { OperateFill } from '~/editor/operate/fill'
import { IFill } from '~/editor/schema/type'
import { useMemoComp } from '~/shared/utils/react'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { IconButton } from '~/view/ui-utility/widget/button/icon-button'
import { Divide } from '~/view/ui-utility/widget/divide'
import { Flex } from '~/view/ui-utility/widget/flex'
import { FillItemComp } from './fill-item'

type IFillPropComp = {}

export const FillPropComp: FC<IFillPropComp> = ({}) => {
  const { classes, css, theme, cx } = useStyles({})
  const { fills, isMultiFills, addFill } = OperateFill
  const hasFills = fills.length > 0

  const HeaderComp = useMemoComp([hasFills], ({}) => {
    return (
      <Flex
        layout='h'
        className={css({
          ...theme.rect('100%', 24),
          ...(hasFills && { marginBottom: 8 }),
        })}>
        <Flex layout='c' className={css({ ...theme.labelFont })}>
          <h4>填充</h4>
        </Flex>
        <IconButton size={16} style={{ marginLeft: 'auto' }} onClick={addFill}>
          {Asset.editor.leftPanel.page.add}
        </IconButton>
      </Flex>
    )
  })

  const FillListComp = useMemoComp<{ fills: IFill[] }>([], ({ fills }) => {
    return fills.map((fill, index) =>
      index !== fills.length - 1 ? (
        <Fragment key={index}>
          <FillItemComp key={index} fill={fill} index={index} />
          <Divide direction='h' margin={4} length={'95%'} thickness={0} bgColor='#E3E3E3' />
        </Fragment>
      ) : (
        <FillItemComp key={index} fill={fill} index={index} />
      )
    )
  })

  return (
    <Flex layout='v' className={cx(classes.FillProp, 'px-6')}>
      <HeaderComp />
      {isMultiFills ? (
        <Flex layout='c' className={classes.isMultiFills}>
          点击 + 重置并修改多个填充
        </Flex>
      ) : (
        <FillListComp fills={fills} />
      )}
    </Flex>
  )
}

type IFillPropCompStyle = {} /* & Required<Pick<IFillPropComp>> */ /* & Pick<IFillPropComp> */

const useStyles = makeStyles<IFillPropCompStyle>()((t) => ({
  FillProp: {
    ...t.rect('100%', 'fit-content', 'no-radius', 'white'),
    ...t.default$.borderBottom,
    padding: 8,
  },
  title: {
    ...t.labelFont,
  },
  isMultiFills: {
    ...t.labelFont,
    height: 24,
    marginTop: 8,
    marginRight: 'auto',
  },
}))

FillPropComp.displayName = 'FillPropComp'
