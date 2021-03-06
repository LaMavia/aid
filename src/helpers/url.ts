export const getApiBase = (): string =>
  `${process.env.NODE_ENV === 'development' && window.location.port === '3000' ? 'https://localhost:3001' : ''}/api`

export const getPublicBase = (): string =>
  process.env.NODE_ENV === 'development' && window.location.port === '3000' ? 'https://localhost:3001' : ''
