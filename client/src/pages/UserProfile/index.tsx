import Avatar from "@mui/material/Avatar"
import { useContext, useState } from "react"
import { UserContext } from "../../App";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { CiEdit } from "react-icons/ci";
import Button from "../../components/Button";
import Input, { MultilineInput } from "../../components/Input";
import { FaCamera, FaCameraRetro } from "react-icons/fa";
import { CiCamera } from "react-icons/ci";
import { MdCamera, MdCameraEnhance, MdCameraRear } from "react-icons/md";
// import { GiPadlock } from "react-icons/gi";
import Modal from "../../components/Modal";
import UserAvatar from "../../components/UserAvatar";
import { Popover } from "@mui/material";

export default function UserProfile() {
    const user = useContext(UserContext);
    const [openProfileModal, setOpenProfileModal] = useState(true);
    const [openPopover, setOpenPopover] = useState(false);

    return <div>
        <div className="bg-blue-300 h-52 rounded  relative"></div>
        <CiEdit className="m-10 w-7 h-7 cursor-pointer absolute hover:scale-110 transition-all" title="edit profile" onClick={() => setOpenProfileModal(true)} />
        <div className="mx-auto w-fit">
            <div className="-mt-24 ">
                <UserAvatar sx={{ width: 175, height: 175 }} />
            </div>
            <h2 className="text-center mt-3 text-2xl">{user.firstname + ' ' + user.lastname} ({user.username})</h2>
            <p className="text-[#888787] text-center">{user.bio}</p>
        </div>
        <p>User activities</p>


        <Modal size="lg" title="Edit profile" openModal={openProfileModal} closeModal={() => setOpenProfileModal(false)}>
            <div className="w-fit mx-auto relative" aria-describedby="profilepicture">
                <UserAvatar sx={{ width: 155, height: 155 }} alt='account'></UserAvatar>
                <div className="w-8 h-8 right-2 bottom-4 rounded-full absolute bg-white flex justify-center items-center">
                    <FaCamera size='25px' className="  hover:scale-95 transition-all cursor-pointer" onClick={() => setOpenPopover(!openPopover)}></FaCamera>
                    <Popover
                        id="profilepicture"
                        open={openPopover}
                        onClose={() => setOpenPopover(false)}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right'
                        }}
                    >
                        <ul className="p-3">
                            <li className="cursor-pointer hover:text-orange-700">View picture</li>
                            <li className="cursor-pointer my-2 hover:text-orange-700">Open camera</li>
                            <li className="cursor-pointer hover:text-orange-700">
                                Upload from device
                            </li>
                        </ul>
                    </Popover>
                </div>
            </div>
            {/* <CiCamera size='30px' className="mx-[53%] -mt-20"></CiCamera> */}
            <div className="grid grid-cols-2 gap-x-6 mt-3">
                <Input text="Username"></Input>
                <Input text="Firstname"></Input>
                <Input text="Lastname"></Input>
                <Input text="Telephone"></Input>
                {/* <Input text=""></Input> */}
            </div>
            <MultilineInput text="Bio" placeholder="Enter short bio..." error={false} errorMessage={""} outerStyle="w-[600px]" ></MultilineInput>
            <div className="w-[200px] mx-auto mt-5">
                <Button styles="mt-7">Update</Button>
            </div>
        </Modal>

    </div>
}

export function AccountSettings() {
    const navigate = useNavigate();
    const location = useLocation();
    const logout = () => {
        console.log('Logging out...');
    }
    console.log(location)

    const user = useContext(UserContext);

    return location.pathname === '/account' ?
        <div className="w-2/3 mx-auto mt-10 flex flex-col justify-between">
            <h3 className="text-3xl">Account</h3>
            <div className="my-5 ml-5">
                <p className="text-orange-600">Profile</p>
                <div className="flex my-5 items-center ">
                    <UserAvatar sx={{ width: 75, height: 75 }} />
                    <div className="ml-3">
                        <p>{user.firstname + ' ' + user.lastname}</p>
                        <small className="text-[#888787]">Joined july 19th 2024</small><br />
                        <Link to='profile'>
                            <small className="text-blue-600">view profile </small>
                        </Link>
                    </div>
                </div>
                <p className="text-[#888787]">Click on view profile above to edit your profile in the profile page.</p>
            </div>

            <h3 className="text-3xl">Settings</h3>
            <div className="my-5 ml-5">
                <p className="text-orange-600">Change password</p>
                <Input text="Old password" type="password" placeholder='Enter old password' outerStyle="w-[400px]" />
                <div className="my-4">

                    <Input text="New password" type="password" placeholder='Enter new password' outerStyle="w-[400px]" />
                </div>
                <div className="w-[185px] mt-3">
                    <Button>Change password</Button>
                </div>
            </div>
            <div className="mt-10">
                <Button styles="" color="error" variant='error' onClick={() => {
                    logout()
                    navigate('/auth');
                }}>Logout</Button>
            </div>
        </div> : <Outlet />
}