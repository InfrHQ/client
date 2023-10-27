import ThemeToggle from '../ThemeToggle';
import { useEffect } from 'react';
export function Welcome() {
    // Redirect user to /dashboard if they are already logged in (i.e. localstorage exists)
    useEffect(() => {
        if (localStorage.getItem('server_credentials')) {
            window.location.href = '/dashboard/player?start_recorder=true';
        }
    }, []);
    return (
        <div
            className="dark:bg-black bg-slate-200 p-10 rounded-lg overflow-hidden dark:text-white text-black"
            style={{ 'border-radius': '25px' }}
        >
            <div className="w-full	grid ">
                <div className="justify-end items-end	justify-self-end justify-self-top ">
                    <ThemeToggle />
                </div>
            </div>
            <div className="flex w-full grid mb-5">
                <div>
                    <img src="/infr.png" alt="Logo" className="h-12" />
                </div>
            </div>

            <div className="flex items-center text-lg font-medium">
                <h1 className="scroll-m-20 font-bold text-4xl font-extrabold tracking-tight lg:text-5xl mb-5">
                    Hey there! Welcome to Infr.
                </h1>
            </div>
            <h2 className="scroll-m-20 font-bold text-3xl font-extrabold tracking-tight lg:text-4xl">
                We&apos;re glad you&apos;re here! Let&apos;s get you set up :)
            </h2>
        </div>
    );
}
