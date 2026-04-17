export interface OfflineSnapshot {
  offline: boolean;
  syncPending: boolean;
}

export class OfflineState {
  private isOffline = false;

  setOffline(state: boolean): void {
    this.isOffline = state;
  }

  getState(): OfflineSnapshot {
    return {
      offline: this.isOffline,
      syncPending: this.isOffline,
    };
  }
}
