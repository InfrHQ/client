import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StitchDialog from './StitchDialog';

export function Panel({ images, displayIndex }) {
    if (!images) return null;

    const image = images[displayIndex];
    const [copyLinkText, setCopyLinkText] = React.useState('Copy');
    const [showItem, setShowItem] = React.useState(null);
    const [linksData, setLinksData] = React.useState(null);

    function getRelevantText(image) {
        if (image?.attributes?.current_url) {
            let url = image?.attributes?.current_url;
            return (
                <div className="flex w-full space-x-2">
                    <Input value={url} readOnly />
                    <Button variant="secondary" className="shrink-0 w-16" onClick={handleCopyLink}>
                        {copyLinkText}
                    </Button>
                </div>
            );
        } else if (image?.attributes?.window_name) {
            return <CardDescription>{image?.attributes?.window_name}</CardDescription>;
        }
        return null;
    }

    function getReliveButtonIfApplicable(image) {
        if (image?.page_html_url && image?.attributes?.page_html_available) {
            return (
                <Button
                    variant="secondary"
                    className="shrink-0 w-16"
                    onClick={() => {
                        window.open(image?.page_html_url, '_blank');
                    }}
                >
                    Relive
                </Button>
            );
        }
        return null;
    }

    function extractLinks(text) {
        let urlRegex =
            /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g; //eslint-disable-line
        let matches = text.match(urlRegex) || [];
        if (showItem === 'links' && matches.length > 0) {
            // Remove links that end w/ common file extensions or include w3.org
            const filterable_keys = ['w3.org', '.js', '.css', 'captcha'];
            matches = matches.filter((match) => {
                let match_lower = match.toLowerCase();
                return !filterable_keys.some((key) => match_lower.includes(key));
            });
        }
        return matches.join('\n\n');
    }

    function extractTextFromBoundingBox(data) {
        // Filter only word-level data (Level 5)
        const wordLevelData = data.filter((entry) => entry.level === 5);

        // Sort data by top (vertical position), then by left (horizontal position)
        wordLevelData.sort((a, b) => {
            if (a.top === b.top) {
                return a.left - b.left;
            }
            return a.top - b.top;
        });

        let textRepresentation = '';

        // A simplistic way to convert sorted word-level data to text
        wordLevelData.forEach((word) => {
            textRepresentation += word.text + ' ';
        });

        return textRepresentation.trim();
    }

    async function extractLinksFromURL() {
        // Check if html url exists
        var html = '';
        var bounding_box_text = '';
        var text = image?.extracted_text;
        if (image?.attributes?.page_html_available && image?.page_html_url) {
            try {
                let imageURL = image?.page_html_url;
                html = await fetch(imageURL).then((res) => res.text());
            } catch (e) {
                console.log(e);
            }
        }

        if (image?.attributes?.bounding_box_available && image?.bounding_box_url) {
            try {
                let imageURL = image?.bounding_box_url;
                let data = await fetch(imageURL).then((res) => res.json());
                bounding_box_text = extractTextFromBoundingBox(data);
            } catch (e) {
                console.log(e);
            }
        }
        let links = extractLinks(html + text + bounding_box_text);
        setLinksData(links);
    }

    function getShowItem(image, showItem) {
        if (!showItem) {
            return null;
        }
        if (showItem === 'raw_text') {
            return <Textarea value={image?.extracted_text} readOnly className="mt-2 h-96" />;
        }
        if (showItem === 'links' || showItem === 'links_other') {
            return <Textarea value={linksData} readOnly className="mt-2 h-96" />;
        }
        return null;
    }

    function handleCopy(text) {
        navigator.clipboard.writeText(text);
    }

    function handleCopyLink() {
        handleCopy(image?.attributes?.current_url);
        setCopyLinkText('Copied!');
        setTimeout(() => {
            setCopyLinkText('Copy');
        }, 2000);
    }

    React.useEffect(() => {
        if (showItem === 'links' || showItem === 'links_other') {
            extractLinksFromURL();
        }
    }, [showItem, displayIndex]);

    return (
        <div>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="mb-1">{image?.attributes?.app_name}</CardTitle>
                    {getRelevantText(image)}
                </CardHeader>
                <CardFooter className="flex justify-between">
                    {/*
					<Button className="w-24 flex">
						<DialogTrigger>Knit</DialogTrigger>
					</Button>
						*/}

                    {getReliveButtonIfApplicable(image)}
                </CardFooter>
            </Card>
            <Card className="w-full mt-5">
                <CardHeader>
                    <CardTitle className="mb-1">View</CardTitle>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Select onValueChange={(e) => setShowItem(e)}>
                                    <SelectTrigger id="framework">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent position="popper">
                                        <SelectItem value="raw_text">Raw Text</SelectItem>
                                        <SelectItem value="links">Links</SelectItem>
                                        <SelectItem value="links_other">Links (Other)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </form>
                    {getShowItem(image, showItem)}
                </CardContent>
                <CardFooter className="flex justify-between"></CardFooter>
            </Card>
            <StitchDialog images={images} minIndex={displayIndex} />
        </div>
    );
}
