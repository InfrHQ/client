import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import SearchBar from './components/Replay/SearchBar';

const SearchBarLauncher = () => {
    return (
        <div className="backdrop-blur w-full rounded-xl p-2">
            <SearchBar className="backdrop-blur" is_hotkeyed={true} />
        </div>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <SearchBarLauncher />
    </React.StrictMode>
);
