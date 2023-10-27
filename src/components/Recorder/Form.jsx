import { invoke } from '@tauri-apps/api';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

import { PauseIcon, PlayIcon } from 'lucide-react';

function Form() {
    const [recording, setRecording] = useState(true);
    const [message, setMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [incognitoKeywords, setIncognitoKeywords] = useState([]);

    async function startRecording() {
        await invoke('start_background');
        setRecording(true);
    }

    async function stopRecording() {
        await invoke('stop_background');
        setRecording(false);
    }

    async function getRecordingStatus() {
        // Wait for 1 second to make sure the background script is loaded
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const status = await invoke('background_is_running');
        setRecording(status);
    }

    useEffect(() => {
        getRecordingStatus();
    }, []);

    return (
        <div className="mb-5">
            <Card>
                <CardHeader>
                    <CardTitle className=" items-center space-x-3">
                        {recording ? (
                            <PlayIcon
                                size={32}
                                className="bg-green-500 text-white border rounded-xl p-2 mb-3 cursor-pointer"
                                onClick={stopRecording}
                            />
                        ) : (
                            <PauseIcon
                                size={32}
                                className="bg-yellow-500 text-white border rounded-xl p-2 mb-3 cursor-pointer"
                                onClick={startRecording}
                            />
                        )}
                        Background recorder is {recording ? 'running' : 'paused'}
                    </CardTitle>
                    <CardDescription>
                        {recording
                            ? 'Infr is running in the background. You can close this window and continue using your computer. To stop recording, click on the icon above.'
                            : 'Infr is not running in the background & is not storing any data. You can start it by clicking on the pause icon above.'}
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}

export default Form;
