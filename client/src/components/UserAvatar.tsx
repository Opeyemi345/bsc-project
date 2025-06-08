import { UserContext } from "../App";
import Avatar from "@mui/material/Avatar";
import { useContext } from "react";

interface AvatarProps {
    sx: object
    className: string
    otherProps: object
}

export default function UserAvatar(props: AvatarProps) {
    const {sx, className, ...otherProps} = props
    // console.log(otherProps)
    const {pictureUrl} = useContext(UserContext);
    // console.log(pictureUrl)
    return <Avatar src={pictureUrl} sx={sx} className={className} {...otherProps}/>
}