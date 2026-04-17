'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { Loader2, CheckCircle2, XCircle, Users, Check, X } from 'lucide-react';
import sdk from '@farcaster/miniapp-sdk';
import { WalletMenu } from '@/components/WalletMenu';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  
  const [loading, setLoading] = useState(false);
  const [voted, setVoted] = useState(false);
  const [yesVoters, setYesVoters] = useState<{ farcasterName: string | null; walletAddress: string }[]>([]);
  const [summary, setSummary] = useState({ yes: 0, no: 0, total: 0 });
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
      const res = await fetch(`/api/vote?address=${address}`, { cache: 'no-store' });
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
      const res = await fetch('/api/vote', { cache: 'no-store' });
      const data = await res.json();
      if (data && data.yesVoters) {
        setYesVoters(data.yesVoters);
        setSummary(data.summary);
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
      const message = `I am voting ${voteChoice.toUpperCase()} for NEST Next Gen Eggs poll.`;
      const signature = await signMessageAsync({ message });

      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          choice: voteChoice,
          farcasterName: fcUser?.username || null,
          signature,
          message
        }),
      });

      if (res.ok) {
        setVoted(true);
        setChoice(voteChoice);
        fetchVoters();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Vote failed');
      }
    } catch (err) {
      console.error('Vote failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen">
      <header className="app-header">
        <WalletMenu fcUser={fcUser} />
      </header>

      <main className="w-full max-w-[480px] p-4 flex flex-col gap-6 items-center">
        <section className="poll-panel">
          <h1 className="hero-title">
            The Next Gen
          </h1>
          
          <p className="poll-text">
            Would you buy one or all the early supporter NFT to launch the token that will be used for the next generation of the eggs project?
            <br />
            <span className="text-sm text-accent mt-3 block font-bold uppercase tracking-widest">
              (All income will go for initial liquidity pool)
            </span>
          </p>

          {!isConnected ? (
             <div className="text-center py-6 px-4 bg-white/5 border border-dashed border-card-border rounded-2xl text-muted-soft">
                PLEASE LOGIN WITH YOUR WALLET TO VOTE.
             </div>
          ) : !voted ? (
            <div className="flex flex-col gap-6 w-full">
              <div className="vote-button-grid">
                <button
                  disabled={loading}
                  onClick={() => handleVote('yes')}
                  className="vote-button vote-button-yes"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Check size={32} strokeWidth={3} />}
                  <span>Yes</span>
                </button>

                <button
                  disabled={loading}
                  onClick={() => handleVote('no')}
                  className="vote-button vote-button-no"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <X size={32} strokeWidth={3} />}
                  <span>No</span>
                </button>
              </div>

              <div className="vote-button-grid">
                 <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl font-bold text-green-400">{summary.yes}</span>
                    <span className="text-[10px] uppercase tracking-widest opacity-60">Votes Yes</span>
                 </div>
                 <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl font-bold text-red-400">{summary.no}</span>
                    <span className="text-[10px] uppercase tracking-widest opacity-60">Votes No</span>
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8 w-full">
              <div className="py-8 text-green-400 font-bold flex flex-col items-center gap-4 bg-white/5 rounded-3xl border border-green-500/30">
                <CheckCircle2 size={54} strokeWidth={2.5} />
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xs uppercase tracking-[0.2em] opacity-60">Your Choice</p>
                  <p className="text-3xl uppercase tracking-widest italic">{choice}</p>
                </div>
              </div>

              <div className="vote-button-grid">
                 <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl font-bold text-green-400">{summary.yes}</span>
                    <span className="text-[10px] uppercase tracking-widest opacity-60">Votes Yes</span>
                 </div>
                 <div className="flex flex-col items-center gap-1">
                    <span className="text-2xl font-bold text-red-400">{summary.no}</span>
                    <span className="text-[10px] uppercase tracking-widest opacity-60">Votes No</span>
                 </div>
              </div>
            </div>
          )}
        </section>

        <section className="w-full flex flex-col gap-4 mt-4">
          <h2 className="text-lg font-bold flex items-center justify-center gap-3 text-muted uppercase tracking-[0.15em]">
            <Users size={18} />
            Supporters Squad
          </h2>
          
          <div className="supporter-list">
            {yesVoters.length > 0 ? (
              yesVoters.map((voter, i) => (
                <div key={i} className="supporter-card">
                  <div className="wallet-avatar">
                    {voter.farcasterName ? voter.farcasterName[0].toUpperCase() : 'W'}
                  </div>
                  <div className="supporter-info">
                    <span className="supporter-name">
                      {voter.farcasterName ? `@${voter.farcasterName}` : 'Anonymous Voter'}
                    </span>
                    <span className="supporter-address">
                      {voter.walletAddress.slice(0, 6)}...{voter.walletAddress.slice(-4)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 opacity-40 italic text-sm">
                No supporters recorded yet.
              </div>
            )}
          </div>
        </section>

        <footer className="mt-8 mb-12 opacity-30 text-[10px] uppercase tracking-widest">
           NEST Poll • Next Generation
        </footer>
      </main>
    </div>
  );
}
