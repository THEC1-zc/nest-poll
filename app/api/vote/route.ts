import { NextResponse } from 'next/server';
import { verifyMessage } from 'viem';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { walletAddress, farcasterName, choice, signature, message } = await request.json();

    if (!walletAddress || !choice || !signature || !message) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    if (choice !== 'yes' && choice !== 'no') {
      return NextResponse.json({ error: 'Invalid choice' }, { status: 400 });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // Verify signature
    const isValid = await verifyMessage({
      address: normalizedAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    try {
      await db.execute({
        sql: 'INSERT INTO Vote (walletAddress, farcasterName, choice) VALUES (?, ?, ?)',
        args: [normalizedAddress, farcasterName, choice],
      });

      return NextResponse.json({
        walletAddress: normalizedAddress,
        farcasterName,
        choice,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('UNIQUE constraint failed: Vote.walletAddress')
      ) {
        return NextResponse.json(
          { error: 'You have already voted and cannot change your response.' },
          { status: 400 },
        );
      }

      throw error;
    }
  } catch (error) {
    console.error('VOTE POST ERROR:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (address) {
      const result = await db.execute({
        sql: 'SELECT choice FROM Vote WHERE walletAddress = ? LIMIT 1',
        args: [address.toLowerCase()],
      });

      const row = result.rows[0] as { choice?: string } | undefined;
      return NextResponse.json(row?.choice ? { choice: row.choice } : null);
    }

    const result = await db.execute({
      sql: 'SELECT choice, farcasterName, walletAddress FROM Vote ORDER BY createdAt DESC',
    });
    const allVotes = result.rows.map((row) => ({
      choice: String(row.choice),
      farcasterName: row.farcasterName ? String(row.farcasterName) : null,
      walletAddress: String(row.walletAddress),
    }));

    const summary = {
      yes: allVotes.filter(v => v.choice === 'yes').length,
      no: allVotes.filter(v => v.choice === 'no').length,
      total: allVotes.length
    };

    const yesVoters = allVotes
      .filter(v => v.choice === 'yes')
      .map(v => ({ farcasterName: v.farcasterName, walletAddress: v.walletAddress }));

    return NextResponse.json({ yesVoters, summary });
  } catch (error) {
    console.error('VOTE GET ERROR:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
