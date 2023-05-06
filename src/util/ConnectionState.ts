export enum ConnectionState {
  DISCONNECTED,
  SCANNING,
  CONNECTING,
  CONNECTED,
  ERROR,
}

export function getEmoji(state: ConnectionState): string {
  switch (state) {
    case ConnectionState.DISCONNECTED:
      return '📴';
    case ConnectionState.SCANNING:
      return '🌀';
    case ConnectionState.CONNECTING:
      return '📳';
    case ConnectionState.CONNECTED:
      return '📶';
    case ConnectionState.ERROR:
      return '📵';
  }
}
