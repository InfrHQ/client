import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { invoke } from '@tauri-apps/api';
import { Toggle } from '../ui/toggle';
import { toast } from 'react-toastify';

function PreferenceAccessibility() {
    const [showDockIcon, setShowDockIcon] = useState(true);
    const [launchOnLogin, setLaunchOnLogin] = useState(true);

    async function getDockIconStatsuOnInit() {
        let is_show = await invoke('get_data', { key: 'show_dock_icon' });
        setShowDockIcon(!(is_show === 'false'));
    }

    async function getLaunchOnLoginStatusOnInit() {
        let is_show = await invoke('get_data', { key: 'launch_on_login' });
        setLaunchOnLogin(!(is_show === 'false'));
    }

    async function setDockIconStatus(newStatus) {
        try {
            if (newStatus) {
                await invoke('set_data', { key: 'show_dock_icon', value: 'true' });
            } else {
                await invoke('set_data', { key: 'show_dock_icon', value: 'false' });
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to update dock icon status. Please reach out to us using the chat widget.');
        }
    }

    async function setLaunchOnLoginStatus(newStatus) {
        try {
            if (newStatus) {
                await invoke('set_data', { key: 'launch_on_login', value: 'true' });
            } else {
                await invoke('set_data', { key: 'launch_on_login', value: 'false' });
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to update launch on login status. Please reach out to us using the chat widget.');
        }
    }

    useEffect(() => {
        getDockIconStatsuOnInit();
        getLaunchOnLoginStatusOnInit();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <div className="flex items-center justify-between">Accessibility</div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="mb-8 flex">
                    <div>
                        <CardTitle className="mb-2">Show Dock Icon</CardTitle>
                        <CardDescription>
                            Show the Infr icon in the dock. Restart the app for changes to take effect.
                        </CardDescription>
                    </div>
                    <div className="ml-auto">
                        <Toggle
                            aria-label="Toggle italic"
                            pressed={showDockIcon}
                            onPressedChange={(e) => {
                                console.log(e);
                                setShowDockIcon(e);
                                setDockIconStatus(e);
                            }}
                        >
                            {showDockIcon ? <p>Yes</p> : <p>No</p>}
                        </Toggle>
                    </div>
                </div>
                <div className="mb-8 flex">
                    <div>
                        <CardTitle className="mb-2">Launch on Login</CardTitle>
                        <CardDescription>
                            Start the Infr app automatically when you sign into your device. Restart the app for changes
                            to take effect.{' '}
                        </CardDescription>
                    </div>
                    <div className="ml-auto">
                        <Toggle
                            aria-label="Toggle italic"
                            pressed={launchOnLogin}
                            onPressedChange={(e) => {
                                console.log(e);
                                setLaunchOnLogin(e);
                                setLaunchOnLoginStatus(e);
                            }}
                        >
                            {launchOnLogin ? <p>Yes</p> : <p>No</p>}
                        </Toggle>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default PreferenceAccessibility;
