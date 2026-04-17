'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Loader2, CheckCircle2, XCircle, Users } from 'lucide-react';
import sdk from '@farcaster/miniapp-sdk';
import { WalletMenu } from '@/components/WalletMenu';

export default function Home() {
  const { address, isConnected } = useAccount();
  
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(false);
  const [yesVoters, setYesVoters] = useState<{ farcasterName: string | null; walletAddress: string }[]>([]);
  const [choice, setChoice] = useState<string | null>(null);
  const [fcUser, setFcUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const context = await sdk.context;
      setFcUser(context?.user);
      sdk.actions.ready();
    };
    init();
    fetchVoters();
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      checkExistingVote();
    } else {
      setVoted(false);
      setChoice(null);
    }
  }, [isConnected, address]);

  const checkExistingVote = async () => {
    try {
      const res = await fetch(`/api/vote?address=${address}`);
      const data = await res.json();
      if (data && data.choice) {
        setVoted(true);
        setChoice(data.choice);
      }
    } catch (err) {
      console.error('Failed to check vote');
    }
  };

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
    <main className="min-h-screen p-6 max-w-lg mx-auto flex flex-col items-center">
      {/* Header replicated logic */}
      <header className="w-full flex justify-between items-center mb-12">
        <div className="brand">
          <h2 className="text-xl font-bold text-accent-3 uppercase tracking-widest">NEST</h2>
        </div>
        <WalletMenu fcUser={fcUser} />
      </header>

      <div className="w-full space-y-8">
        <section className="bg-panel border border-card-border p-8 rounded-[32px] shadow-2xl backdrop-blur-md">
          <h1 className="text-3xl font-bold mb-6 text-center leading-tight">
            The Next Generation of Eggs
          </h1>
          
          <p className="text-lg text-muted-soft text-center mb-8 leading-relaxed">
            Would you buy one or all the early supporter NFT to launch the token that will be used for the next generation of the eggs project?
            <br />
            <span className="text-sm text-accent-3 mt-3 block font-bold">
              (All income will go for initial liquidity pool)
            </span>
          </p>

          {!isConnected ? (
             <div className="text-center py-4 text-accent">
                Please login with your wallet to vote.
             </div>
          ) : !voted ? (
            <div className="flex flex-col gap-4">
              <button
                disabled={loading}
                onClick={() => handleVote('yes')}
                className="flex items-center justify-center gap-3 bg-gradient-to-b from-green-500 to-green-700 text-white py-4 rounded-2xl font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                Yes, Count me in
              </button>
              <button
                disabled={loading}
                onClick={() => handleVote('no')}
                className="flex items-center justify-center gap-3 bg-gradient-to-b from-red-500 to-red-700 text-white py-4 rounded-2xl font-bold uppercase tracking-wider shadow-lg hover:scale-105 transition-all opacity-80"
              >
                {loading ? <Loader2 className="animate-spin" /> : <XCircle />}
                No
              </button>
            </div>
          ) : (
            <div className="py-6 text-green-400 font-bold flex flex-col items-center gap-3 bg-white/5 rounded-2xl border border-green-500/20">
              <CheckCircle2 size={48} />
              <p className="text-xl uppercase tracking-widest">Voted: {choice?.toUpperCase()}</p>
            </div>
          )}
        </section>

        <section className="w-full">
          <h2 className="text-xl font-bold mb-6 flex items-center justify-center gap-3 text-muted uppercase tracking-widest">
            <Users className="text-accent-3" size={20} />
            Supporters
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {yesVoters.length > 0 ? (
              yesVoters.map((voter, i) => (
                <div key={i} className="bg-bg-soft/40 backdrop-blur p-4 rounded-2xl border border-card-border/30 flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent-3/10 rounded-full flex items-center justify-center text-accent-3 font-bold border border-accent-3/20">
                    {voter.farcasterName ? voter.farcasterName[0].toUpperCase() : 'W'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-ink">
                      {voter.farcasterName ? `@${voter.farcasterName}` : 'Anonymous'}
                    </span>
                    <span className="text-[10px] text-muted-soft font-mono">
                      {voter.walletAddress.slice(0, 14)}...
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-soft italic opacity-60 py-8 border border-dashed border-card-border/20 rounded-2xl">
                Be the first to support the next generation!
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
