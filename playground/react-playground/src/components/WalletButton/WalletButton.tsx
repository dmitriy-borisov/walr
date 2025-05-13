import './WalletButton.css';
import { useWalr, type WalletExtension } from '@walr/plugin-react';

interface WalletButtonProps {
  wallet: WalletExtension;
}

export function WalletButton({ wallet }: WalletButtonProps) {
  const { connect } = useWalr();

  return (
    <button className="WalletButton" onClick={() => connect(wallet)}>
      <img src={wallet.info.icon} alt={wallet.info.name} />
      <span>{wallet.info.name}</span>
    </button>
  );
}
