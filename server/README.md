# OAUSCONNECT - Backend API

Final year project at Ondo State University - A social media platform for university students.

## Features

- **User Authentication**: JWT-based authentication with login, signup, password reset
- **Content Management**: Create, read, update, delete posts with media support
- **Community System**: Create and manage communities with member roles
- **Commenting System**: Nested comments with voting functionality
- **Real-time Features**: Upvoting/downvoting system
- **Email Integration**: Password reset and email verification
- **API Documentation**: Swagger/OpenAPI documentation

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Email**: Nodemailer with Gmail OAuth2
- **Documentation**: Swagger UI
- **Testing**: Jest with Supertest
- **Validation**: Custom validation utilities
- **Error Handling**: Centralized error handling with custom error classes

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Opeyemi345/bsc-project.git
cd bsc-project/server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
HOSTED_DB_URI=mongodb://localhost:27017/gig_social
SERVER_SECRET=your-super-secret-jwt-key-here
CLIENT_URL=http://localhost:3000
MAIL_USER=your-email@gmail.com
# ... other variables
```

4. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### API Documentation

Once the server is running, visit `http://localhost:5000/api-docs` to view the interactive API documentation.

### Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password/:token` - Reset password
- `GET /auth/verify-email/:token` - Verify email

### Users
- `GET /users` - Get all users (paginated)
- `GET /users/me` - Get current user profile
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user account
- `PUT /users` - Update user profile
- `DELETE /users` - Delete user account

### Content
- `GET /content` - Get all content (paginated, filtered)
- `GET /content/:id` - Get content by ID
- `POST /content` - Create new content
- `PUT /content/:id` - Update content
- `DELETE /content/:id` - Delete content
- `POST /content/:id/vote` - Vote on content

### Comments
- `GET /content/:contentId/comments` - Get comments for content
- `POST /content/:contentId/comments` - Create comment
- `PUT /content/comments/:id` - Update comment
- `DELETE /content/comments/:id` - Delete comment
- `POST /content/comments/:id/vote` - Vote on comment

### Communities
- `GET /communities` - Get all communities
- `GET /communities/:id` - Get community by ID
- `POST /communities` - Create new community
- `PUT /communities/:id` - Update community
- `DELETE /communities/:id` - Delete community
- `POST /communities/:id/join` - Join community
- `POST /communities/:id/leave` - Leave community

### Health Check
- `GET /health` - Server health status

## Project Structure

```
server/
├── controllers/     # Route handlers
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic services
├── utils/          # Utility functions
├── config/         # Configuration files
├── types/          # TypeScript type definitions
├── tests/          # Test files
└── app.ts          # Express app setup
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.
