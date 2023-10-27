import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { invoke } from "@tauri-apps/api";
import { toast } from "react-toastify";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

function PreferenceHotkey() {
	const [searchHotkey, setSearchHotkey] = useState("");

	async function getSearchHotKeyOnInit() {
		let is_show = await invoke("get_data", { key: "search_hotkey" });

        // If none or empty value, set default value "Ctrl+I"
        if (!is_show) {
            is_show = "Ctrl+I";
        }
		setSearchHotkey(is_show);
	}

	async function setSearchHotKeyValue(newStatus) {
		try {
			await invoke("set_data", { key: "search_hotkey", value: searchHotkey });
			toast.success(
				"Search hotkey updated successfully. Please restart the app to see the changes."
			);
		} catch (error) {
			console.log(error);
			toast.error(
				"Failed to update search hotkey. Please reach out to us using the chat widget."
			);
		}
	}


	useEffect(() => {
		getSearchHotKeyOnInit();
	}, []);

	return (
		<Card className="mt-8">
			<CardHeader>
				<CardTitle>
					<div className="flex items-center justify-between">
						Keyboard Shortcuts
					</div>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="mb-8 flex">
					<div>
						<CardTitle className="mb-2">Search</CardTitle>
						<CardDescription>
							Manage the keyboard shortcut to open the Infr Searchbar.
						</CardDescription>
					</div>
					<div className="ml-auto flex">
						<Input placeholder="Ctrl+I" className="w-32" value={searchHotkey} onChange={(e) => setSearchHotkey(e.target.value)} />
                        <Button className="ml-2" onClick={setSearchHotKeyValue}>Save</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export default PreferenceHotkey;
