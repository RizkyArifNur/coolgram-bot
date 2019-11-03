import { ChatStateRepository } from '../repository'
import { KulgramState } from '../typings'

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

  prepareKulgram(id: number) {
    this.ensureStateExists(id)
    this.chatStateRepository.updateKulgramState(id, 'STARTING')
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
