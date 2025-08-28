import { useAuth } from "../contexts/AuthContext";
import Avatar from "@mui/material/Avatar";

interface AvatarProps {
    sx: object
    className: string
    otherProps: object
}

export default function UserAvatar(props: AvatarProps) {
    const { sx, className, ...otherProps } = props
    const { user } = useAuth();
    // Use 'avater' to match the backend field name (note: this is a typo in the backend)
    const pictureUrl = user?.avater || user?.avatar;
    console.log('UserAvatar - user:', user?.firstname, 'pictureUrl:', pictureUrl);
    return <Avatar src={pictureUrl} sx={sx} className={className} {...otherProps} />
}