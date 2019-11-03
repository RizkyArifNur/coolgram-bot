export interface IMessage {
  firstName: string
  lastName: string
  message: string
  isQna: boolean
}

export type KulgramState = 'IDDLE' | 'STARTING' | 'PICK-AUTHOR' | 'STOPED' | 'STARTED' | 'START-QNA'

export type ErrorCode = 'MESSAGE_NOT_FOUND'

export interface IBaseData {
  id: number
}

export interface IChatState extends IBaseData {
  state: KulgramState
}

export interface ISession extends IBaseData {
  title?: string
  author?: string
  dateStart: Date
  dateEnd: Date | null
  data: IMessage[]
}

export interface IChatPermissions {
  can_add_web_page_previews: boolean
  can_change_info: boolean
  can_invite_users: boolean
  can_pin_messages: boolean
  can_send_media_messages: boolean
  can_send_messages: boolean
  can_send_other_messages: boolean
  can_send_polls: boolean
}

export interface IAdminChatPermissions {
  can_change_info: boolean
  can_delete_messages: boolean
  can_edit_messages: boolean
  can_invite_users: boolean
  can_pin_messages: boolean
  can_post_messages: boolean
  can_promote_members: boolean
  can_restrict_members: boolean
}
