import { LucideProps as LucidePropsType } from 'lucide-react'
import './index.less'

interface LucideProps extends LucidePropsType {
  icon: React.ForwardRefExoticComponent<any>
}

export const Lucide: FC<LucideProps> = observer(
  ({ icon: Icon, className, size = 18, ...rest }) => {
    return (
      <Icon
        className={cx('lucide', className)}
        {...rest}
        size={size}
        strokeWidth={1.5}
      />
    )
  },
)
