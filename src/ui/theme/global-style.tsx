import { GlobalStyles } from 'tss-react'

export const GlobalStyle = () => (
  <GlobalStyles
    styles={{
      '*': {
        padding: 0,
        margin: 0,
        boxSizing: 'border-box',
      },
    }}
  />
)
