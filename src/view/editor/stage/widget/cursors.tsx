import { FC, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { xy_toArray } from '~/editor/math/xy'
import { Schema } from '~/editor/schema/schema'
import { IClient } from '~/editor/schema/type'
import { hslColor } from '~/shared/utils/color'
import { useMemoComp } from '~/shared/utils/react'
import Asset from '~/view/ui-utility/assets'
import { makeStyles } from '~/view/ui-utility/theme'
import { Flex } from '~/view/ui-utility/widget/flex'
import { Icon } from '~/view/ui-utility/widget/icon'

type ICursorsComp = {}

export const CursorsComp: FC<ICursorsComp> = ({}) => {
  const { classes, theme } = useStyles({})
  const clients = Object.values(Schema.meta.clients)

  const CursorComp = useMemoComp<{ client: IClient }>([], ({ client }) => {
    const randomColor = useMemo(() => hslColor(Math.random() * 360, 80, 35), [])
    const [left, top] = xy_toArray(client.mouse)
    return (
      <Icon className={classes.cursor} size={24} fill={randomColor} style={{ left, top }}>
        {Asset.editor.widget.cursor}
      </Icon>
    )
  })

  return createPortal(
    <Flex style={{ zIndex: 99, ...theme.rect('100%', '100%') }}>
      {clients
        .filter((client) => client.id !== Schema.client.id)
        .map((client) => (
          <CursorComp key={client.id} client={client} />
        ))}
    </Flex>,
    document.querySelector('#draggable-portal')!
  )
}

type ICursorsCompStyle = {} /* & Required<Pick<ICursorsComp>> */ /* & Pick<ICursorsComp> */

const useStyles = makeStyles<ICursorsCompStyle>()((t) => ({
  cursor: {
    ...t.fixed(),
    pointerEvents: 'none',
  },
}))

CursorsComp.displayName = 'CursorsComp'
