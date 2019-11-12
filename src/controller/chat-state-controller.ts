import { ChatStateNotFoundError } from '../provider/error-provider'
import { ChatStateRepository } from '../repository'
import { IChatPermissions, KulgramState } from '../typings'

export class ChatStateController {
  chatStateRepository = new ChatStateRepository()
  getCurrentState(id: number): KulgramState {
    const currentState = this.chatStateRepository.findById(id)
    if (!currentState) {
      this.chatStateRepository.insert({
        id,
        state: 'STOPED'
      })
      return 'STOPED'
    }
    return currentState.state
  }

  getBlockedPermissions(): IChatPermissions {
    return {
      can_add_web_page_previews: false,
      can_change_info: false,
      can_invite_users: true,
      can_pin_messages: false,
      can_send_media_messages: false,
      can_send_messages: false,
      can_send_other_messages: false,
      can_send_polls: false
    }
  }

  getAllowedPermissions(): IChatPermissions {
    return {
      can_add_web_page_previews: true,
      can_change_info: true,
      can_invite_users: true,
      can_pin_messages: true,
      can_send_media_messages: true,
      can_send_messages: true,
      can_send_other_messages: true,
      can_send_polls: true
    }
  }

  getPermissions(id: number): IChatPermissions {
    this.ensureStateExists(id)
    const chatState = this.chatStateRepository.findById(id)
    if (!chatState) {
      throw new ChatStateNotFoundError('Not Found')
    }
    return chatState.chatPermissions!
  }

  updatePermissions(id: number, permissions: IChatPermissions) {
    this.ensureStateExists(id)
    const chatState = this.chatStateRepository.findById(id)
    if (!chatState) {
      throw new ChatStateNotFoundError('Not Found')
    }
    chatState.chatPermissions = permissions
    this.chatStateRepository.upsert(chatState)
  }

  prepareKulgram(id: number) {
    this.ensureStateExists(id)
    this.chatStateRepository.updateKulgramState(id, 'STARTING')
  }

  confirmation(id: number) {
    this.ensureStateExists(id)
    this.chatStateRepository.updateKulgramState(id, 'CONFIRMATION')
  }

  startKulgram(id: number) {
    this.ensureStateExists(id)
    this.chatStateRepository.updateKulgramState(id, 'STARTED')
  }

  startQna(id: number) {
    this.ensureStateExists(id)
    this.chatStateRepository.updateKulgramState(id, 'START-QNA')
  }

  stopKulgram(id: number) {
    this.ensureStateExists(id)
    this.chatStateRepository.updateKulgramState(id, 'STOPED')
  }

  private ensureStateExists(id: number) {
    const currentState = this.chatStateRepository.findById(id)
    if (!currentState) {
      this.chatStateRepository.insert({
        id,
        state: 'STOPED'
      })
    }
  }
}
