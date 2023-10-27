import { CheckCheckIcon, ScreenShareIcon, Link2Icon, Settings2Icon, MoveRightIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Loader2 } from 'lucide-react';
import { invoke } from '@tauri-apps/api';
import { Separator } from '../../ui/separator';
import { ToastContainer, toast } from 'react-toastify';

function Permissions({ setStep }) {
    // Permission states 'granted', 'denied', 'checking', 'skipped'
    const [applescriptPermission, setApplescriptPermission] = useState('denied');
    const [screenPermission, setScreenPermission] = useState('denied');
    const [safariPermission, setSafariPermission] = useState('denied');
    const [bravePermission, setBravePermission] = useState('denied');
    const [chromePermission, setChromePermission] = useState('denied');

    // Button text 'Get Permission', 'Retry'
    const [applescriptButtonText, setApplescriptButtonText] = useState('Get Permission');
    const [screenButtonText, setScreenButtonText] = useState('Get Permission');
    const [safariButtonText, setSafariButtonText] = useState('Get Permission');
    const [braveButtonText, setBraveButtonText] = useState('Get Permission');
    const [chromeButtonText, setChromeButtonText] = useState('Get Permission');

    function handleContinue() {
        // Check if essential permissions are granted -- applescript, screen
        if (applescriptPermission == 'granted' && screenPermission == 'granted') {
            setStep(2);
        } else {
            toast.error('Please grant all the essential permissions to continue.');
        }
    }

    // Check if permission is granted
    async function checkApplescriptPermission() {
        setApplescriptPermission('checking');
        try {
            let permission = await invoke('check_permission', {
                checkPermissionName: 'applescript',
            });
            if (permission == 200) {
                permission = 'granted';
            } else if (permission == 400) {
                permission = 'denied';
                setApplescriptButtonText('Retry');
            }
            setApplescriptPermission(permission);
        } catch (err) {
            console.log(err);
            setApplescriptPermission('denied');
            setApplescriptButtonText('Retry');
        }
    }
    async function checkScreenPermission() {
        setScreenPermission('checking');
        try {
            let permission = await invoke('check_permission', {
                checkPermissionName: 'screen',
            });
            if (permission == 200) {
                permission = 'granted';
            } else if (permission == 400) {
                permission = 'denied';
                setScreenButtonText('Retry');
            }
            setScreenPermission(permission);
        } catch (err) {
            console.log(err);
            setScreenPermission('denied');
            setScreenButtonText('Retry');
        }
    }
    async function checkSafariPermission() {
        setSafariPermission('checking');
        try {
            let permission = await invoke('check_permission', {
                checkPermissionName: 'safari_url',
            });
            if (permission == 200 || permission == 203) {
                permission = 'granted';
            } else if (permission == 400) {
                permission = 'denied';
                setSafariButtonText('Retry');
            }
            setSafariPermission(permission);
        } catch (err) {
            console.log(err);
            setSafariPermission('denied');
            setSafariButtonText('Retry');
        }
    }
    async function checkBravePermission() {
        setBravePermission('checking');
        try {
            let permission = await invoke('check_permission', {
                checkPermissionName: 'brave_browser_url',
            });
            if (permission == 200 || permission == 203) {
                permission = 'granted';
            } else if (permission == 400) {
                permission = 'denied';
                setBraveButtonText('Retry');
            }
            setBravePermission(permission);
        } catch (err) {
            console.log(err);
            setBravePermission('denied');
            setBraveButtonText('Retry');
        }
    }
    async function checkChromePermission() {
        setChromePermission('checking');
        try {
            let permission = await invoke('check_permission', {
                checkPermissionName: 'google_chrome_url',
            });
            if (permission == 200 || permission == 203) {
                permission = 'granted';
            } else if (permission == 400) {
                permission = 'denied';
                setChromeButtonText('Retry');
            }
            setChromePermission(permission);
        } catch (err) {
            console.log(err);
            setChromePermission('denied');
            setChromeButtonText('Retry');
        }
    }

    useEffect(() => {
        if (
            applescriptPermission == 'granted' &&
            screenPermission == 'granted' &&
            (safariPermission == 'granted' || safariPermission == 'skipped') &&
            (bravePermission == 'granted' || bravePermission == 'skipped') &&
            (chromePermission == 'granted' || chromePermission == 'skipped')
        ) {
            setStep(2);
        }
    }, [applescriptPermission, screenPermission, safariPermission, bravePermission, chromePermission]);

    return (
        <div className="">
            <div className="pb-10 flex justify-between items-center dark:text-slate-200">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Permissions</h1>
                    <p className="text-xl text-muted-foreground">
                        We need to ask for some permissions to get you started. When you&apos;ve granted all the
                        permissions, click Continue at the bottom of your screen. By continuing, you agree to our{' '}
                        <a
                            href="https://infrhq.com/privacy"
                            target="_blank"
                            className="text-blue-600 dark:text-blue-500"
                            rel="noreferrer"
                        >
                            Privacy Policy
                        </a>{' '}
                        and{' '}
                        <a
                            href="https://infrhq.com/terms"
                            target="_blank"
                            className="text-blue-600 dark:text-blue-500"
                            rel="noreferrer"
                        >
                            Terms of Service
                        </a>
                        .
                    </p>
                </div>
            </div>
            <div className="dark:text-slate-200">
                <div className="flex mb-4">
                    <Settings2Icon className="h-8 w-8 mr-5 " />
                    <h2 className="text-2xl font-semibold tracking-tight">
                        System
                        <p className="text-xl text-muted-foreground">Allows Infr to store & read data locally</p>
                    </h2>
                    <div className="ml-auto">
                        {applescriptPermission == 'checking' ? (
                            <Loader2 className="h-8 w-8 mr-5 animate-spin" />
                        ) : (
                            <></>
                        )}
                        {applescriptPermission == 'granted' ? (
                            <CheckCheckIcon className="h-8 w-8 mr-5 fill-green-200 text-color-green-200 bg-green-200 rounded-lg p-1" />
                        ) : (
                            <></>
                        )}
                        {applescriptPermission == 'denied' ? (
                            <Button className="ml-2" onClick={checkApplescriptPermission}>
                                {applescriptButtonText}
                            </Button>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
                <div className="flex mb-4">
                    <ScreenShareIcon className="h-8 w-8 mr-5 " />
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Screen
                        <p className="text-xl text-muted-foreground">Allows Infr to record your screen</p>
                    </h2>
                    <div className="ml-auto">
                        {screenPermission == 'checking' ? <Loader2 className="h-8 w-8 mr-5 animate-spin" /> : <></>}
                        {screenPermission == 'granted' ? (
                            <CheckCheckIcon className="h-8 w-8 mr-5 fill-green-200 text-color-green-200 bg-green-200 rounded-lg p-1" />
                        ) : (
                            <></>
                        )}
                        {screenPermission == 'denied' ? (
                            <Button className="ml-2" onClick={checkScreenPermission}>
                                {screenButtonText}
                            </Button>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
                <div className="flex mb-4">
                    <Link2Icon className="h-8 w-8 mr-5 " />
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Chrome
                        <p className="text-xl text-muted-foreground">
                            Allows Infr to get and store links from Chrome. Skip if you don&apos;t have Chrome.
                        </p>
                    </h2>
                    <div className="ml-auto">
                        {chromePermission == 'checking' ? <Loader2 className="h-8 w-8 mr-5 animate-spin" /> : <></>}
                        {chromePermission == 'granted' || chromePermission == 'skipped' ? (
                            <CheckCheckIcon className="h-8 w-8 mr-5 fill-green-200 text-color-green-200 bg-green-200 rounded-lg p-1" />
                        ) : (
                            <></>
                        )}
                        {chromePermission == 'denied' ? (
                            <>
                                <Button className="ml-2" onClick={checkChromePermission}>
                                    {chromeButtonText}
                                </Button>
                                <Button
                                    className="ml-2"
                                    variant="secondary"
                                    onClick={() => setChromePermission('skipped')}
                                >
                                    Skip
                                </Button>
                            </>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
                <div className="flex mb-4">
                    <Link2Icon className="h-8 w-8 mr-5 " />
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Brave Browser
                        <p className="text-xl text-muted-foreground">
                            Allows Infr to get and store links from your Brave Browser. Skip if you don&apos;t have
                            Brave Browser.
                        </p>
                    </h2>
                    <div className="ml-auto">
                        {bravePermission == 'checking' ? <Loader2 className="h-8 w-8 mr-5 animate-spin" /> : <></>}
                        {bravePermission == 'granted' || bravePermission == 'skipped' ? (
                            <CheckCheckIcon className="h-8 w-8 mr-5 fill-green-200 text-color-green-200 bg-green-200 rounded-lg p-1" />
                        ) : (
                            <></>
                        )}
                        {bravePermission == 'denied' ? (
                            <>
                                <Button className="ml-2" onClick={checkBravePermission}>
                                    {braveButtonText}
                                </Button>
                                <Button
                                    className="ml-2"
                                    variant="secondary"
                                    onClick={() => setBravePermission('skipped')}
                                >
                                    Skip
                                </Button>
                            </>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
                <div className="flex pb-4">
                    <Link2Icon className="h-8 w-8 mr-5 " />
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Safari Browser
                        <p className="text-xl text-muted-foreground">
                            Allows Infr to get and store links from Safari. Skip if you don&apos;t have Safari.
                        </p>
                    </h2>
                    <div className="ml-auto">
                        {safariPermission == 'checking' ? <Loader2 className="h-8 w-8 mr-5 animate-spin" /> : <></>}
                        {safariPermission == 'granted' || safariPermission == 'skipped' ? (
                            <CheckCheckIcon className="h-8 w-8 mr-5 fill-green-200 text-color-green-200 bg-green-200 rounded-lg p-1" />
                        ) : (
                            <></>
                        )}
                        {safariPermission == 'denied' ? (
                            <>
                                <Button className="ml-2" onClick={checkSafariPermission}>
                                    {safariButtonText}
                                </Button>
                                <Button
                                    className="ml-2"
                                    variant="secondary"
                                    onClick={() => setSafariPermission('skipped')}
                                >
                                    Skip
                                </Button>
                            </>
                        ) : (
                            <></>
                        )}
                    </div>
                </div>
                <Separator />
                <div className="align-bottom flex justify-end mt-3 mb-10">
                    <Button
                        className="ml-2 bg-gradient-to-r from-gray-100 to-gray-300 text-black"
                        onClick={handleContinue}
                    >
                        <MoveRightIcon className="mr-2" />
                        Continue
                    </Button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default Permissions;
