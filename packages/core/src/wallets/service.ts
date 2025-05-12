import { WalletExtension } from './extension';

export class WalletsService {
  constructor() {
    globalThis.addEventListener('eip6963:announceProvider', this.listener);
  }

  private requestProviderEvent = new Event('eip6963:requestProvider');

  private list: Map<string, WalletExtension> = new Map();

  private listener = (e: EipEventsMap['eip6963:announceProvider']) => {
    if (!this.list.has(e.detail.info.rdns)) {
      const wallet = new WalletExtension(e.detail);
      this.list.set(e.detail.info.rdns, wallet);
    }
  };

  async loadWallets(): Promise<Map<string, WalletExtension>> {
    globalThis.dispatchEvent(this.requestProviderEvent);
    return new Promise((resolve) => {
      requestAnimationFrame(() => resolve(this.list));
    });
  }

  protected dispose() {
    globalThis.removeEventListener('eip6963:announceProvider', this.listener);
  }
}
