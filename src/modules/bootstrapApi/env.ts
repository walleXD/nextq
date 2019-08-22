import dotenv from 'dotenv'

export const isDev = process.env.NODE_ENV === 'development'

if (isDev) dotenv.config()

export const mongoURL1 = process.env.MONGOURL1 || ''
export const mongoURL2 = process.env.MONGOURL2 || ''
export const accessSecret =
  process.env.JWT_ACCESS_SECRET || ''
export const refreshSecret =
  process.env.JWT_REFRESH_SECRET || ''
