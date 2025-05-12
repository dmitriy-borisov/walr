import './WalletButton.css';
import { useRiftDAppSDK, type WalletExtension } from '@walr/react';

interface WalletButtonProps {
  wallet: WalletExtension;
}

export function WalletButton({ wallet }: WalletButtonProps) {
  const { connect } = useRiftDAppSDK();

  return (
    <button className="WalletButton" onClick={() => connect(wallet)}>
      <img src={wallet.info.icon} alt={wallet.info.name} />
      <span>{wallet.info.name}</span>
    </button>
  );
}
