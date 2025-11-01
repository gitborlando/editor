import { Popover } from '@arco-design/web-react'
import { Text } from 'src/view/component/text'
import { AvatarCircles } from 'src/view/shadcn/ui/avatar-circles'

type CooperateInfo = {
  clientId: number
  userId: string
  name: string
  avatar: string
  color: string
}

export const CooperateComp: FC<{}> = observer(({}) => {
  const [show, setShow] = useState(false)
  const others = useSnapshot(YClients.others)

  const cooperates = Object.entries(others).map(([clientId, other]) => ({
    clientId: Number(clientId),
    userId: other.userId,
    name: other.userName,
    avatar: URL.createObjectURL(
      new Blob([other.userAvatar], { type: 'image/svg+xml' }),
    ),
    color: other.color,
  }))

  return (
    <G className={cls('')}>
      <Popover
        popupVisible={show}
        content={<CooperatePopup cooperates={cooperates} />}>
        <AvatarCircles
          avatarUrls={cooperates.map((cooperate) => ({
            imageUrl: cooperate.avatar,
            color: cooperate.color,
          }))}
          numPeople={3}
          onClick={() => setShow(!show)}
        />
      </Popover>
    </G>
  )
})

const CooperatePopup: FC<{ cooperates: CooperateInfo[] }> = observer(
  ({ cooperates }) => {
    return (
      <G className={cls('popup')} vertical='auto 1fr'>
        <G horizontal center className={cls('popup-header')}>
          <Text>当前协作人员(点击进入观察)</Text>
        </G>
        <G className={cls('popup-list')}>
          {cooperates.map((cooperate) => (
            <G
              horizontal='auto 1fr'
              center
              className={cls('popup-item')}
              onClick={() => {
                YClients.observingClientId = cooperate.clientId
              }}>
              <img src={cooperate.avatar} />
              <Text style={{ alignSelf: 'center' }}>{cooperate.name}</Text>
            </G>
          ))}
        </G>
      </G>
    )
  },
)

const cls = classes(css`
  &-popup {
    width: 200px;
    height: fit-content;
    &-header {
      height: fit-content;
      margin-bottom: 8px;
      ${styles.textHead}
    }
    &-list {
    }
    &-item {
      gap: 8px;
      padding: 8px;
      cursor: pointer;
      ${styles.borderRadius}
      ${styles.bgHoverGray}
      ${styles.textCommon}
      & img {
        width: 24px;
        height: 24px;
        border-radius: 50%;
      }
    }
  }
`)
