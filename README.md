# Operations UI

A modern dashboard for managing operations, built with Next.js, React, and Tailwind CSS.

## Overview

Operations UI is a web-based management interface designed to provide an intuitive way to manage agents, devices, accounts, and clients. The application provides a clean and modern UI with responsive design and real-time data updates.

## Features

- **Dashboard Home**: Overview of all key metrics and entities
- **Agents Management**: Manage physical host machines
- **Devices Management**: Manage phones and emulators with detailed information
- **Accounts Management**: Manage social media accounts with client associations
- **Clients Management**: Manage client information with custom branding

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **State Management**: React Hooks
- **Styling**: Tailwind CSS with custom components
- **Backend Connection**: Supabase

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/alekturkmen/operations-ui.git
   cd operations-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Ask Alek for these. 

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is configured for easy deployment with Vercel. Simply connect your GitHub repository to Vercel and it will automatically deploy whenever changes are pushed to the main branch.

## License

This project is private and proprietary. Unauthorized copying, distribution, or use is strictly prohibited. 