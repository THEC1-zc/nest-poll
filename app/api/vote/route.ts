import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { walletAddress, farcasterName, choice } = await request.json();

    if (!walletAddress || !choice) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Check if the user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: { walletAddress },
    });

    if (existingVote) {
      return NextResponse.json({ error: 'You have already voted and cannot change your response.' }, { status: 400 });
    }

    const vote = await prisma.vote.create({
      data: { walletAddress, farcasterName, choice },
    });

    return NextResponse.json(vote);
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
      return NextResponse.json(userVote);
    }

    const yesVoters = await prisma.vote.findMany({
      where: { choice: 'yes' },
      select: { farcasterName: true, walletAddress: true },
    });

    return NextResponse.json(yesVoters);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
