'use client';

import { useState, useMemo } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function WalletMenu({ fcUser }: { fcUser: any }) {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [isOpen, setIsOpen] = useState(false);

  const farcasterConnector = useMemo(
    () => connectors.find((item) => item.id === 'farcaster'),
    [connectors]
  );

  const isFarcasterSession = connector?.id === 'farcaster';

  if (!isConnected || !address) {
    return (
      <div className="wallet-menu">
        <button 
          className="wallet-menu-trigger" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="wallet-menu-login">Login</span>
        </button>

        {isOpen && (
          <div className="wallet-menu-popover">
            <button
              className="connect-button connect-button-farcaster"
              onClick={() => {
                if (farcasterConnector) connect({ connector: farcasterConnector });
                setIsOpen(false);
              }}
              disabled={isPending}
            >
              Connect Wallet
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="wallet-menu">
      <button
        className="wallet-menu-trigger wallet-menu-trigger-connected"
        onClick={() => setIsOpen(!isOpen)}
      >
        {fcUser?.pfpUrl ? (
          <img
            src={fcUser.pfpUrl}
            alt={fcUser.username}
            className="wallet-avatar"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <span className="wallet-avatar">
            {fcUser?.username ? fcUser.username[0].toUpperCase() : 'W'}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="wallet-menu-popover">
          <div className="wallet-identity-chip">
            <strong>{fcUser?.username ? `@${fcUser.username}` : 'Wallet'}</strong>
            <span>{formatAddress(address)}</span>
          </div>
          <button
            className="disconnect-button"
            onClick={() => {
              disconnect();
              setIsOpen(false);
            }}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
