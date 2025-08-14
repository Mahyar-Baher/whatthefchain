import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ethers } from 'ethers';

const useWalletStore = create(
  persist(
    (set) => ({
      address: null,
      isConnected: false,
      connect: async () => {
        if (!window.ethereum) {
          throw new Error('MetaMask is not installed. Please install it to connect.');
        }
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const network = await provider.getNetwork();
          if (BigInt(network.chainId) !== BigInt(1)) {
            throw new Error('Please switch to Ethereum Mainnet in MetaMask.');
          }
          const accounts = await provider.send('eth_requestAccounts', []);
          if (accounts.length > 0) {
            set({ address: accounts[0], isConnected: true });
            console.log('Wallet connected:', accounts[0]);
          }
        } catch (error) {
          console.error('Connection failed:', error);
          throw error; // Let the component handle the error
        }
      },
      disconnect: () => {
        set({ address: null, isConnected: false });
        console.log('Wallet disconnected');
      },
    }),
    {
      name: 'wallet-storage',
    }
  )
);

export default useWalletStore;