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
        <section className="cartoon-panel p-8">
          <h1 className="text-4xl font-black mb-6 text-center leading-tight uppercase italic tracking-tighter text-black">
            Next Gen Eggs?
          </h1>
          
          <p className="text-xl font-medium text-muted text-center mb-8 leading-relaxed">
            Support the launch of the new token for the next generation of the eggs project!
            <br />
            <span className="text-sm text-accent mt-3 block font-bold uppercase tracking-widest bg-yellow-200 inline-block px-2 py-1 rounded-lg border-2 border-black">
              All income goes to Liquidity Pool
            </span>
          </p>

          {!isConnected ? (
             <div className="text-center py-4 text-black font-bold text-lg bg-yellow-100 border-4 border-dashed border-black rounded-2xl">
                Connect your wallet to vote!
             </div>
          ) : !voted ? (
            <div className="flex flex-col gap-5">
              <button
                disabled={loading}
                onClick={() => handleVote('yes')}
                className="cartoon-button-yes flex items-center justify-center gap-3 text-black py-5 rounded-2xl font-black text-xl uppercase tracking-wider hover:translate-x-[-2px] hover:translate-y-[-2px] hover:box-shadow-[6px_6px_0px_#000]"
              >
                {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 strokeWidth={3} />}
                Yes, Count me in!
              </button>
              <button
                disabled={loading}
                onClick={() => handleVote('no')}
                className="cartoon-button-no flex items-center justify-center gap-3 text-black py-5 rounded-2xl font-black text-xl uppercase tracking-wider hover:translate-x-[-2px] hover:translate-y-[-2px] hover:box-shadow-[6px_6px_0px_#000]"
              >
                {loading ? <Loader2 className="animate-spin" /> : <XCircle strokeWidth={3} />}
                No thanks
              </button>
            </div>
          ) : (
            <div className="py-8 text-black font-black flex flex-col items-center gap-4 bg-green-100 rounded-3xl border-4 border-black shadow-[4px_4px_0px_#000]">
              <CheckCircle2 size={64} strokeWidth={3} className="text-green-600" />
              <p className="text-3xl uppercase italic tracking-tighter">You Voted: {choice?.toUpperCase()}!</p>
            </div>
          )}
        </section>

        {/* Vote Counter Section */}
        <section className="grid grid-cols-2 gap-6">
          <div className="cartoon-card p-6 rounded-3xl flex flex-col items-center justify-center bg-green-50">
            <span className="text-5xl font-black text-green-600">{summary.yes}</span>
            <span className="text-sm uppercase font-black tracking-widest text-black mt-2">YES!</span>
          </div>
          <div className="cartoon-card p-6 rounded-3xl flex flex-col items-center justify-center bg-red-50">
            <span className="text-5xl font-black text-red-600">{summary.no}</span>
            <span className="text-sm uppercase font-black tracking-widest text-black mt-2">NOPE</span>
          </div>
          <div className="col-span-2 cartoon-card p-4 rounded-3xl flex justify-between items-center px-8 bg-blue-50">
            <span className="text-lg uppercase font-black tracking-widest text-black">Total Votes</span>
            <span className="text-3xl font-black text-blue-600">{summary.total}</span>
          </div>
        </section>

        <section className="w-full">
          <h2 className="text-2xl font-black mb-6 flex items-center justify-center gap-3 text-black uppercase italic tracking-tighter">
            <Users className="text-black" size={28} strokeWidth={3} />
            The Squad
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {yesVoters.length > 0 ? (
              yesVoters.map((voter, i) => (
                <div key={i} className="cartoon-card p-5 rounded-2xl flex items-center gap-5 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform">
                  <div className="w-12 h-12 bg-yellow-300 rounded-full flex items-center justify-center text-black font-black border-4 border-black text-xl shadow-[2px_2px_0px_#000]">
                    {voter.farcasterName ? voter.farcasterName[0].toUpperCase() : 'W'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-black text-black text-lg">
                      {voter.farcasterName ? `@${voter.farcasterName}` : 'Anonymous'}
                    </span>
                    <span className="text-xs text-muted font-bold">
                      {voter.walletAddress.slice(0, 14)}...
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-black font-bold italic py-10 border-4 border-dashed border-black rounded-3xl bg-white/50">
                Waitin' for the first supporter... 🥚
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
