import { Welcome } from "../../components/Landing/Welcome";
import Stepper from "../../components/Landing/Stepper";

export default function Landing() {
	return (
		<div className="dark:bg-gray-900 min-h-screen p-10">
			<div className="content container ">
				<Welcome />
				<br></br>
				<Stepper />
			</div>
		</div>
	);
}
