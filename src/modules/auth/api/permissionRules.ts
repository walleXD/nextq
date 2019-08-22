import { rule, not } from 'graphql-shield'

export const isAuthenticated = rule()(
  (_, __, { user }): boolean => user !== null
)

export const notAuthenticated = not(isAuthenticated)
