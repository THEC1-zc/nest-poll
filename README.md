# NEST Supporter Poll

A Farcaster mini-app to poll supporters for the next generation of Eggs project.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Copy `.env.example` to `.env.local` and add your `NEXT_PUBLIC_REOWN_PROJECT_ID` from [Reown Cloud](https://cloud.reown.com).

3. Initialize the database:
   ```bash
   npx prisma db push
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Features

- Login with wallet (AppKit + Farcaster Connector)
- Voting (Yes/No)
- List of YES voters (saved in SQLite/Prisma)
