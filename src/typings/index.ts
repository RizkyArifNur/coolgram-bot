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
