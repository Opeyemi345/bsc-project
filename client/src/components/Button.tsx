import { Button as MuiButton } from "@mui/material"

interface ButtonProps {
    children?: unknown,
    styles: string
    loading: boolean
    onClick: () => void;
    color?: string
}

export default function Button({ styles, loading, color, children, onClick }: ButtonProps) {
    return <MuiButton className={`px-7 text-white py-7 w-full rounded-md block ${styles} ${loading ? 'bg-blue-300' : ''}`}
        disabled={loading}
        onClick={onClick}
        variant="contained"
        sx={{padding: '10px'}}
        color={!color ? 'primary' : color}
    >
        {loading ?
            'Please wait...' : children
        }
    </MuiButton>
}