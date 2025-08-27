# OAUSCONNECT - Frontend

Final year project at Ondo State University - A social media platform for university students.

## Features

- **Modern UI**: Built with React 19 and TypeScript
- **Responsive Design**: Tailwind CSS with Material-UI components
- **Authentication**: Complete auth flow with JWT tokens
- **Real-time Updates**: Live content feed and interactions
- **Content Creation**: Rich text editor for posts
- **Community Features**: Join and manage communities
- **User Profiles**: Customizable user profiles
- **Interactive Elements**: Voting, commenting, and sharing
- **Toast Notifications**: User feedback with react-toastify

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Material-UI
- **Routing**: React Router v7
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom service layer
- **Icons**: React Icons
- **Notifications**: React Toastify
- **Development**: ESLint + TypeScript ESLint

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Backend server running (see server README)

### Installation

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file:
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=OAUSCONNECT
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts (Auth, etc.)
│   ├── pages/          # Page components
│   ├── services/       # API service layer
│   ├── assets/         # Static assets
│   └── App.tsx         # Main app component
├── public/             # Public assets
└── index.html          # HTML template
```

## Key Components

### Authentication
- `AuthContext` - Global authentication state
- `ProtectedRoute` - Route protection wrapper
- Login/Signup forms with validation

### Content Management
- `ContentCard` - Display individual posts
- `Feed` - Main content feed
- `CreatePost` - Post creation interface

### Community Features
- `CommunityCard` - Community display component
- Community management interfaces

### API Integration
- `api.ts` - Centralized API service layer
- Type-safe API calls with proper error handling
- Automatic token management

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

- `VITE_API_URL` - Backend API URL
- `VITE_APP_NAME` - Application name
- `VITE_ENABLE_NOTIFICATIONS` - Enable/disable notifications
- `VITE_ENABLE_DARK_MODE` - Enable/disable dark mode
- `VITE_ENABLE_FILE_UPLOAD` - Enable/disable file uploads

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.
