import { Outlet, useLocation } from "react-router";
import SignUp from './Signup'
import authImage from "../../assets/auth.png"
import '../../index.css'
import Login from "./Login";

export default function Auth() {
    const location = useLocation();
    return <div className="flex">
        <section className='w-1/2'>
            <img src={authImage} />
        </section>
        {
            location.pathname == '/auth' ? <Login /> : <Outlet />
        }
    </div>
}