/* eslint-disable @typescript-eslint/no-explicit-any */
import { shield, IRules } from 'graphql-shield'
import { IMiddlewareGenerator } from 'graphql-middleware'
import { mergeAll } from 'ramda'

export const generatePermissions = (
  ...permissions: IRules[]
): IMiddlewareGenerator<any, any, any> =>
  shield(mergeAll(permissions))
