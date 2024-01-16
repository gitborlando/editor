export function favIcon(href: string) {
  const head = document.querySelector<HTMLHeadElement>('head')!
  const link = document.createElement('link')
  link.setAttribute('rel', 'shortcut icon')
  link.setAttribute('href', href)
  head.appendChild(link)
}
