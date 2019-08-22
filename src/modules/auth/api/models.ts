import { MongoEntity } from 'apollo-connector-mongodb'
import { hash } from 'bcryptjs'
import { ObjectID } from 'mongodb'

export interface User {
  _id: ObjectID
  email: string
  passwordHash: string
  count: number
}

interface FindUserSelectors {
  email?: string
  id?: ObjectID
}

export interface UserModel {
  /**
   * Looks up whether user exists with the given email
   * @param email
   * @returns whether the use exists
   */
  isUser: (email: string) => Promise<boolean>
  /**
   * Looks up user using email
   * @param email Email to find user with
   * @returns user info
   */
  findUserByEmail: (email: string) => Promise<User | null>
  /**
   * Looks up user with id
   * @param id Id to find user with
   * @returns user info
   */
  findUserById: (id: string) => Promise<User | null>
  /**
   * Finds users using the given info
   * @param param0 selectors to find users with
   * @returns user info
   */
  findUser: (
    selectors: FindUserSelectors
  ) => Promise<User | null>
  /**
   * Creates new user and enters it into DB
   * @param email new user's email
   * @param password user to generate hash for the user
   * @returns user info
   */
  createNewUser: (
    email: string,
    password: string
  ) => Promise<User>
  /**
   * Updates user with given data
   * @param id user id to find user
   * @param data data to update the found user with
   * @returns whether update was successful
   */
  updateUser: (
    _id: string,
    data: Record<string, any>
  ) => Promise<boolean>
}

export const generateUserModel = (
  users: MongoEntity<User>
): UserModel => {
  /**
   * Looks up user using email
   * @param email Email to find user with
   * @returns user info
   */
  const findUserByEmail = async (
    email: string
  ): Promise<User | null> => users.findOne({ email })

  /**
   * Looks up user with id
   * @param id Id to find user with
   * @returns user info
   */
  const findUserById = async (
    id: string
  ): Promise<User | null> =>
    users.findOne({ _id: new ObjectID(id) })

  /**
   * Finds users using the given info
   * @param param0 selectors to find users with
   * @returns user info
   */
  const findUser = async ({
    email = '',
    id
  }: FindUserSelectors): Promise<User | null> =>
    id
      ? findUserById(id.toHexString())
      : findUserByEmail(email)

  /**
   * Looks up whether user exists with the given email
   * @param email
   * @returns whether the use exists
   */
  const isUser = async (email: string): Promise<boolean> =>
    !!(await findUserByEmail(email))

  /**
   * Creates new user and enters it into DB
   * @param email new user's email
   * @param password user to generate hash for the user
   * @returns user info
   */
  const createNewUser = async (
    email: string,
    password: string
  ): Promise<User> => {
    const doc = {
      _id: new ObjectID(),
      email,
      passwordHash: await hash(password, 10),
      count: 0
    }
    const { insertedId } = await users.insertOne(doc)

    return {
      ...doc,
      _id: insertedId
    }
  }

  /**
   * Updates user with given data
   * @param id user id to find user
   * @param data data to update the found user with
   */
  const updateUser = async (
    id: string,
    data: Record<string, any>
  ): Promise<boolean> => {
    const { modifiedCount } = await users.updateOne(
      { _id: new ObjectID(id) },
      data
    )

    return modifiedCount === 1
  }

  return Object.freeze({
    isUser,
    findUser,
    findUserByEmail,
    findUserById,
    createNewUser,
    updateUser
  })
}
