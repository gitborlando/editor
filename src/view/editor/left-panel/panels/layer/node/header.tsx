import { ChevronUp } from 'lucide-react'
import { useHookSignal } from 'src/shared/signal/signal-react'
import { IconButton } from 'src/view/component/button'

import { EditorLPLayerNodeState } from 'src/view/editor/left-panel/panels/layer/node/state'

export const EditorLeftPanelLayerNodeHeaderComp: FC<{}> = observer(({}) => {
  const { nodeInfoChanged, getAllNodeExpanded, toggleAllNodeExpanded } =
    EditorLPLayerNodeState
  useHookSignal(nodeInfoChanged)

  const allNodeExpanded = getAllNodeExpanded()

  const handleToggleExpand = () => {
    toggleAllNodeExpanded(!allNodeExpanded)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
  }

  const handleClearSearch = () => {}

  return (
    <G horizontal='1fr auto' center className={cls()}>
      <input
        type='text'
        // value={searchSlice.value}
        // onChange={handleSearchChange}
        placeholder='搜索图层...'
        className={cls('search-input')}
      />
      <IconButton onClick={handleToggleExpand} className={cls('expand-button')}>
        <Lucide
          icon={ChevronUp}
          style={{
            transform: allNodeExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
      </IconButton>
    </G>
  )
})

const cls = classes(css`
  width: 100%;
  height: 32px;
  min-height: 32px;
  padding: 0 12px;
  gap: 8px;

  &-expand-button {
    flex-shrink: 0;
  }

  &-search {
    /* flex: 1;
    min-width: 0;
    position: relative;
    background-color: var(--gray-bg);
    border-radius: var(--border-radius);
    padding: 4px 8px;
    gap: 6px; */
  }

  &-search-icon {
    /* flex-shrink: 0;
    color: rgba(138, 138, 138, 0.6); */
  }

  &-search-input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    ${styles.textLabel}
    &::placeholder {
      font-size: 12px;
    }
  }

  &-clear-button {
    flex-shrink: 0;
    padding: 2px;
  }
`)
