import { CheckCheckIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import Permissions from './Permissions';
import Account from './Account';

export default function Stepper() {
    const [step, setStep] = useState(1);
    const [newUser, setNewUser] = useState(false);

    useEffect(() => {
        if (step == 1) {
            document.title = 'Infr | Permissions';
        } else if (step == 2) {
            document.title = 'Infr | Server';
        } else if (step == 3) {
            window.location.href = `/dashboard/recorder?start_recorder=true&new_user=${newUser}`;
        }
    }, [step]);

    return (
        <div>
            <ol class="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base mb-5">
                <li class="flex md:w-full items-center text-blue-600 dark:text-blue-500 sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700">
                    <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
                        {step > 1 ? <CheckCheckIcon class="mr-2" /> : <span class="mr-2">1</span>}
                        Permissions
                    </span>
                </li>
                <li
                    class={
                        'flex md:w-full items-center' +
                        (step >= 2 ? ' text-blue-600 dark:text-blue-500' : ' text-gray-500 dark:text-gray-400')
                    }
                >
                    <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
                        {step > 2 ? <CheckCheckIcon class="mr-2" /> : <span class="mr-2">2</span>}
                        Server
                    </span>
                </li>
            </ol>
            <div>
                {step == 1 ? <Permissions setStep={setStep} step={step} /> : null}
                {step == 2 ? <Account setStep={setStep} step={step} setNewUser={setNewUser} /> : null}
            </div>
        </div>
    );
}
