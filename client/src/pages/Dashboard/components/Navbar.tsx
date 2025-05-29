import Modal from '../../../components/Modal';
import logo from '../../../assets/logo.png'
// import { VscAccount } from "react-icons/vsc";
// import { RiAccountCircleFill } from "react-icons/ri";
// import { LuBellDot } from "react-icons/lu";
// import { LuBell } from "react-icons/lu";
import Avatar from '@mui/material/Avatar';
import { VscBell } from "react-icons/vsc";
import { VscBellDot } from "react-icons/vsc";
import { Link } from 'react-router';
import { useState } from 'react';
import UserAvatar from '../../../components/UserAvatar';

export default function Navbar() {
    const notification = false;
    const [openNotificationModal, setOpenNotificationModal] = useState(false);
    return <nav className='flex justify-around items-center shadow-md'>
        <Link to='/'>
            <section className='flex items-center'>
                <img src={logo} className='w-[100px] h-[100px] block' />
                <div>
                    <h1 className='text-2xl font-semibold'>OAUSCONNECT</h1>
                    <small className='text-orange-600'>Home of connection that lasts</small>
                </div>
            </section>
        </Link>
        <section className='flex'>
            {/* <VscAccount className='text-2xl'/> */}
            <Link to='account'>
            <UserAvatar sx={{ width: 25, height: 25 }} className='transition-all hover:scale-125 cursor-pointer' alt='account'></UserAvatar>
                {/* <Avatar ></Avatar> */}
            </Link>
            {
                notification ? <VscBellDot className='text-2xl mx-5 transition-all hover:scale-125 cursor-pointer' title='notification' onClick={() => setOpenNotificationModal(true)} /> : <VscBell className='text-2xl mx-5 transition-all hover:scale-125 cursor-pointer' title='notification' onClick={() => setOpenNotificationModal(true)} />
            }
        </section>

        <Modal fixedTo='right' openModal={openNotificationModal} closeModal={() => setOpenNotificationModal(false)}>
            <div className='p-2'>
                <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio eius quo nesciunt ad in laudantium?
                </p>
                <small className='text-right block mr-3 text-gray-700'>17:45</small>
            </div>
            <div className='p-2'>
                <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio eius quo nesciunt ad in laudantium?
                </p>
                <small className='text-right block mr-3 text-gray-700'>17:45</small>
            </div>
            <div className='p-2'>
                <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio eius quo nesciunt ad in laudantium?
                </p>
                <small className='text-right block mr-3 text-gray-700'>17:45</small>
            </div>
        </Modal>
    </nav>
}