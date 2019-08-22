import {
  objectType,
  stringArg,
  booleanArg,
  asNexusMethod,
  queryField,
  mutationField
} from 'nexus'
import { EmailAddress } from 'graphql-scalars'
import {
  ServerResponse as Response,
  ClientRequest as Request
} from 'http'
import { ObjectId } from 'bson'

import { UserModel, User as UserType } from './models'
import {
  TokenGenerator,
  getValidatedUser,
  signInHelper
} from './utils'
import { NexusGenRootTypes } from 'auth/generated/auth.schema-types'
import {
  isAuthenticated,
  notAuthenticated
} from './permissionRules'

export interface AuthContext {
  res: Response
  req: Request
  models: {
    users: UserModel
  }
  user: UserType | null
  tokenGenerator: TokenGenerator
}

const Email = asNexusMethod(EmailAddress, 'email')

const User = objectType({
  name: 'User',
  definition(t): void {
    t.id('id', { description: 'Id of the user' })
    t.email('email', {
      description: "User's email"
    })
    t.int('count')
  }
})

/**
 * Payload sent to users after successful authentication
 */
const AuthPayload = objectType({
  name: 'AuthPayload',
  description:
    'Payload sent to users after successful authentication',
  definition(t): void {
    t.string('accessToken')
    t.string('refreshToken')
    t.int('count')
  }
})

/**
 * Returns the currently logged in used
 */
const meQuery = queryField('me', {
  type: User,
  description: 'Returns the currently logged in used',
  nullable: true,
  async resolve(
    _,
    __,
    { user }
  ): Promise<NexusGenRootTypes['User'] | null> {
    // checks context for user object otherwise returns null
    return !user
      ? null
      : { ...user, id: user._id.toString() }
  }
})

/**
 * Allows new users to sign up
 */
const signUpMutation = mutationField('signUp', {
  description: 'Allows new users to sign up',
  type: AuthPayload,
  nullable: true,
  args: {
    email: stringArg({ required: true }),
    password: stringArg({ required: true }),
    cookies: booleanArg()
  },
  resolve: async (
    _,
    { email, password, cookies = false },
    { models, tokenGenerator, res }
  ): Promise<NexusGenRootTypes['AuthPayload'] | null> => {
    // checks if the user already exists
    const isUser = await models.users.isUser(email)
    if (isUser)
      throw new Error(`User with ${email} already exists`)

    // creates brand new user
    const { count, _id } = await models.users.createNewUser(
      email,
      password
    )

    // generates tokens to sign in the new user
    return signInHelper(
      _id,
      count,
      tokenGenerator,
      res,
      Boolean(cookies)
    )
  }
})

/**
 * Allows existing user to sign in with their info
 */
const signInMutation = mutationField('signIn', {
  description:
    'Allows existing user to sign in with their info',
  type: AuthPayload,
  nullable: true,
  args: {
    email: stringArg({ required: true }),
    password: stringArg({ required: true }),
    cookies: booleanArg()
  },
  resolve: async (
    _,
    { email, password, cookies = false },
    { models, res, tokenGenerator }
  ): Promise<NexusGenRootTypes['AuthPayload'] | null> => {
    // validates the user info is correct
    const { _id, count } = await getValidatedUser(
      email,
      password,
      models.users
    )

    // uses the validated user info to generate JWT tokens
    return signInHelper(
      _id,
      count,
      tokenGenerator,
      res,
      Boolean(cookies)
    )
  }
})

const refreshTokensMutation = mutationField(
  'refreshTokens',
  {
    description:
      'Allows existing user to get new access tokens with their refresh tokens',
    type: AuthPayload,
    nullable: true,
    args: {
      refreshToken: stringArg({ required: true })
    },
    resolve: async (
      _,
      { refreshToken },
      { tokenGenerator, models }
    ): Promise<NexusGenRootTypes['AuthPayload'] | null> => {
      const data = tokenGenerator.verifyRefreshToken(
        refreshToken
      )

      if (!!data) {
        const user = await models.users.findUserById(
          data.userId
        )

        if (user && user.count == data.count)
          return signInHelper(
            new ObjectId(data.userId),
            data.count,
            tokenGenerator
          )
      }

      return null
    }
  }
)

const invalidateTokensMutation = mutationField(
  'invalidateTokens',
  {
    description:
      "Invalidates existing user's refresh tokens",
    type: 'Boolean',
    nullable: false,
    resolve: async (
      _,
      __,
      { user, models }
    ): Promise<boolean> => {
      if (user) {
        return models.users.updateUser(
          user._id.toHexString(),
          {
            $set: { count: user.count + 1 }
          }
        )
      }
      return false
    }
  }
)

export const AuthTypes = {
  Email,
  User,
  AuthPayload,
  meQuery,
  signInMutation,
  signUpMutation,
  refreshTokensMutation,
  invalidateTokensMutation
}

export const AuthPermissions = {
  Query: {
    me: isAuthenticated
  },
  Mutation: {
    signIn: notAuthenticated,
    signUp: notAuthenticated,
    refreshTokens: notAuthenticated,
    invalidateTokens: isAuthenticated
  }
}
