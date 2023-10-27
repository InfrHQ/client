import { useEffect, useState } from 'react';
import ImagePlayer from './PlayerLogic';
import DashboardLayout from '../Dashboard/Layout';
import { Dialog } from '@/components/ui/dialog';
import { useLocation } from 'react-router-dom'; // Import the useLocation hook

function PlayerWrapper() {
    const server = JSON.parse(localStorage.getItem('server_credentials'));
    const location = useLocation();
    // Get the ?searchText=xyz parameter
    const [searchText, setSearchText] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let tempSearchText = window.location.search.split('=');
        // Check if the url has the ?segment=xyz parameter
        if (tempSearchText[0] === '?segment') {
            setSearchText(decodeURIComponent(tempSearchText[1]));
        }
        setLoading(false);
    }, [location.search]);
    return (
        <DashboardLayout>
            <Dialog>
                <main className="flex min-h-screen flex-col p-10">
                    {!loading && (
                        <ImagePlayer segment={searchText} server_host={server?.host} api_key={server?.api_key} />
                    )}
                </main>
            </Dialog>
        </DashboardLayout>
    );
}

export default PlayerWrapper;
