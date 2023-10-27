import DashboardLayout from '../Dashboard/Layout';
import PreferenceAccessibility from './Accessibility';
import PreferenceHotkey from './Hotkey';

export default function PreferenceWrapper() {
    return (
        <DashboardLayout>
            <main className="flex min-h-screen flex-col p-10">
                <PreferenceAccessibility />
                <PreferenceHotkey />
            </main>
        </DashboardLayout>
    );
}
