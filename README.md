# OausConnect - University Social Network Platform

A comprehensive social networking platform designed specifically for Ondo State University (OAUS) students. OausConnect serves as the "home of connection that lasts" for university students, providing features for social interaction, content sharing, messaging, and community building.

## 🚀 Features

### ✅ Completed Features

- **User Authentication System**
  - User registration and login
  - JWT-based authentication
  - Password reset functionality
  - Email verification system
  - Protected routes and middleware

- **Content Management System**
  - Create, read, update, delete posts
  - Media upload support (images, videos, files)
  - Post upvoting system
  - Tag-based categorization
  - User feed with pagination

- **Real-time Chat System**
  - Direct messaging between users
  - Group chat functionality
  - Message history and pagination
  - File sharing in chats
  - Read receipts

- **Community Features**
  - Create and manage communities
  - Join/leave communities
  - Community categorization
  - Private and public communities
  - Member management

- **User Profile Management**
  - Comprehensive user profiles
  - Profile customization
  - User activity tracking
  - Avatar and bio management

### 🔄 In Development

- Real-time notifications
- Advanced search functionality
- Mobile responsiveness improvements
- Email notification system
- Advanced community moderation tools

## 🛠 Technology Stack

### Frontend
- **React 19.1.0** with TypeScript
- **Vite** for build tooling and HMR
- **TailwindCSS** for styling
- **Material-UI** components
- **React Router v7** for navigation
- **React Context API** for state management
- **React Toastify** for notifications
- **Date-fns** for date formatting

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **MongoDB** with **Mongoose ODM**
- **JWT** for authentication
- **bcrypt** for password hashing
- **Nodemailer** for email services
- **Swagger UI** for API documentation
- **Morgan** for HTTP logging
- **CORS** for cross-origin requests

## 📁 Project Structure

```
bsc-project/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React Context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   └── assets/         # Static assets
│   ├── public/             # Public assets
│   └── package.json        # Frontend dependencies
├── server/                 # Backend Express application
│   ├── controllers/        # Route controllers
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── config/            # Configuration files
│   ├── utils/             # Utility functions
│   └── package.json       # Backend dependencies
└── README.md              # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bsc-project
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Configuration**

   Create `.env` files in both server and client directories:

   **Server (.env)**
   ```env
   PORT=5000
   HOSTED_DB_URI=mongodb://localhost:27017/oausconnect
   SERVER_SECRET=your-super-secret-jwt-key-here
   CLIENT_URL=http://localhost:3000
   FRONTEND_URL=http://localhost:3000
   
   # Email configuration (optional)
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=your-email@gmail.com
   MAIL_PASS=your-app-password
   ```

   **Client (.env)**
   ```env
   VITE_API_URL=http://localhost:5000
   ```

5. **Start the development servers**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/api-docs

## 📚 API Documentation

The API is fully documented using Swagger UI. Once the server is running, visit:
`http://localhost:5000/api-docs`

### Main API Endpoints

- **Authentication**: `/auth/*`
- **Users**: `/users/*`
- **Content**: `/content/*`
- **Chat**: `/chat/*`
- **Communities**: `/communities/*`

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### Test Coverage

- Unit tests for API endpoints
- Integration tests for authentication flow
- Component tests for React components
- End-to-end tests for critical user flows

## 🚀 Deployment

### Production Build

```bash
# Build frontend
cd client
npm run build

# Build backend
cd server
npm run build
```

### Environment Variables for Production

Ensure all environment variables are properly configured for production:

- Database connection strings
- JWT secrets
- CORS origins
- Email service credentials

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: [Your Name]
- **Institution**: Ondo State University
- **Project Type**: Bachelor of Science Final Year Project

## 🙏 Acknowledgments

- Ondo State University for project support
- Open source community for the amazing tools and libraries
- Fellow students for feedback and testing

## 📞 Support

For support, email [damisco005@gmail.com] or create an issue in the repository.

---

**OausConnect** - Connecting university students, one interaction at a time. 🎓✨
