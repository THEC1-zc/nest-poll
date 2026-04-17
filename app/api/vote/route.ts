import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyMessage } from 'viem';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('POST /api/vote body:', body);
    const { walletAddress, farcasterName, choice, signature, message } = body;

    if (!walletAddress || !choice || !signature || !message) {
      console.error('Missing data:', { walletAddress, choice, signature: !!signature, message: !!message });
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Verify signature
    const isValid = await verifyMessage({
      address: walletAddress as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      console.error('Invalid signature for wallet:', walletAddress);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Check if the user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: { walletAddress },
    });

    if (existingVote) {
      console.warn('User already voted:', walletAddress);
      return NextResponse.json({ error: 'You have already voted and cannot change your response.' }, { status: 400 });
    }

    const vote = await prisma.vote.create({
      data: { walletAddress, farcasterName, choice },
    });

    console.log('Vote created:', vote);
    return NextResponse.json(vote);
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + (error as Error).message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (address) {
      const userVote = await prisma.vote.findUnique({
        where: { walletAddress: address },
        select: { choice: true }
      });
      console.log('GET /api/vote?address=', address, 'result:', userVote);
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
    console.error('GET /api/vote error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + (error as Error).message }, { status: 500 });
  }
}
