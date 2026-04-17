import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyMessage } from 'viem';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { walletAddress, farcasterName, choice, signature, message } = await request.json();

    if (!walletAddress || !choice || !signature || !message) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
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

    // Check if the user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: { walletAddress: normalizedAddress },
    });

    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted and cannot change your response.' }, { status: 400 });
    }

    const vote = await prisma.vote.create({
      data: { walletAddress: normalizedAddress, farcasterName, choice },
    });

    return NextResponse.json(vote);
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
      const userVote = await prisma.vote.findUnique({
        where: { walletAddress: address.toLowerCase() },
        select: { choice: true }
      });
      return NextResponse.json(userVote);
    }

    const allVotes = await prisma.vote.findMany({
      select: { choice: true, farcasterName: true, walletAddress: true },
    });

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
