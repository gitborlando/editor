import { FC } from 'react'
import { Menu } from '~/global/menu'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'

type IMenuComp = {}

export const MenuComp: FC<IMenuComp> = ({}) => {
  const { classes } = useStyles({})
  return <>{Menu.show && <Flex ref={Menu.setRef} className={classes.Menu}></Flex>}</>
}

type IMenuCompStyle = {} /* & Required<Pick<IMenuComp>> */ /* & Pick<IMenuComp> */

const useStyles = makeStyles<IMenuCompStyle>()((t) => ({
  Menu: {
    ...t.rect(150, 400, 6, 'white'),
    borderBottom: '1px solid gray',
    position: 'fixed',
    zIndex: 999,
    boxShadow: '0px 0px 4px  rgba(0, 0, 0, 0.25)',
  },
}))

MenuComp.displayName = 'MenuComp'
