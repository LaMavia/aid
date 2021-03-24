import 'express'
import { UUID } from './database/types'
import session = require('express-session')
import pgConnect = require('connect-pg-simple')
import { getPool } from './database/db'
import { Express } from 'express-serve-static-core'

declare module 'express-session' {
  interface SessionData {
    user_id: UUID
  }
}

export const init_session = (server: Express, credentials: { key: string; cert?: string }) => {
  server.use(
    session({
      store: new (pgConnect(session))({
        pool: getPool(),
        tableName: 'session'
      }),
      secret: credentials.key,
      resave: false,
      cookie: {
        maxAge: 30 * 24 * 3600 * 1000,
        secure: true
      },
      saveUninitialized: false
    })
  )
}