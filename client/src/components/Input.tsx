import type { ReactNode } from "react";

interface InputProps {
    type?: string,
    text: string,
    value: string,
    placeholder: string,
    innerStyle?: string,
    outerStyle?: string,
    error: boolean,
    errorMessage: string,
    icon?: ReactNode,
    otherProps: object
}


export default function Input({ type, value, innerStyle, outerStyle, placeholder, text, icon, error, errorMessage = 'An error occured.' }: InputProps) {
    return <div className='m-2'>
        {
            text && <label htmlFor={text} className={''}>{text}</label>
        }
        <div className={`${outerStyle} border flex items-center p-3 border-[#ccc] rounded-lg focus-within:outline outline-4 outline-blue-400`}>
            {
                icon && <div className='p-1 border-r-2'>{icon}</div>
            }
            <input type={type ? type : 'text'}
                value={value}
                placeholder={placeholder}
                className={`${innerStyle} w-full outline-none px-2`}
                id={text}
            />
        </div>
        {error && <small className='text-red-500'>{errorMessage}</small>}
    </div>
}

export function MultilineInput({ text, value, innerStyle, outerStyle, placeholder, icon, error, errorMessage, otherProps }: InputProps) {
    console.log(otherProps);
    return <div className='ml-2 mt-3'>
        {
            text && <label htmlFor={text} className={''}>{text}</label>
        }
        <div className={`${outerStyle} border flex items-center p-2 rounded-md border-[#ccc]`}>
            {
                icon && <div className='p-1 border-r-2'>{icon}</div>
            }
            <textarea
                value={value}
                placeholder={placeholder}
                className={`${innerStyle} w-full outline-none px-2`}
                rows={5}
            />
        </div>
        {error && <small className='text-red-500'>{errorMessage}</small>}
    </div>
}