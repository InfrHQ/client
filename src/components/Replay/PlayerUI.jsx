import React from 'react';
import { Panel } from './Panel';
import SearchBar from './SearchBar';
import ImageSlider from './ImageSlider';

function PlayerUI({ images, currentIndex, setCurrentIndex, fetchingImages, allSegmentsFetched, server_host, api_key }) {
    return (
        <div className="flex">
            <div className="flex flex-col h-full mt-5 w-4/5">
                <SearchBar server_host={server_host} api_key={api_key} is_hotkeyed={false} />
                <ImageSlider
                    images={images}
                    currentIndex={currentIndex}
                    setCurrentIndex={setCurrentIndex}
                    fetchingImages={fetchingImages}
                    allSegmentsFetched={allSegmentsFetched}
                />
            </div>
            <div className="flex flex-col h-full mt-5 ml-5 w-1/5">
                <Panel images={images} displayIndex={currentIndex} />
            </div>
        </div>
    );
}

export default PlayerUI;
