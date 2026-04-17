import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import farcaster from '@farcaster/miniapp-wagmi-connector'

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    farcaster(),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
})
