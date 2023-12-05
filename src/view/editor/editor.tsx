import { observer } from 'mobx-react'
import { FC } from 'react'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { DragMaskComp } from './drag-mask'
import { HeaderComp } from './header/header'
import { LeftPanelComp } from './left-panel/left-panel'
import { RightPanelComp } from './right-panel/right-panel'
import { StageComp } from './stage/stage'

type IEditorComp = {}

export const EditorComp: FC<IEditorComp> = observer(({}) => {
  const { classes } = useStyles({})
  return (
    <Flex layout='v' className={classes.Editor}>
      <HeaderComp />
      <Flex layout='h' className={classes.main}>
        <LeftPanelComp />
        <StageComp />
        <RightPanelComp />
      </Flex>
      <DragMaskComp />
    </Flex>
  )
})

type IEditorCompStyle = {} /* & Required<Pick<IEditorComp>> */ /* & Pick<IEditorComp> */

const useStyles = makeStyles<IEditorCompStyle>()((t) => ({
  Editor: {
    ...t.rect('100vw', '100vh', 'no-radius', 'white'),
  },
  main: {
    ...t.rect('100%', '100%'),
  },
}))

EditorComp.displayName = 'EditorComp'
