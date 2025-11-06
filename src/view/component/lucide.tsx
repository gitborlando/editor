import { LucideProps as LucidePropsType } from 'lucide-react'

interface LucideProps extends LucidePropsType {
  icon: React.ForwardRefExoticComponent<any>
}

export const Lucide: FC<LucideProps> = observer(
  ({ icon: Icon, className, size = 16, strokeWidth = 1.5, ...rest }) => {
    return (
      <Icon className={className} {...rest} size={size} strokeWidth={strokeWidth} />
    )
  },
)
