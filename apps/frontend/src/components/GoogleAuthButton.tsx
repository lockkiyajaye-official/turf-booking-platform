import type { ButtonHTMLAttributes } from "react";
import { GoogleIcon } from "./Icons";

interface GoogleAuthButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
}

export function GoogleAuthButton({
    label,
    className = "",
    type = "button",
    ...rest
}: GoogleAuthButtonProps) {
    return (
        <button
            type={type}
            {...rest}
            className={
                "w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 " +
                className
            }
        >
            <GoogleIcon className="w-5 h-5 mr-2" />
            {label}
        </button>
    );
}

