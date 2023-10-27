import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import ImageSlider from "./ImageSlider";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

function StitchDialog({ images, minIndex }) {
	const [displayedIndex, setDisplayedIndex] = useState(0);
	const [loading, setLoading] = useState(true);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");

	return (
		<DialogContent className="dark:text-white min-w-96">
			<DialogHeader>
				<DialogTitle>Create a Knit</DialogTitle>
				<DialogDescription>
					<ImageSlider
						images={images.slice(minIndex)}
						currentIndex={displayedIndex}
						setCurrentIndex={setDisplayedIndex}
						fetchingImages={false}
						allSegmentsFetched={true}
						showIndicators={false}
					/>
					<Input placeholder="Title" className="mt-5 mb-2" value={title} onChange={(e) => setTitle(e.target.value)} />
					<Textarea placeholder="Description" className="mb-2" value={description} onChange={(e) => setDescription(e.target.value)} />
				</DialogDescription>
			</DialogHeader>
			<DialogFooter>
				<Button type="submit">Save</Button>
			</DialogFooter>
		</DialogContent>
	);
}

export default StitchDialog;
