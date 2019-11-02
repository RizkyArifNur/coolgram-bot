import { ChatStateRepository } from '../repository'
import { KulgramState } from '../typings'

export class StateController {
  chatStateRepository = new ChatStateRepository()
  getCurrentState(id: number): KulgramState {
    const currentState = this.chatStateRepository.findById(id)
    if (!currentState) {
      this.chatStateRepository.insert({
        id,
        state: 'IDDLE'
      })
      return 'IDDLE'
    }
    return currentState.state
  }

  setIddle(id: number) {
    this.ensureStateExists(id)
    this.chatStateRepository.update(id, { state: 'IDDLE' })
  }

  setStarting(id: number) {
    this.ensureStateExists(id)
    this.chatStateRepository.update(id, { state: 'STARTING' })
  }

  setStarted(id: number) {
    this.ensureStateExists(id)
    this.chatStateRepository.update(id, { state: 'STARTED' })
  }

  setStartQna(id: number) {
    this.ensureStateExists(id)
    this.chatStateRepository.update(id, { state: 'START-QNA' })
  }

  private ensureStateExists(id: number) {
    const currentState = this.chatStateRepository.findById(id)
    if (!currentState) {
      this.chatStateRepository.insert({
        id,
        state: 'IDDLE'
      })
    }
  }
}
