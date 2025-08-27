import { Link, NavLink, Outlet, useLocation } from "react-router";
import Navbar from "./components/Navbar";
import Modal from "../../components/Modal";
import Feed from "../../components/Feed";
import { useState } from "react";

export default function Dashboard() {
    const location = useLocation();
    // const authenticated = true;
    return <div>
        <Navbar />
        <div className="w-2/3 mx-auto">
            {
                location.pathname == '/' ? <Contents /> : <Outlet />
            }
        </div>
    </div>
}

function Contents() {
    return <main>
        <menu>
            <ul className="flex justify-center m-5">
                <li className="m-3"><NavLink to={'/'} className={({ isActive }) => isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}>Home</NavLink></li>
                <li className="m-3"><NavLink to={'/chat'} className={({ isActive }) => isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}>Chat</NavLink></li>
                <li className="m-3"><NavLink to={'/community'} className={({ isActive }) => isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}>Community</NavLink></li>
                <li className="m-3"><NavLink to={'/notifications-test'} className={({ isActive }) => isActive ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'}>🔔 Test</NavLink></li>
            </ul>
        </menu>

        {/* Main Feed */}
        <Feed />
    </main>
}