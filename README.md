# Inner Circle Finance

A comprehensive finance management platform built with Supabase and Vite in a monorepo architecture.

## 🏗️ Project Structure

This is a monorepo containing multiple applications and shared packages:

```
innercircle-finance/
├── apps/
│   ├── web/           # Main web application (Vite + React/Vue)
│   └── functions/     # Edge functions and serverless functions
├── packages/
│   └── shared/        # Shared utilities, types, and components
├── supabase/
│   ├── migrations/    # Database migration files
│   └── seeds/         # Database seed files
├── README.md
└── LICENSE
```

## 📱 Applications

### Web App (`apps/web/`)
The main frontend application built with:
- **Framework**: Vite + React/Vue
- **UI**: Modern component library
- **State Management**: Zustand/Pinia
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL

### Functions (`apps/functions/`)
Serverless functions and edge functions:
- **Supabase Edge Functions**
- **Database triggers and procedures**
- **Third-party integrations**
- **Background jobs**

## 📦 Packages

### Shared (`packages/shared/`)
Shared utilities and components:
- **TypeScript types and interfaces**
- **Utility functions**
- **Shared components**
- **Constants and configurations**
- **API clients**

## 🗄️ Database

### Supabase (`supabase/`)
Database management:
- **Migrations** (`supabase/migrations/`): Version-controlled database schema changes
- **Seeds** (`supabase/seeds/`): Sample data and initial database setup

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase CLI
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Munil123/innercircle-finance.git
cd innercircle-finance
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start Supabase locally:
```bash
supabase start
```

5. Run database migrations:
```bash
supabase db reset
```

6. Start the development server:
```bash
npm run dev
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development servers
- `npm run build` - Build all applications
- `npm run test` - Run tests across all packages
- `npm run lint` - Lint code
- `npm run type-check` - TypeScript type checking

### Working with the Database

```bash
# Create a new migration
supabase migration new <migration_name>

# Apply migrations
supabase db push

# Reset database (useful for development)
supabase db reset

# Generate types
supabase gen types typescript --local > packages/shared/types/database.ts
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Vite, React/Vue, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Functions**: Supabase Edge Functions
- **Styling**: Tailwind CSS / Styled Components
- **State Management**: Zustand / Pinia
- **Testing**: Vitest, Testing Library
- **Deployment**: Vercel / Netlify

### Key Features
- 🔐 **Authentication**: Secure user authentication with Supabase Auth
- 💾 **Real-time Database**: PostgreSQL with real-time subscriptions
- 📱 **Responsive Design**: Mobile-first responsive UI
- 🔒 **Row Level Security**: Database security with RLS policies
- 📊 **Analytics**: Built-in analytics and reporting
- 🌍 **Multi-tenant**: Support for multiple organizations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact the development team
- Check the documentation

---

**Made with ❤️ by the Inner Circle team**
