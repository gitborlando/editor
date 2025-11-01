import { ChevronDown, Plus } from 'lucide-react'
import { FC, memo } from 'react'
import { HandlePage } from 'src/editor/handle/page'
import { UILeftPanelLayer } from 'src/editor/ui-state/left-panel/layer'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { useMatchPatch } from 'src/shared/utils/react'
import { IconButton } from 'src/view/component/button'
import { Lucide } from 'src/view/component/lucide'
import { useSelectPage } from 'src/view/hooks/schema/use-y-state'

export const PageHeaderComp: FC<{}> = memo(({}) => {
  const { allPageExpanded } = UILeftPanelLayer
  useHookSignal(allPageExpanded)
  useMatchPatch('/client/selectPageId')
  const selectPage = useSelectPage()
  const newPage = () => {
    if (allPageExpanded.value === false) {
      allPageExpanded.dispatch(true)
    }
    // OperatePage.addPage()
    HandlePage.addPage()
  }

  return (
    <C horizontal='1fr auto auto' gap={4} className={cls()}>
      <C horizontal className={cls('title')}>
        {selectPage.name}
      </C>
      <IconButton onClick={newPage}>
        <Lucide icon={Plus} />
      </IconButton>
      <IconButton onClick={() => allPageExpanded.dispatch(!allPageExpanded.value)}>
        <Lucide
          icon={ChevronDown}
          style={{ rotate: allPageExpanded.value ? '0deg' : '180deg' }}
        />
      </IconButton>
    </C>
  )
})

const cls = classes(css`
  padding-inline: 12px 10px;
  height: 32px;

  &-title {
    ${styles.textLabel}
    color: gray;
  }
`)
