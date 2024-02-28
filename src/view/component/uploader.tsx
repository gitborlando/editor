import { observer } from 'mobx-react'
import { FC } from 'react'
import { Uploader } from '~/global/upload'
import { makeStyles } from '~/view/ui-utility/theme'

type IUploaderComp = {}

export const UploaderComp: FC<IUploaderComp> = observer(({}) => {
  return (
    <input ref={Uploader.setInputRef} id='uploader' type='file' style={{ display: 'none' }}></input>
  )
})

type IUploaderCompStyle = {} /* & Required<Pick<IUploaderComp>> */ /* & Pick<IUploaderComp> */

const useStyles = makeStyles<IUploaderCompStyle>()((t) => ({}))

UploaderComp.displayName = 'UploaderComp'
