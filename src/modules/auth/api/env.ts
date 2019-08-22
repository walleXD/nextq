import { makeSchema } from 'nexus'

import { AuthTypes } from './typeDefs'
import { join } from 'path'

const isDev = process.env.NODE_ENV === 'development'

if (isDev)
  makeSchema({
    types: [AuthTypes],
    outputs: {
      schema: join(
        __dirname,
        '..',
        'generated',
        'auth.schema.graphql'
      ),
      typegen: join(
        __dirname,
        '..',
        'generated',
        'auth.schema-types.d.ts'
      )
    },
    prettierConfig: join(
      __dirname,
      '..',
      '..',
      '..',
      '.prettierrc'
    ),
    typegenAutoConfig: {
      sources: [
        {
          source: join(
            __dirname,
            '..',
            'src',
            'typeDefs.ts'
          ),
          alias: 't'
        }
      ],
      contextType: 't.AuthContext'
    }
  })
