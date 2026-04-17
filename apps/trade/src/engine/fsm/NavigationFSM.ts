import { SystemState } from '../../shared/contracts/types';

export class NavigationFSM {
  private currentState: SystemState = SystemState.INITIALIZING;
  private listeners: ((state: SystemState) => void)[] = [];

  constructor() {
    this.transitionTo(SystemState.NOMINAL);
  }

  public getState(): SystemState {
    return this.currentState;
  }

  public transitionTo(newState: SystemState) {
    // Implement guards and transition logic here
    console.log(`[NavigationFSM] Transitioning from ${this.currentState} to ${newState}`);
    this.currentState = newState;
    this.notifyListeners();
  }

  public subscribe(listener: (state: SystemState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentState));
  }
}

export const navFSM = new NavigationFSM();
