import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { walletAddress, farcasterName, choice } = await request.json();

    if (!walletAddress || !choice) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const vote = await prisma.vote.upsert({
      where: { walletAddress },
      update: { choice, farcasterName },
      create: { walletAddress, farcasterName, choice },
    });

    return NextResponse.json(vote);
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const yesVoters = await prisma.vote.findMany({
      where: { choice: 'yes' },
      select: { farcasterName: true, walletAddress: true },
    });

    return NextResponse.json(yesVoters);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
