This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

1. Node.js 18+ and npm
2. A Supabase account with a project
3. Supabase API keys

### Environment Setup

Create a `.env.local` file in this directory with the following content:

```
NEXT_PUBLIC_SUPABASE_URL=https://fhnrrxlyxllbnxhjzaqq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
```

Replace `your_anon_key` and `your_service_key` with your actual Supabase API keys.

### Database Setup

Before using the application, you need to set up the database schema in Supabase:

1. Use the SQL script in `scripts/supabase-schema.sql` to create the necessary tables.
2. If you have existing CSV data, place your CSV file at `public/devices.csv`.
3. Run the initialization script to populate Supabase with sample data:

```bash
SUPABASE_SERVICE_KEY=your_service_key NEXT_PUBLIC_SUPABASE_URL=your_supabase_url npx ts-node scripts/init-supabase-data.ts
```

### Running the Application

After setting up the environment and database, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

### About This Project

This application provides a UI for managing device and account information stored in a Supabase database. For detailed information about the database schema and implementation, see:

- `README-SUPABASE.md` - Detailed Supabase integration guide
- `scripts/supabase-schema.sql` - Database schema definition
- `scripts/init-supabase-data.ts` - Data initialization script

### Next.js Resources

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Supabase Resources

To learn more about Supabase:

- [Supabase Documentation](https://supabase.com/docs) - learn about Supabase features and API.
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript) - the JavaScript client library.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
