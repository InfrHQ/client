import { useState, useEffect } from 'react';
import {
    PersonIcon,
    HamburgerMenuIcon,
    ResumeIcon,
    CameraIcon,
    MagicWandIcon,
    ReloadIcon,
} from '@radix-ui/react-icons';
import ThemeToggle from '../ThemeToggle';
import { useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { invoke } from '@tauri-apps/api';
import { Link } from 'react-router-dom';

function DashboardLayout({ children }) {
    const [userDropdown, setUserDropdown] = useState(false);
    const [page, setPage] = useState('player');
    const [profile, setProfile] = useState(null);

    const location = useLocation();

    async function fetchProfile() {
        const user = localStorage.getItem('user');
        setProfile(JSON.parse(user));
    }

    async function startRecording() {
        // Check if already running
        const status = await invoke('background_is_running');
        if (status) {
            return;
        }
        await invoke('start_background');
    }

    async function stopRecording() {
        const status = await invoke('background_is_running');
        if (!status) {
            return;
        }
        await invoke('stop_background');
    }

    async function handleSignOut() {
        localStorage.removeItem('user');
        localStorage.removeItem('server_credentials');
        await stopRecording();
        window.location.href = '/';
    }

    useEffect(() => {
        // Fetch profile
        fetchProfile();
        // Set page
        let page = location.pathname.split('/')[2];
        // Remove query params
        if (page) {
            page = page.split('?')[0];

            // Check if auto start recorder (start_recorder=true)
            if (location.search.includes('start_recorder=true')) {
                startRecording();
            }
        }
        setPage(page);
    }, []);

    return (
        <div>
            <div className="antialiased dark:bg-slate-900 flex flex-col min-h-screen">
                <nav className="bg-white border-b border-slate-200 px-4 py-2.5 dark:bg-slate-800 dark:border-slate-700 fixed left-0 right-0 top-0 z-50 bg-opacity-60 backdrop-blur dark:bg-opacity-60">
                    <div className="flex flex-wrap justify-between items-center">
                        <div className="flex justify-start items-center">
                            <button
                                data-drawer-target="drawer-navigation"
                                data-drawer-toggle="drawer-navigation"
                                aria-controls="drawer-navigation"
                                className="p-2 mr-2 text-slate-600 rounded-lg cursor-pointer md:hidden hover:text-slate-900 hover:bg-slate-100 focus:bg-slate-100 dark:focus:bg-slate-700 focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                            >
                                <HamburgerMenuIcon className="w-6 h-6" />
                                <span className="sr-only">Toggle sidebar</span>
                            </button>
                            <a href="#" className="flex items-center justify-between mr-4">
                                <img src="/infr.png" className="mr-3 h-8" alt="Infr Logo" />
                                <span className="self-center text-black text-2xl font-semibold whitespace-nowrap dark:text-white">
                                    Infr
                                </span>
                            </a>
                        </div>
                        <div className="flex items-center lg:order-2">
                            <ReloadIcon
                                className="w-4 h-4 mr-2 cursor-pointer dark:text-white"
                                onClick={() => window.location.reload()}
                            />
                            <ThemeToggle />
                            <div className="relative">
                                {/* Settings */}
                                <button
                                    type="button"
                                    className="flex mx-3 text-sm bg-slate-800 rounded-full md:mr-0 focus:ring-4 focus:ring-slate-300 dark:focus:ring-slate-600"
                                    id="user-menu-button"
                                    aria-expanded="false"
                                    data-dropdown-toggle="dropdown"
                                    onClick={() => setUserDropdown(!userDropdown)}
                                >
                                    <span className="sr-only">Open user menu</span>
                                    <img
                                        className="w-8 h-8 rounded-full"
                                        src={
                                            profile?.avatar_url ||
                                            `https://api.dicebear.com/7.x/micah/svg?seed=${profile?.id}`
                                        }
                                        alt="user photo"
                                    />
                                </button>
                                {/* Dropdown menu */}
                                <div
                                    className={
                                        'absolute right-0 mt-2 z-50 my-4 w-56 text-base list-none bg-white rounded divide-y divide-slate-100 shadow dark:bg-slate-700 dark:divide-slate-600 rounded-xl ' +
                                        (!userDropdown && 'hidden')
                                    }
                                    id="user-dropdown"
                                >
                                    <ul className="py-1 text-slate-700 dark:text-slate-300" aria-labelledby="dropdown">
                                        <li>
                                            <a
                                                onClick={handleSignOut}
                                                className="block py-2 px-4 text-sm hover:bg-slate-100 dark:hover:bg-slate-600 dark:hover:text-white cursor-pointer"
                                            >
                                                Sign out
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
                {/* Sidebar */}
                <aside
                    className="fixed top-0 left-0 z-20 w-48 h-screen pt-14 transition-transform -translate-x-full bg-white border-r border-slate-200 md:translate-x-0 dark:bg-slate-800 dark:border-slate-700 bg-opacity-60 dark:bg-opacity-60"
                    aria-label="Sidenav"
                    id="drawer-navigation"
                >
                    <div className="overflow-y-auto py-5 px-3 h-full bg-white dark:bg-slate-800 bg-opacity-60 dark:bg-opacity-60">
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/dashboard/player"
                                    className={
                                        'flex items-center p-2 text-base font-medium text-slate-900 rounded-lg dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 group' +
                                        (page === 'player' ? ' bg-slate-100 dark:bg-slate-700 pointer-events-none' : '')
                                    }
                                >
                                    <ResumeIcon className="w-6 h-6 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                    <span className="ml-3">Replay</span>
                                </Link>
                            </li>

                            {/*
                            <li>
                                 <a
                                     href="/dashboard/knit"
                                     className={
                                         'flex items-center p-2 text-base font-medium text-slate-900 rounded-lg dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 group' +
                                         (page === 'knit' ? ' bg-slate-100 dark:bg-slate-700 pointer-events-none' : '')
                                     }
                                 >
                                     <ShuffleIcon className="w-6 h-6 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                     <span className="ml-3">Knits</span>
                                 </a>
                             </li>
                            */}
                        </ul>
                        <ul className="pt-5 mt-5 space-y-2 border-t border-slate-200 dark:border-slate-700">
                            <li>
                                <Link
                                    to="/dashboard/recorder"
                                    className={
                                        'flex items-center p-2 text-base font-medium text-slate-900 rounded-lg dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 group' +
                                        (page === 'recorder'
                                            ? ' bg-slate-100 dark:bg-slate-700 pointer-events-none'
                                            : '')
                                    }
                                >
                                    <CameraIcon className="w-6 h-6 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                    <span className="ml-3">Recorder</span>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/dashboard/preference"
                                    className={
                                        'flex items-center p-2 text-base font-medium text-slate-900 rounded-lg dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 group' +
                                        (page === 'preference'
                                            ? ' bg-slate-100 dark:bg-slate-700 pointer-events-none'
                                            : '')
                                    }
                                >
                                    <MagicWandIcon className="w-6 h-6 text-slate-500 transition duration-75 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                                    <span className="ml-3">Preferences</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </aside>
                <div className="flex flex-col flex-1 pl-48">
                    <main className="flex-1 p-4 pt-8 min-h-screen">{children}</main>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default DashboardLayout;
