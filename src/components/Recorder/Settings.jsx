import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Input } from '../ui/input';
import TagifyComponent from './TagifyComponent';
import { ChevronsUpDown, Plus, X } from 'lucide-react';
import { Button } from '../ui/button';
import { invoke } from '@tauri-apps/api';
import { useIsMount } from '../../lib/reactUtils';

function RecorderSettings() {
    const isMount = useIsMount();
    const [isOpen, setIsOpen] = useState(false);

    const [incognitoKeywords, setIncognitoKeywords] = useState([]);
    const [isIncognitoKeywordsLoaded, setIsIncognitoKeywordsLoaded] = useState(false);

    const [samplingRate, setSamplingRate] = useState(30);
    const [isSamplingRateLoaded, setIsSamplingRateLoaded] = useState(false);

    async function handleIncognitoKeywordsChange() {
        if (isIncognitoKeywordsLoaded) {
            setIsIncognitoKeywordsLoaded(false);
            return;
        }
        await invoke('set_data', {
            key: 'incognito_keywords',
            value: JSON.stringify(incognitoKeywords),
        });
        await invoke('update_variables');
    }

    useEffect(() => {
        if (isMount) {
            return;
        }
        handleIncognitoKeywordsChange();
    }, [incognitoKeywords]);

    async function handleSamplingRateChange() {
        if (isSamplingRateLoaded) {
            setIsSamplingRateLoaded(false);
            return;
        }
        await invoke('set_data', {
            key: 'sampling_rate',
            value: String(samplingRate),
        });
        await invoke('update_variables');
    }

    function handleSamplingRateUpdate(e) {
        // If more than 120, set to 120
        if (e.target.value > 120) {
            e.target.value = 120;
        }
        let val = e.target.value;
        if (val < 1) {
            val = 1;
        }

        setSamplingRate(val);
    }

    useEffect(() => {
        if (isMount) {
            return;
        }
        handleSamplingRateChange();
    }, [samplingRate]);

    function handleGetIncognitoKeywords() {
        invoke('get_data', { key: 'incognito_keywords' }).then((res) => {
            setIsIncognitoKeywordsLoaded(true);
            // Check if parsed JSON is an array
            var parsedRes = JSON.parse(res);
            if (!Array.isArray(parsedRes)) {
                parsedRes = [];
            }
            setIncognitoKeywords(parsedRes);
        });
    }

    function handleGetSamplingRate() {
        invoke('get_data', { key: 'sampling_rate' }).then((res) => {
            setIsSamplingRateLoaded(true);

            // if type of res is string, convert to int
            try {
                if (typeof res === 'string') {
                    res = parseInt(res);
                }
            } catch (e) {
                return;
            }

            // if not a number, return
            if (isNaN(res)) {
                return;
            }

            if (!res) {
                return;
            }

            setSamplingRate(res);
        });
    }

    useEffect(() => {
        handleGetIncognitoKeywords();
        handleGetSamplingRate();
    }, []);

    return (
        <Card>
            <Collapsible open={isOpen} onOpenChange={setIsOpen} className=" space-y-2">
                <CardHeader>
                    <CardTitle>
                        <div className="flex items-center justify-between w-[350px]">
                            Advanced Settings
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-9 p-0">
                                    <ChevronsUpDown className="h-4 w-4" />
                                    <span className="sr-only">Toggle</span>
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CollapsibleContent className="space-y-5 pr-6 pl-6 pb-9">
                    <div className="mb-8">
                        <CardTitle className="mb-2">Incognito Keywords</CardTitle>
                        <TagifyComponent setTags={setIncognitoKeywords} tags={incognitoKeywords} />
                    </div>
                    <div className="mt-4">
                        <CardTitle className="mb-2">Sampling Rate</CardTitle>
                        <div className="flex items-center space-x-2">
                            <Input
                                type="number"
                                className="w-1/4"
                                value={samplingRate}
                                onChange={(e) => handleSamplingRateUpdate(e)}
                            />
                            <p>/min</p>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}

export default RecorderSettings;
