import { FC, Fragment } from 'react'
import { OperateShadow } from 'src/editor/operate/shadow'
import { IShadow } from 'src/editor/schema/type'
import { iife } from 'src/shared/utils/normal'
import { useMatchPatch, useMemoComp } from 'src/shared/utils/react'
import Asset from 'src/view/ui-utility/assets'
import { IconButton } from 'src/view/ui-utility/widget/button/icon-button'
import { CompositeInput } from 'src/view/ui-utility/widget/compositeInput'
import { Divide } from 'src/view/ui-utility/widget/divide'
import { Flex } from 'src/view/ui-utility/widget/flex'
import { PickerOpener } from './picker/picker-opener'

type IShadowComp = {}

export const ShadowComp: FC<IShadowComp> = ({}) => {
  const { shadows, addShadow, isMultiShadows } = OperateShadow
  const hasShadows = shadows.length > 0
  useMatchPatch('/?/shadows/...')

  const HeaderComp = useMemoComp([hasShadows], ({}) => {
    return (
      <Flex className={`lay-h wh-100%-24 ${hasShadows && 'mb-8'}`}>
        <Flex className='lay-c labelFont ml-5'>
          <h4>阴影</h4>
        </Flex>
        <IconButton size={16} style={{ marginLeft: 'auto' }} onClick={addShadow}>
          {Asset.editor.leftPanel.page.add}
        </IconButton>
      </Flex>
    )
  })

  const ShadowListComp = useMemoComp<{ shadows: IShadow[] }>([], ({ shadows }) => {
    return shadows.map((shadow, index) =>
      index !== shadows.length - 1 ? (
        <Fragment key={index}>
          <ShadowItemComp key={index} shadow={shadow} index={index} />
          <Divide direction='h' margin={6} length={'95%'} thickness={0.2} bgColor='#E3E3E3' />
        </Fragment>
      ) : (
        <ShadowItemComp key={index} shadow={shadow} index={index} />
      )
    )
  })

  const ShadowItemComp = useMemoComp<{
    shadow: IShadow
    index: number
  }>([], ({ shadow, index }) => {
    const { deleteShadow, setShadow, toggleShadow, afterOperate } = OperateShadow

    return (
      <Flex className='lay-v wh-100%-fit'>
        <Flex className='wh-100%-28 mb-4'>
          <PickerOpener fill={shadow.fill} index={index} impact='shadow' />
          <IconButton
            size={16}
            style={{ marginLeft: 'auto' }}
            onClick={() => toggleShadow(index, ['visible'], !shadow.visible)}>
            {shadow.visible ? Asset.editor.shared.visible : Asset.editor.shared.unVisible}
          </IconButton>
          <IconButton size={16} onClick={() => deleteShadow(index)}>
            {Asset.editor.shared.minus}
          </IconButton>
        </Flex>
        <Flex className='wh-100%-28'>
          {iife(() => {
            const keys = ['offsetX', 'offsetY', 'blur'] as const
            const labels = ['x偏移', 'y偏移', '模糊']
            return keys.map((key, i) => (
              <CompositeInput
                key={key}
                className='wh-92-28 r-2 mr-4 d-hover-bg [&_.label]:w-fit'
                label={labels[i]}
                needStepHandler={false}
                value={shadow[key].toString()}
                onNewValueApply={(value) => setShadow(index, [key], Number(value))}
                afterOperate={() => afterOperate.dispatch()}
              />
            ))
          })}
        </Flex>
      </Flex>
    )
  })

  return (
    <Flex className='lay-v wh-100%-fit bg-white borderBottom p-8'>
      <HeaderComp />
      {!isMultiShadows ? (
        <ShadowListComp shadows={shadows} />
      ) : (
        <Flex className='lay-c h-24 mt-8 mr-auto labelFont'>点击 + 重置并修改多个描边</Flex>
      )}
    </Flex>
  )
}
