import { Link, NavLink, Outlet, useLocation } from "react-router";
import Navbar from "./components/Navbar";
import Modal from "../../components/Modal";
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
                <li className="m-3"><NavLink to={'/'}>Home</NavLink></li>
                <li className="m-3"><NavLink to={'/chat'}>Chat</NavLink></li>
                <li className="m-3"><NavLink to={'/community'}>Community</NavLink></li>
            </ul>
        </menu>
    </main>
}