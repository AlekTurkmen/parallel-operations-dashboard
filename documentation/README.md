# Operations Dashboard

A modern dashboard for device and account management. This dashboard displays information from a CSV file and allows users to navigate between device numbers to view associated accounts.

## Features

- View device information with a skeuomorphic interface
- Navigate between devices using the number selector
- View accounts associated with each device
- Color-coded client names for easy identification
- Responsive design with dark mode

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- Shadcn UI Components
- PapaParse for CSV parsing

## Getting Started

First, ensure you have Node.js installed (version 18 or newer).

1. Clone the repository
2. Install the dependencies:
   ```bash
   npm install
   cd app
   npm install
   ```
3. Run the development server from the root directory:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## Project Structure

The application is organized as follows:
- Root directory contains the project configuration
- `/app` directory contains the Next.js application
- `/app/public` contains static assets including the CSV data file
- `/app/src` contains the application source code

## Data Structure

The dashboard loads data from a CSV file located in the `app/public` directory named `devices.csv`. The CSV should have the following columns:

- TikTok Handle
- URL
- AirDroid Link
- Image
- Serial Number
- Device Number
- Platform
- Model
- Client
- Client Email
- Phone Number
- Mobile Carrier
- IMEI
- Notes
- Checked
- Status
- Timestamp

## Design Notes

- Font: Lexend variable font
- Color scheme: Black, white, and dark purple gradients
- Skeuomorphic buttons with hover effects
- Phone image display with device number selector overlay 