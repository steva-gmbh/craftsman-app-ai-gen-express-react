# CraftsmanApp (AI generated)

A modern web application with AI assistant for craftsmen to manage their business.

This APP was build in a simple (no comprehensive rule files were used) AI development process 
using Cursor IDE and Claude Sonnet 3.7

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
- OpenAI API key for the AI Assistant feature

### Installation

1. Clone the repository:
```bash
git clone https://github.com/steva-gmbh/craftsman-app-ai-gen-express-react.git
cd craftsman-app-ai-gen-express-react
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `modules/frontend` directory and add your OpenAI API key:
```bash
VITE_OPENAI_API_KEY=your-openai-api-key-here
```

4. Start the development servers:
```bash
# Using the start script (recommended)
./start.sh

# Or with database seeding
./start.sh --seed

# Alternatively, you can start the servers manually:
cd modules/backend && npm run dev
cd modules/frontend && npm run dev
```

The application will be available at http://localhost:5173.

## Project Structure

```
craftsman-app-ai-gen-express-react/
├── modules/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── contexts/
│   │   │   ├── providers/
│   │   │   ├── services/
│   │   │   ├── tests/
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   ├── index.css
│   │   │   └── vite-env.d.ts
│   │   ├── screenshots/
│   │   ├── reports/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsconfig.node.json
│   │   ├── tsconfig.test.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   └── index.html
│   └── backend/
│       ├── src/
│       │   ├── controllers/
│       │   ├── routes/
│       │   ├── ai/
│       │   ├── app.ts
│       │   ├── server.ts
│       │   ├── socket.ts
│       │   └── index.ts
│       ├── prisma/
│       ├── test/
│       │   ├── features/
│       │   ├── steps/
│       │   ├── support/
│       │   └── unit/
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsconfig.test.json
│       ├── jest.config.js
│       └── cucumber.js
├── package.json
├── package-lock.json
├── turbo.json
├── start.sh
├── test.sh
├── CONTRIBUTING.md
└── .gitignore
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
