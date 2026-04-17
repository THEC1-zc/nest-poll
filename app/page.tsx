'use client';

import { useState, useEffect } from 'react';
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { Loader2, CheckCircle2, XCircle, Users } from 'lucide-react';
import sdk from '@farcaster/frame-sdk';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(false);
  const [yesVoters, setYesVoters] = useState<{ farcasterName: string | null; walletAddress: string }[]>([]);
  const [choice, setChoice] = useState<string | null>(null);
  const [fcUser, setFcUser] = useState<any>(null);
  const displayName = fcUser?.username
    ? `@${fcUser.username}`
    : address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : 'Connected wallet';

  useEffect(() => {
    const init = async () => {
      const context = await sdk.context;
      setFcUser(context?.user);
      sdk.actions.ready();
    };
    init();
    fetchVoters();
  }, []);

  const fetchVoters = async () => {
    try {
      const res = await fetch('/api/vote');
      const data = await res.json();
      if (Array.isArray(data)) {
        setYesVoters(data);
      }
    } catch (err) {
      console.error('Failed to fetch voters');
    }
  };

  const handleVote = async (voteChoice: 'yes' | 'no') => {
    if (!isConnected || !address) {
      const farcasterConnector = connectors.find(c => c.id === 'farcasterFrame');
      if (farcasterConnector) {
        connect({ connector: farcasterConnector });
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          choice: voteChoice,
          farcasterName: fcUser?.username || null 
        }),
      });

      if (res.ok) {
        setVoted(true);
        setChoice(voteChoice);
        fetchVoters();
      }
    } catch (err) {
      console.error('Vote failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 max-w-2xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-8 text-indigo-600">NEST Supporter Poll</h1>
      
      {!isConnected ? (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-indigo-50">
          <p className="text-lg mb-6 text-gray-700">
            {fcUser ? `Hi @${fcUser.username}! ` : ''}
            Connect your wallet to participate in the future of the Eggs project.
          </p>
          <button
            onClick={() => {
               const farcasterConnector = connectors.find(c => c.id === 'farcasterFrame');
               if (farcasterConnector) connect({ connector: farcasterConnector });
            }}
            className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-all transform hover:scale-105"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-indigo-50 w-full">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-full">
              {displayName}
            </span>
            <button onClick={() => disconnect()} className="text-xs text-red-500 hover:underline">
              Disconnect
            </button>
          </div>

          <p className="text-xl font-medium mb-8 text-gray-800 leading-relaxed">
            Would you buy one or all the early supporter NFT to launch the token that will be used for the next generation of the eggs project?
            <br />
            <span className="text-sm text-indigo-500 mt-2 block">(All income will go for initial liquidity pool)</span>
          </p>

          {!voted ? (
            <div className="flex gap-4 justify-center">
              <button
                disabled={loading}
                onClick={() => handleVote('yes')}
                className="flex items-center gap-2 bg-green-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-600 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                YES
              </button>
              <button
                disabled={loading}
                onClick={() => handleVote('no')}
                className="flex items-center gap-2 bg-red-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <XCircle />}
                NO
              </button>
            </div>
          ) : (
            <div className="py-4 text-green-600 font-bold flex flex-col items-center gap-2">
              <CheckCircle2 size={48} />
              <p>Thank you for your vote: {choice?.toUpperCase()}!</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-12 w-full">
        <h2 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2 text-gray-800">
          <Users className="text-indigo-600" />
          Supporters (YES Votes)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {yesVoters.length > 0 ? (
            yesVoters.map((voter, i) => (
              <div key={i} className="bg-white/50 backdrop-blur p-3 rounded-lg border border-indigo-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                  {voter.farcasterName ? voter.farcasterName[0].toUpperCase() : '?'}
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">
                    {voter.farcasterName ? `@${voter.farcasterName}` : 'Anonymous Supporter'}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono">
                    {voter.walletAddress.slice(0, 10)}...
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-full text-gray-400 italic">No YES votes yet. Be the first!</p>
          )}
        </div>
      </div>
    </main>
  );
}
