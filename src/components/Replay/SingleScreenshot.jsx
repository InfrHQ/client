import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { postConvertTimestamp } from '@/lib/time';
import { getAppColorAndIcon } from '@/tools/AppData';

function SingleScreenshot({ image, keyword }) {
    const [boundingBoxData, setBoundingBoxData] = useState([]);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [endX, setEndX] = useState(0);
    const [endY, setEndY] = useState(0);

    const imageContainerRef = useRef(null);
    const keywordBoxes = useRef([]);

    async function getBoundingBoxData() {
        if (image?.attributes?.bounding_box_available && image?.bounding_box_url) {
            try {
                let data = await fetch(image.bounding_box_url).then((res) => res.json());
                setBoundingBoxData(data);
            } catch (e) {
                console.log(e);
            }
        }
    }

    const getRelativeCoordinates = (e) => {
        const bounds = imageContainerRef.current.getBoundingClientRect();
        return {
            x: e.clientX - bounds.left,
            y: e.clientY - bounds.top,
        };
    };

    const handleMouseDown = (e) => {
        const { x, y } = getRelativeCoordinates(e);
        setIsMouseDown(true);
        setStartX(x);
        setStartY(y);
        setEndX(x);
        setEndY(y);
    };

    const handleMouseMove = (e) => {
        if (isMouseDown) {
            const { x, y } = getRelativeCoordinates(e);
            setEndX(x);
            setEndY(y);
        }
    };

    // eslint-disable-next-line no-unused-vars
    const handleMouseUp = (e) => {
        setIsMouseDown(false);
        if (startX !== endX || startY !== endY) {
            const selectedText = getSelectedText(startX, startY, endX, endY);
            if (selectedText) {
                navigator.clipboard.writeText(selectedText);
                toast.success('Text copied to clipboard');
            }
        }
    };

    const getSelectedText = (startX, startY, endX, endY) => {
        let selectedText = '';

        if (!imageContainerRef.current) return '';

        const imgElement = imageContainerRef.current.querySelector('img');
        if (!imgElement) return '';

        const scaleX = imgElement.width / imgElement.naturalWidth;
        const scaleY = imgElement.height / imgElement.naturalHeight;
        boundingBoxData
            .filter((entry) => entry.level === 5)
            .forEach((entry) => {
                const wordLeft = entry.left * scaleX;
                const wordRight = (entry.left + entry.width) * scaleX;
                const wordTop = entry.top * scaleY;
                const wordBottom = (entry.top + entry.height) * scaleY;
                if (wordLeft < endX && wordRight > startX && wordTop < endY && wordBottom > startY) {
                    selectedText += entry.text + ' ';
                }
            });

        return selectedText.trim();
    };

    const renderKeywordHighlight = () => {
        if (!imageContainerRef.current || keywordBoxes.current.length === 0) return null;
        const imgElement = imageContainerRef.current.querySelector('img');
        if (!imgElement) return null;

        const scaleX = imgElement.width / imgElement.naturalWidth;
        const scaleY = imgElement.height / imgElement.naturalHeight;

        return keywordBoxes.current.map((entry, index) => {
            const left = entry.left * scaleX;
            const top = entry.top * scaleY;
            const width = entry.width * scaleX;
            const height = entry.height * scaleY;
            return (
                <div
                    key={index}
                    style={{
                        position: 'absolute',
                        left: `${left}px`,
                        top: `${top}px`,
                        width: `${width}px`,
                        height: `${height}px`,
                        backgroundColor: 'rgba(255, 255, 0, 0.5)', // Blue highlight
                        pointerEvents: 'none',
                    }}
                />
            );
        });
    };

    useEffect(() => {
        getBoundingBoxData();
    }, [image]);

    useEffect(() => {
        if (keyword && boundingBoxData.length > 0) {
            keywordBoxes.current = boundingBoxData.filter(
                (entry) => entry.level === 5 && entry.text?.toLowerCase().includes(keyword?.toLowerCase())
            );
        }
    }, [boundingBoxData, keyword]);

    return (
        <div
            className="rounded rounded-md bg-slate-50 dark:bg-slate-800 relative"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            ref={imageContainerRef}
        >
            <img
                src={image?.screenshot_url}
                alt={`Image for timestamp: ${image?.timestamp}`}
                className="rounded-md select-none"
                draggable="false"
            />
            <div className="absolute bottom-0 right-0 text-white bg-black bg-opacity-80 px-2 py-1 rounded text-xs mt-2">
                <p>{postConvertTimestamp(image?.date_generated).dateAndTimeWithoutTimezone}</p>
                <p>
                    <img
                        src={getAppColorAndIcon(image).vector_url}
                        alt="Vector"
                        className="inline-block w-3 h-3 mr-1"
                    />
                    {image?.attributes?.app_name}
                </p>
            </div>

            {isMouseDown && (
                <div
                    style={{
                        position: 'absolute',
                        left: `${Math.min(startX, endX)}px`,
                        top: `${Math.min(startY, endY)}px`,
                        width: `${Math.abs(endX - startX)}px`,
                        height: `${Math.abs(endY - startY)}px`,
                        backgroundColor: 'rgba(0, 255, 0, 0.4)',
                        border: '1px dashed black',
                        pointerEvents: 'none',
                    }}
                ></div>
            )}

            {renderKeywordHighlight()}
        </div>
    );
}

export default SingleScreenshot;
