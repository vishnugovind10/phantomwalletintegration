import React from 'react';
import { isDesktop } from 'react-device-detect';
import styled from 'styled-components';
import Button from '../../components/Button/Button';
import Text from '../../components/Text/Text';
import MoreHorizontal from '../../components/Svg/Icons/MoreHorizontal';
import { ButtonProps } from '../../components/Button';
import { connectorLocalStorageKey, walletConnectConfig, walletLocalStorageKey } from './config';
import { Login, Config } from './types';

interface Props {
  walletConfig: Config;
  login: Login;
  onDismiss: () => void;
}

const WalletButton = styled(Button).attrs({ width: '100%', variant: 'text', py: '16px' })`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: auto;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
`;

interface MoreWalletCardProps extends ButtonProps {
  t: (key: string) => string;
}

export const MoreWalletCard: React.FC<MoreWalletCardProps> = ({ t, ...props }) => {
  return (
    <WalletButton variant="tertiary" {...props}>
      <MoreHorizontal width="40px" mb="8px" color="textSubtle" />
      <Text fontSize="1.2rem">{t('More')}</Text>
    </WalletButton>
  );
};

const WalletCard: React.FC<Props> = ({ login, walletConfig, onDismiss }) => {
  const { title, icon: Icon } = walletConfig;

  return (
    <WalletButton
      variant="tertiary"
      onClick={async () => {
        // Handle Phantom Wallet
        if (title === 'Phantom') {
          if (window.solana && window.solana.isPhantom) {
            try {
              const resp = await window.solana.connect();
              const publicKey = resp?.publicKey?.toBase58();
              if (publicKey) {
                alert(`Phantom wallet connected!\nAddress: ${publicKey}`);
                console.log('Connected to Phantom. Public key:', publicKey);
                localStorage.setItem('phantomPublicKey', publicKey);
                localStorage.setItem(walletLocalStorageKey, walletConfig.title);
                localStorage.setItem(connectorLocalStorageKey, walletConfig.connectorId);
              } else {
                console.error('No public key found after connecting.');
              }
            } catch (error) {
              console.error('Connection to Phantom failed:', error);
            }
          } else {
            alert('Phantom Wallet is not installed. Please install it from https://phantom.app/');
          }
          onDismiss(); // Close the modal regardless
          return;
        }

        // Trust Wallet via WalletConnect on desktop
        if (title === 'Trust Wallet' && walletConnectConfig && isDesktop) {
          login(walletConnectConfig.connectorId);
          localStorage?.setItem(walletLocalStorageKey, walletConnectConfig.title);
          localStorage?.setItem(connectorLocalStorageKey, walletConnectConfig.connectorId);
          onDismiss();
          return;
        }

        // Default EVM wallet handler
        if (!window.ethereum && walletConfig.href) {
          window.open(walletConfig.href, '_blank', 'noopener noreferrer');
        } else {
          login(walletConfig.connectorId);
          localStorage?.setItem(walletLocalStorageKey, walletConfig.title);
          localStorage?.setItem(connectorLocalStorageKey, walletConfig.connectorId);
        }
        onDismiss();
      }}
      id={`wallet-connect-${title.toLocaleLowerCase()}`}
    >
      <Icon width="50px" mb="8px" />
      <Text textTransform="uppercase" color="text" fontSize="1.3rem">
        {title}
      </Text>
    </WalletButton>
  );
};

export default WalletCard;
