import type { HTMLAttributes } from 'react'

const Logo = (props: HTMLAttributes<HTMLImageElement>) => (
  <img src='/logos/isotipo.webp' alt='SEDIPRO UNT' {...props} />
)

export default Logo

