import { Button, Typography } from '@arco-design/web-react'
import { Icon } from '@gitborlando/widget'
import { Github, LucideLanguages } from 'lucide-react'
import { UserService } from 'src/global/service/user'
import { IconButton } from 'src/view/component/button'
import { getLanguage, setLanguage } from 'src/view/i18n/config'

export const HomeHeaderComp: FC<{}> = observer(({}) => {
  const handleLanguageChange = () => {
    setLanguage(getLanguage() === 'zh' ? 'en' : 'zh')
  }
  return (
    <G className={cls()} horizontal='auto auto 1fr' center gap={16}>
      <G horizontal center gap={8} className={cls('title')}>
        <Icon url={Assets.favIcon.sigma2} className={cls('title-icon')} />
        <h4>Sigma Editor</h4>
      </G>
      <G horizontal center gap={8}>
        <IconButton icon={<Lucide icon={Github} size={20} />} />
        <IconButton
          icon={<Lucide icon={LucideLanguages} size={20} />}
          onClick={handleLanguageChange}
        />
      </G>
      <G className={cls('right')} horizontal='auto auto auto' center gap={16}>
        <Button type='primary'>{t('file.new')}</Button>
        <G
          dangerouslySetInnerHTML={{ __html: UserService.avatar }}
          style={{ width: '32px', height: '32px' }}></G>
        <Typography.Text style={{ alignSelf: 'center' }}>
          {UserService.userName}
        </Typography.Text>
      </G>
    </G>
  )
})

const cls = classes(css`
  height: 48px;
  padding: 0 20px;
  justify-content: space-between;
  ${styles.borderBottom}
  &-title {
    font-weight: 600;
    font-size: 18px;
    color: var(--color);
    &-icon {
      width: 24px;
      height: 24px;
    }
  }
  &-right {
    justify-content: flex-end;
  }
`)
