import { Button as MuiButton } from "@mui/material"

interface ButtonProps {
    children?: unknown,
    styles: string
    loading: boolean
    onClick?: () => void;
    color?: string
    type?: 'button' | 'submit' | 'reset';
}

export default function Button({ styles, loading, color, children, onClick, type = 'button' }: ButtonProps) {
    return <MuiButton className={`px-7 text-white py-7 w-full rounded-md block ${styles} ${loading ? 'bg-blue-300' : ''}`}
        disabled={loading}
        onClick={onClick}
        type={type}
        variant="contained"
        sx={{ padding: '10px' }}
        color={!color ? 'primary' : color}
    >
        {loading ?
            'Please wait...' : children
        }
    </MuiButton>
}