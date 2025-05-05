# Operations UI Dashboard

This is a modern UI for managing the operations database, built with Next.js, React, and Tailwind CSS, connecting to Supabase for data storage.

## Project Structure

```
app/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── dashboard/          # Dashboard pages
│   │   │   ├── page.tsx        # Main dashboard page with 4 entity cards
│   │   │   ├── layout.tsx      # Shared dashboard layout with navigation
│   │   │   ├── agents/         # Agents section 
│   │   │   ├── devices/        # Devices section
│   │   │   ├── accounts/       # Accounts section (to be implemented)
│   │   │   └── clients/        # Clients section (to be implemented)
│   ├── components/             # Reusable components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   │   └── EntityCard.tsx  # Card component for entity counts
│   │   └── magicui/            # UI components with animations
│   │       └── number-ticker.tsx # Animated number counter
│   ├── lib/                    # Utility functions and data access
│   │   ├── data.ts             # Data access functions for Supabase
│   │   ├── supabase-client.ts  # Supabase client configuration
│   │   └── utils.ts            # General utility functions
│   └── types/                  # TypeScript type definitions
│       ├── device.ts           # Device interface (existing)
│       └── index.ts            # Entity type definitions
```

## Implemented Features

- Dashboard home page with 4 entity cards (agents, devices, accounts, clients)
- Navigation between dashboard sections
- Agents management page with table view
- Devices management page with grid view
- Number animations for entity counts
- Dark mode UI design
- Mobile-responsive layout

## To-Do / Future Development

1. Implement the Accounts section page
2. Implement the Clients section page
3. Add create/edit forms for each entity type
4. Add detailed view pages for individual entities
5. Implement authentication and authorization
6. Add data visualization and reports
7. Implement real-time updates with Supabase subscriptions
8. Add filtering and sorting options to list views
9. Implement pagination for large datasets
10. Create unit and integration tests

## Design Guidelines

- Use a dark theme with the following color palette:
  - Background: bg-gray-900
  - Card/Container Background: bg-gray-800
  - Accent: bg-indigo-600 (with hover: bg-indigo-700)
  - Text: text-white, text-gray-300 (secondary)
  - Success: bg-green-600
  - Warning: bg-yellow-600
  - Error: bg-red-600

- Maintain consistent border radius with rounded-lg
- Use consistent padding and spacing
- Ensure all interactive elements have hover states
- For entity cards, use the following colors:
  - Agents: Red
  - Devices: Blue
  - Accounts: Green
  - Clients: Yellow

## Development Guide

1. To add a new entity section:
   - Create a new folder under app/dashboard/ for the entity
   - Create a page.tsx file in the folder
   - Follow the pattern in the existing entity pages
   - Add a route to the navigation in layout.tsx if needed

2. To add a new entity form:
   - Create a reusable form component under components/forms/
   - Use React Hook Form for form state management
   - Add validation using zod
   - Follow the same styling patterns as existing components

3. To add new data access functions:
   - Add the functions to lib/data.ts
   - Use the existing pattern for error handling and type safety
   - Ensure the function returns typed data

## Notes on Scalability

- The project is structured to be scalable and maintainable
- Components are modular and reusable
- Data access is centralized in the lib/data.ts file
- Types are defined in the types/ directory
- The UI is responsive and works on all screen sizes
- The navigation system supports adding new sections easily 