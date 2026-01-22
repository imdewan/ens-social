# ENS Social

A Next.js application for exploring ENS profiles and visualizing social connections on the blockchain.

## Features

- **ENS Profile Lookup**: Search any ENS name to view its resolved address, avatar, and text records
- **Social Graph**: Visualize friendships between ENS names as an interactive network graph
- **Friendship Management**: Create and delete connections between ENS users
- **Real-time ENS Resolution**: Validates ENS names against Ethereum mainnet before adding to the graph

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **ENS Resolution**: ethers.js v6
- **Graph Visualization**: vis-network
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted, e.g., Neon)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ens-social
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your database URL:

```
DATABASE_URL="postgresql://user:password@localhost:5432/ens_social?schema=public"
```

Optionally add a custom Ethereum RPC URL for better reliability:

```
ETHEREUM_RPC_URL="https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
```

4. Push the database schema:

```bash
npm run db:push
```

5. Generate Prisma client:

```bash
npm run db:generate
```

6. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
ens-social/
├── app/
│   ├── api/
│   │   ├── friendship/    # Create/delete friendships
│   │   ├── graph/         # Get graph data (nodes + edges)
│   │   └── user/          # Delete users
│   ├── graph/             # Interactive graph visualization
│   ├── profile/[ens]/     # ENS profile page
│   ├── search/            # ENS search page
│   └── page.tsx           # Landing page
├── lib/
│   ├── db/
│   │   └── prisma.ts      # Prisma client singleton
│   ├── ens/
│   │   └── resolver.ts    # ENS resolution utilities
│   └── graph/
│       └── network.ts     # vis-network configuration
├── prisma/
│   └── schema.prisma      # Database schema
└── .env.example           # Environment template
```

## API Routes

### POST /api/friendship

Create a friendship between two ENS names.

```json
{
  "initiator": "alice.eth",
  "receiver": "bob.eth"
}
```

### DELETE /api/friendship

Delete a friendship.

```json
{
  "initiator": "alice.eth",
  "receiver": "bob.eth"
}
```

### GET /api/graph

Returns all users as nodes and friendships as edges.

```json
{
  "nodes": [{ "id": "alice.eth", "label": "alice.eth" }],
  "edges": [{ "id": "...", "from": "alice.eth", "to": "bob.eth" }]
}
```

### DELETE /api/user

Delete a user and all their friendships.

```json
{
  "ensName": "alice.eth"
}
```

## Database Scripts

```bash
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

## License

MIT
# ens-social
