import {useEffect, type Ref} from "react";
import { MdCancel } from "react-icons/md";

interface ModalProps {
    title?: string,
    size?: 'lg' | 'md' | 'sm',
    children: ReactNode,
    dialogue?: boolean,
    fixedTo?: 'left' | 'right'
    closeModal: () => void,
    openModal: boolean,
    onRender?: ()=> void
}

export default function Modal({ title, size, dialogue, fixedTo, closeModal, openModal, children, onRender = ()=> {}}: ModalProps) {
    useEffect(()=> {
        onRender()
    }, [])
    return openModal &&
        <div className={`z-50 backdrop-blur-sm w-full h-screen fixed top-0 left-0 p-20 ${fixedTo && 'p-0'}`} onClick={closeModal} onKeyDownCapture={(e) => e.key === 'Escape' && closeModal()}>
            <section className={`bg-white mx-auto shadow-md rounded-md sticky overflow-auto
                ${size == 'lg' ? 'w-[1248px] h-[75vh]' : size == 'md' ? 'w-[800px] h-[65vh]' : size == 'sm' ? 'w-[500px] h-[50vh]' : 'h-[86vh]'}
                ${fixedTo == 'left' ? 'left-0 w-[450px] h-[100vh]' : fixedTo == 'right' ? 'left-full w-[450px] h-[100vh]' : ''}
            `}
                onClick={(e) => e.stopPropagation()}
            >
                <MdCancel className="text-red-400 scale-150  sticky left-4 top-5" title="close" onClick={closeModal} />
                <div className="p-5" >
                    {
                        (!dialogue && !fixedTo) && <>
                            <h1 className="text-2xl capitalize mt-7 ml-5">{title}</h1></>
                    }
                    <div className="my-5">
                        {
                            children
                        }
                    </div>
                </div>
            </section>
        </div>

}


interface videoProps {
    ref: Ref<HTMLVideoElement>,
    closeModal: () => void,
    openModal: boolean
}
export function MediaModal({ ref, closeModal, openModal }: videoProps) {
    return  openModal && <video className="h-max w-full" ref={ref} autoPlay={true}></video>
}