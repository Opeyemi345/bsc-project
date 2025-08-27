import { useAuth } from "../contexts/AuthContext";
import Avatar from "@mui/material/Avatar";

interface AvatarProps {
    sx: object
    className: string
    otherProps: object
}

export default function UserAvatar(props: AvatarProps) {
    const { sx, className, ...otherProps } = props
    // console.log(otherProps)
    const { user } = useAuth();
    const pictureUrl = user?.avatar;
    // console.log(pictureUrl)
    return <Avatar src={pictureUrl} sx={sx} className={className} {...otherProps} />
}