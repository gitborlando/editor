import { observer } from 'mobx-react'
import { FC } from 'react'
import { Upload } from '~/global/upload'
import { makeStyles } from '~/view/ui-utility/theme'

type IUploaderComp = {}

export const UploaderComp: FC<IUploaderComp> = observer(({}) => {
  return (
    <input ref={Upload.setInputRef} id='uploader' type='file' style={{ display: 'none' }}></input>
  )
})

type IUploaderCompStyle = {} /* & Required<Pick<IUploaderComp>> */ /* & Pick<IUploaderComp> */

const useStyles = makeStyles<IUploaderCompStyle>()((t) => ({}))

UploaderComp.displayName = 'UploaderComp'
