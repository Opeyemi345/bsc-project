import { useContext, useState, createContext } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import UserProfile, { AccountSettings } from './pages/UserProfile'
import ForgotPassword, { ResetPassword } from './pages/Auth/ForgotPassword'
import Signup from './pages/Auth/Signup'

const UserContext = createContext({
  firstname: "John",
  lastname: "Doe",
  email: "john.doe@example.com",
  username: "johndoe",
  id: '1',
  pictureUrl: 'https://res.cloudinary.com/dn98462wh/image/upload/v1748430469/me_dmn6kw.png',
  // pictureUrl: 'https://res.cloudinary.com/dn98462wh/image/upload/v1742921328/samples/people/boy-snow-hoodie.jpg',
  bio: "Test user unathenticated",
  token: "",
  userActivity: []
});

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path='/' element={<Dashboard />}>
          <Route path='account' element={<AccountSettings />}>
            <Route path='profile' element={<UserProfile />} />
            {/* <Route path='settings' element={<UserProfile />} /> */}
          </Route>
          <Route path='user/:id' element={<p>User 1 profile</p>}></Route>
          <Route path='post/:id' element={<p>Post 1</p>}></Route>
        </Route>


        <Route path='auth' element={<Auth />}>
          <Route path='create-account' element={<Signup />} />
          <Route path='forget-password' element={<ForgotPassword />} />
          <Route path='reset-password/:token' element={<ResetPassword />} />
        </Route>

        <Route path='*' element={<p className='flex p-10 justify-center'>Page not found - 404</p>}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export { UserContext };
export default App
