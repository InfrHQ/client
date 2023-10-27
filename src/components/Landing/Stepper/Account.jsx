import { useState } from 'react';
import { Button } from '../../ui/button';
import { Loader2 } from 'lucide-react';
import { invoke } from '@tauri-apps/api';
import { Input } from '../../ui/input';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

async function verfiyAPIKey(host, apiKey) {
    let resp = await fetch(host + '/v1/apikey/query/verify', {
        method: 'GET',
        headers: {
            'Infr-API-Key': apiKey,
        },
    });
    if (resp.status === 200) {
        let data = await resp.json();
        return data;
    }
    return false;
}

async function getUser(host, apiKey) {
    let resp = await fetch(host + '/v1/user/query/apikey', {
        method: 'GET',
        headers: {
            'Infr-API-Key': apiKey,
        },
    });
    if (resp.status === 200) {
        let user = await resp.json();
        return user;
    }
    return null;
}

async function verifyDevice(host, apiKey, device) {
    let resp = await fetch(host + '/v1/device/query', {
        method: 'GET',
        headers: {
            'Infr-API-Key': apiKey,
        },
    });
    if (resp.status === 200) {
        let data = await resp.json();
        let devices = data['devices'];

        for (let i = 0; i < devices.length; i++) {
            if (devices[i]['id'] === device) {
                return devices[i];
            }
        }
    }
    return false;
}

function Account({ setStep }) {
    const [loading, setLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);

    const [host, setHost] = useState('');
    const [apiKey, setApiKey] = useState('');

    function setHostValue(hostVal) {
        // Remove trailing slash
        hostVal = hostVal.replace(/\/$/, '');
        setHost(hostVal);
    }

    async function handleSetupServer() {

		setLoading(true);


		try {

			// Make sure host & API key is set
			if (host === '' || apiKey === '') {
				toast.error('Please enter a valid host and API key');
				return;
			}
	
			// Check if host is valid
			let resp = await fetch(host + '/version');
			if (!resp.ok) {
				toast.error('Unable to connect to server');
				return;
			}
	
			// Check if api key is valid
			let apiResp = await verfiyAPIKey(host, apiKey);
			if (!apiResp) {
				toast.error('Invalid API key');
				return;
			}
	
			// Get user
			let user = await getUser(host, apiKey);
	
			// Set user
			console.log(user);
			localStorage.setItem('user', JSON.stringify(user?.user));
	
			// Set server credentials
			let serverCred = {
				api_key: user?.user.apikeys[0].key,
				device_id: user?.user.devices[0].id,
				server_user_id: user?.user.id,
				host: host,
			};
			localStorage.setItem('server_credentials', JSON.stringify(serverCred));
			await invoke('set_data', {
				key: 'server_credentials',
				value: JSON.stringify(serverCred),
			});
			toast.success("Server connected. We're logging you in. You will be redirected to the dashboard.");
	
			// Set step
			await new Promise((resolve) => setTimeout(resolve, 2000));
			setStep(3);
		} catch (e) {
			console.log(e);
			toast.error('Unable to connect to server');
		}
		
		setLoading(false);
	
    }

    return (
        <div className="">
            <div className="pb-10 flex justify-between items-center dark:text-slate-200">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Server</h1>
                    <p className="text-xl text-muted-foreground">
                        Setting up an Infr server makes sure your data is secure and accessible from anywhere.
                    </p>
                </div>
            </div>
            <div className="dark:text-slate-200 flex space-x-2 w-2/3 mb-2">
                <Input
                    type="name"
                    placeholder="http://127.0.0.1:5000"
                    className="w-1/2"
                    value={host}
                    onChange={(e) => setHostValue(e.target.value)}
                />
            </div>
            <div className="dark:text-slate-200 flex space-x-2 w-2/3 mb-2">
                <Input
                    type="password"
                    placeholder="infr_apikey_..."
                    className="w-1/2"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />
            </div>
            <div className="dark:text-slate-200 flex space-x-2 w-2/3 mb-2">
                <Button disabled={loading} onClick={handleSetupServer}>
                    {loading ? <Loader2 className="h-4 w-4 mr-5 animate-spin" /> : null}
                    Connect
                </Button>
            </div>
            <ToastContainer />
        </div>
    );
}

export default Account;
