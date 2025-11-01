import { cn } from '../lib/utils'

interface Avatar {
  imageUrl: string
  profileUrl: string
}
interface AvatarCirclesProps {
  className?: string
  numPeople?: number
  avatarUrls: Avatar[]
}

export const AvatarCircles = ({
  numPeople,
  className,
  avatarUrls,
}: AvatarCirclesProps) => {
  return (
    <div
      className={cn(
        'tw:z-10 tw:flex tw:-space-x-4 tw:rtl:space-x-reverse',
        className,
      )}>
      {avatarUrls.map((url, index) => (
        <a
          key={index}
          href={url.profileUrl}
          target='_blank'
          rel='noopener noreferrer'>
          <img
            key={index}
            className='tw:h-10 tw:w-10 tw:rounded-full tw:border-2 tw:border-white tw:dark:border-gray-800'
            src={url.imageUrl}
            width={40}
            height={40}
            alt={`Avatar ${index + 1}`}
          />
        </a>
      ))}
      {(numPeople ?? 0) > 0 && (
        <a
          className='tw:flex tw:h-10 tw:w-10 tw:items-center tw:justify-center tw:rounded-full tw:border-2 tw:border-white tw:bg-black tw:text-center tw:text-xs tw:font-medium tw:text-white tw:hover:bg-gray-600 tw:dark:border-gray-800 tw:dark:bg-white tw:dark:text-black'
          href=''>
          +{numPeople}
        </a>
      )}
    </div>
  )
}
