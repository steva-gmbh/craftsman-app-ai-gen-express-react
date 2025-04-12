# HandwerkerApp

A modern web application for craftsmen (handwerker) to manage their business, inspired by the "hero" application.

## Features

- Dashboard with key metrics and recent jobs
- Job management with filtering and status tracking
- Customer management with contact information
- Settings for profile, business, billing, and notifications
- Modern UI with Tailwind CSS
- TypeScript for type safety
- React Query for data fetching
- React Router for navigation

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/handwerker-app.git
cd handwerker-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173.

## Project Structure

```
handwerker-app/
├── modules/
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── App.tsx
│       │   └── index.css
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── tailwind.config.js
└── package.json
```

## Development

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run lint` - Run the linter
- `npm run test` - Run tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 