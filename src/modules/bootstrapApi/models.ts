import { generateUserModel, UserModel } from '@loaf/auth'
import { AllEntities } from './db'

export interface Models {
  users: UserModel
}

export default ({ users }: AllEntities): Models => ({
  users: generateUserModel(users)
})
