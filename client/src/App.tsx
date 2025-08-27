import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from './contexts/AuthContext'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import UserProfile, { AccountSettings } from './pages/UserProfile'
import ForgotPassword, { ResetPassword } from './pages/Auth/ForgotPassword'
import Signup from './pages/Auth/Signup'
import Chat from './pages/Chat'
import Communities from './pages/Communities'
import CommunityDetail from './pages/CommunityDetail'
import NotificationTest from './components/NotificationTest'
import PostDetail from './pages/PostDetail'
import ProtectedRoute from './components/ProtectedRoute'
import "react-toastify/dist/ReactToastify.css"

const LazyDashboard = lazy(() => import('./pages/Dashboard'))

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={
            <ProtectedRoute>
              <Suspense fallback={<div className='flex items-center justify-center text-xl h-screen'>Please wait...</div>}>
                <LazyDashboard />
              </Suspense>
            </ProtectedRoute>
          }>
            <Route path='account' element={<AccountSettings />}>
              <Route path='profile' element={<UserProfile />} />
            </Route>
            <Route path='chat' element={<Chat />} />
            <Route path='community' element={<Communities />} />
            <Route path='community/:id' element={<CommunityDetail />} />
            <Route path='notifications-test' element={<NotificationTest />} />
            <Route path='user/:id' element={<p>User 1 profile</p>}></Route>
            <Route path='post/:id' element={<PostDetail />}></Route>
          </Route>

          <Route path='auth' element={<Auth />}>
            <Route path='create-account' element={<Signup />} />
            <Route path='forget-password' element={<ForgotPassword />} />
            <Route path='reset-password/:token' element={<ResetPassword />} />
          </Route>

          <Route path='*' element={<p className='flex p-10 justify-center'>Page not found - 404</p>}></Route>
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
