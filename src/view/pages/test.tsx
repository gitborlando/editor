import { HocuspocusProvider } from '@hocuspocus/provider'
import * as Y from 'yjs'

const ydoc = new Y.Doc()

// 创建 Hocuspocus Provider（连接后端）
const provider = new HocuspocusProvider({
  url: 'ws://localhost:1234', // ✅ 后端地址
  name: 'example-room', // 文档名（多个客户端同名即可协作）
  document: ydoc,
})

// 创建一个共享文本
const ytext = ydoc.getText('shared')

// 绑定 textarea

export const Test = () => {
  const [value, setValue] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    ytext.observe(() => {
      setValue(ytext.toString())
    })
  }, [])

  const handleInput = () => {
    ytext.delete(0, ytext.length)
    ytext.insert(0, ref.current!.value)
  }

  return (
    <div>
      <textarea ref={ref} value={value} onInput={handleInput} />
    </div>
  )
}
