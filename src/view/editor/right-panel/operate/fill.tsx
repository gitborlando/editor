import { Flex } from '@gitborlando/widget'
import { FC, Fragment } from 'react'
import { OperateFill } from 'src/editor/operate/fill'
import { IFill } from 'src/editor/schema/type'
import { useMatchPatch, useMemoComp } from 'src/shared/utils/react'
import { IconButton } from 'src/view/ui-utility/widget/button/icon-button'
import { Divide } from 'src/view/ui-utility/widget/divide'
import { PickerOpener } from './picker/picker-opener'

export const FillPropComp: FC<{}> = ({}) => {
  const { fills, isMultiFills, addFill } = OperateFill
  const hasFills = fills.length > 0
  useMatchPatch('/?/fills/...')

  const HeaderComp = useMemoComp([hasFills], ({}) => {
    return (
      <Flex layout='h' className={`wh-100%-24 ${hasFills && 'mb-8'}`}>
        <Flex layout='c' className='labelFont ml-5'>
          <h4>填充</h4>
        </Flex>
        <IconButton size={16} style={{ marginLeft: 'auto' }} onClick={addFill}>
          {Assets.editor.leftPanel.page.add}
        </IconButton>
      </Flex>
    )
  })

  const FillListComp = useMemoComp<{ fills: IFill[] }>([], ({ fills }) => {
    return fills.map((fill, index) =>
      index !== fills.length - 1 ? (
        <Fragment key={index}>
          <FillItemComp key={index} fill={fill} index={index} />
          <Divide
            direction='h'
            margin={4}
            length={'95%'}
            thickness={0}
            bgColor='#E3E3E3'
          />
        </Fragment>
      ) : (
        <FillItemComp key={index} fill={fill} index={index} />
      ),
    )
  })

  const FillItemComp = useMemoComp<{ fill: IFill; index: number }>(
    [],
    ({ fill, index }) => {
      const { setFill, deleteFill } = OperateFill

      return (
        <Flex layout='h' className='wh-100%-28'>
          <PickerOpener fill={fill} index={index} impact='fill' />
          <IconButton
            size={16}
            style={{ marginLeft: 'auto' }}
            onClick={() => setFill(index, ['visible'], !fill.visible)}>
            {fill.visible
              ? Assets.editor.shared.visible
              : Assets.editor.shared.unVisible}
          </IconButton>
          <IconButton size={16} onClick={() => deleteFill(index)}>
            {Assets.editor.shared.minus}
          </IconButton>
        </Flex>
      )
    },
  )

  return (
    <Flex layout='v' className='wh-100%-fit bg-white borderBottom p-8'>
      <HeaderComp />
      {isMultiFills ? (
        <Flex layout='c' className='h-24 mt-8 mr-auto d-font-label'>
          点击 + 重置并修改多个填充
        </Flex>
      ) : (
        <FillListComp fills={fills} />
      )}
    </Flex>
  )
}
