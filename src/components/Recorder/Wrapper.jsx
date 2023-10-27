import DashboardLayout from '../Dashboard/Layout';
import Form from './Form';
import Settings from './Settings';
export default function Recorder() {
    return (
        <DashboardLayout>
            <main className="flex min-h-screen flex-col p-10">
                <Form />
                <Settings />
            </main>
        </DashboardLayout>
    );
}
