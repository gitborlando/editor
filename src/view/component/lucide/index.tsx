import { LucideProps as LucidePropsType } from 'lucide-react'
import { FC } from 'react'
import './index.less'

interface LucideProps extends LucidePropsType {
  icon: React.ForwardRefExoticComponent<any>
}

export const Lucide: FC<LucideProps> = observer(({ icon: Icon, className, ...rest }) => {
  return <Icon className={cx('lucide', className)} {...rest} size={20} />
})
