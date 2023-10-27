import { MoonIcon, SunIcon } from '@radix-ui/react-icons';
import { useState, useEffect } from 'react';

function useTheme() {
    const defaultTheme = localStorage.getItem('theme') || 'light';
    const [theme, setTheme] = useState(defaultTheme);

    useEffect(() => {
        const root = window.document.documentElement;

        // Set theme based on current theme state
        if (theme === 'dark') {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    return [theme, setTheme];
}

function ThemeToggle() {
    const [theme, setTheme] = useTheme();
    return (
        <button
            type="button"
            className="text-black dark:text-white font-medium rounded-full text-sm px-5  text-center mr-2"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
    );
}

export default ThemeToggle;
