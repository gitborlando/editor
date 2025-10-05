import { miniId } from '@gitborlando/utils'
import autobind from 'class-autobind-decorator'

@autobind
class UserServiceClass {
  userId = miniId()

  constructor() {}
}

export const UserService = new UserServiceClass()
