import { miniId } from '@gitborlando/utils'
import multiavatar from '@multiavatar/multiavatar/esm'
import autobind from 'class-autobind-decorator'

@autobind
class UserServiceClass {
  userId = miniId()
  avatar = multiavatar(this.userId)

  constructor() {}
}

export const UserService = new UserServiceClass()
