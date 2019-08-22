import { makeSchema } from 'nexus'
import { join } from 'path'
import { applyMiddleware } from 'graphql-middleware'

import { AuthTypes, AuthPermissions } from '@nextq/auth/api'

import { generatePermissions } from './utils'
import { GraphQLSchemaWithFragmentReplacements } from 'graphql-middleware/dist/types'

export const schema = makeSchema({
  types: [AuthTypes],
  outputs: {
    schema: join(__dirname, '../generated/schema.graphql'),
    typegen: join(
      __dirname,
      '../generated/schema-types.d.ts'
    )
  },
  prettierConfig: join(
    __dirname,
    '..',
    '..',
    '..',
    '.prettierrc'
  )
})

export default (): GraphQLSchemaWithFragmentReplacements => {
  const defaultMiddlewares = [
    generatePermissions(AuthPermissions)
  ]

  return applyMiddleware(schema, ...defaultMiddlewares)
}
