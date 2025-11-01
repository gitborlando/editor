import { ChevronDown } from 'lucide-react'
import { UILeftPanelLayer } from 'src/editor/ui-state/left-panel/layer'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { IconButton } from 'src/view/component/button'
import { Lucide } from 'src/view/component/lucide'

export const NodeHeaderComp: FC<{}> = observer(({}) => {
  const { allNodeExpanded, searchSlice } = UILeftPanelLayer
  const isCollapsed = allNodeExpanded.value === 'collapsed'
  useHookSignal(allNodeExpanded)
  useHookSignal(searchSlice)

  return (
    <G center horizontal='1fr auto' className={cls()}>
      <input
        className={'search'}
        placeholder='搜索'
        value={searchSlice.value}
        onChange={(e) => {
          searchSlice.dispatch(e.target.value)
        }}></input>
      <IconButton
        onClick={() =>
          allNodeExpanded.dispatch(isCollapsed ? 'expanded' : 'collapsed')
        }>
        <Lucide
          icon={ChevronDown}
          style={{ rotate: isCollapsed ? '0deg' : '180deg' }}
        />
      </IconButton>
    </G>
  )
})

const cls = classes(css`
  padding-inline: 12px;
  height: 32px;

  & input {
    height: 22px;
    outline: none;
    border: none;
    background-color: transparent;
    ${styles.textLabel}
  }
`)
