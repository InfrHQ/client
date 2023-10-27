import React, { useState, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { postConvertTimestamp } from '@/lib/time';
import SingleScreenshot from './SingleScreenshot';
function ImageSlider({
    images,
    currentIndex,
    setCurrentIndex,
    fetchingImages,
    allSegmentsFetched,
    showIndicators = true,
}) {
    const [displayedIndex, setDisplayedIndex] = useState(currentIndex);
    const sliderTimeoutRef = useRef(null);

    const handleSliderChange = (newIndex) => {
        let thisIndex = newIndex[0];
        setCurrentIndex(thisIndex);

        if (sliderTimeoutRef.current) clearTimeout(sliderTimeoutRef.current);

        sliderTimeoutRef.current = setTimeout(() => {
            setDisplayedIndex(thisIndex);
        }, 300);
    };

    return (
        <div className="">
            <div className="flex h-120 relative overflow-hidden mt-8">
                <SingleScreenshot image={images[displayedIndex]} />
                {fetchingImages && showIndicators && (
                    <p className="animate-pulse absolute top-2 right-2 text-white bg-fuchsia-500 bg-opacity-40 px-2 py-1 rounded text-sm mt-2">
                        Fetching more images...
                    </p>
                )}
                {allSegmentsFetched && showIndicators && (
                    <p className=" absolute top-2 right-2 text-white bg-fuchsia-600 bg-opacity-40 px-2 py-1 rounded text-sm mt-2">
                        History fetch complete
                    </p>
                )}
            </div>
            <p className="text-white bg-black bg-opacity-40 px-2 py-1 rounded text-xs mt-1">
                {postConvertTimestamp(images[displayedIndex]?.date_generated).dateAndTimeWithoutTimezone}
            </p>
            <Slider
                type="range"
                min={0}
                max={images.length - 1}
                step={1}
                defaultValue={[currentIndex]}
                onValueChange={handleSliderChange}
                className="mt-5"
                disabled={fetchingImages}
            />
        </div>
    );
}

export default ImageSlider;
