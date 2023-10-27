import React, { useEffect, useState, useRef } from 'react';
import { DatePicker } from './Datepicker';
import { MagnifyingGlassIcon, StarFilledIcon, StarIcon } from '@radix-ui/react-icons';
import { makeServerCall } from '@/lib/infrTools';
import { Input } from '@/components/ui/input';
import { Combobox } from './Combobox';
import SingleScreenshot from './SingleScreenshot';
import LoadingImagePlayer from './Loader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';

function SingleCard({ item, isLoading = false, is_hotkeyed = false, is_keyword = false, keyword = '' }) {
    return (
        <div key={item?.name} className={'flex-shrink-0 rounded-full p-2 ' + (!is_hotkeyed ? 'w-2/3' : 'w-3/4')}>
            {isLoading ? (
                <LoadingImagePlayer />
            ) : (
                <div className="flex h-fit relative overflow-hidden">
                    <SingleScreenshot image={item} keyword={is_keyword ? keyword.toLocaleLowerCase() : false} />
                </div>
            )}
        </div>
    );
}

function SearchBar({ server_host, api_key, is_hotkeyed }) {
    const [searchLoading, setSearchLoading] = useState(false);

    const [query, setQuery] = useState('');

    const [results, setResults] = useState([]);

    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
    const [endDate, setEndDate] = useState(new Date());
    const [appSelected, setAppSelected] = useState('all');
    const [searchType, setSearchType] = useState('keyword'); // keyword or vector
    const [starOnly, setStarOnly] = useState(false);
    const searchDebounce = useRef(null);

    const constructURL = () => {
        let minTimeAsEpoch = startDate.getTime() / 1000;
        let maxTimeAsEpoch = endDate.getTime() / 1000;
        let IQL_QUERY = `
USE IQLV1.0.1
FILTER status EQUAL TO 'active'
        `;

        // Search type
        if (searchType === 'keyword') {
            IQL_QUERY += `
FILTER extracted_text LOWERCASE CONTAINS '${query}'`;
        } else {
            IQL_QUERY += `
VECTOR SEARCH '${query}'`;
        }

        // App selected
        if (appSelected !== 'all') {
            let actualAppName = appSelected;
            if (appSelected === 'google') {
                actualAppName = 'Google Chrome';
                IQL_QUERY += `
FILTER attributes.app_name EQUAL TO '${actualAppName}'`;
            }
            if (appSelected === 'visual') {
                actualAppName = 'Visual Studio Code';
                IQL_QUERY += `
FILTER attributes.app_name EQUAL TO '${actualAppName}'`;
            }
            if (appSelected === 'infr') {
                actualAppName = 'Infr';
                IQL_QUERY += `
FILTER attributes.app_name EQUAL TO '${actualAppName}'`;
            }
            if (appSelected === 'youtube') {
                actualAppName = 'youtube';
                IQL_QUERY += `
FILTER attributes.current_url CONTAINS '${actualAppName}'`;
            }
            if (appSelected === 'twitter') {
                actualAppName = 'x.com';
                IQL_QUERY += `
FILTER attributes.current_url CONTAINS '${actualAppName}'
                `;
            }
        }

        // Starred only
        if (starOnly) {
            IQL_QUERY += `
FILTER attributes.tags ANY INCLUDES ['star']`;
        }

        IQL_QUERY += `
FILTER date_generated GREATER THAN ${minTimeAsEpoch}
FILTER date_generated LESS THAN ${maxTimeAsEpoch}
ORDER BY date_generated DESC
LIMIT 10
FIELDS id, attributes, name, extracted_text, date_generated
MAKE screenshot_url, bounding_box_url
RETURN
        `;

        let base_64_query = btoa(IQL_QUERY);
        return `/v1/segment/query?query=${base_64_query}`;
    };

    async function fetchData() {
        setSearchLoading(true);
        try {
            const url = constructURL();
            const resp_json = await makeServerCall(url, 'GET', null, server_host, api_key);
            const new_segments = await resp_json.json();
            new_segments.reverse();
            setSearchLoading(false);
            return new_segments;
        } catch (e) {
            console.error(e);
        }
        setSearchLoading(false);
    }

    const handleSearch = async () => {
        let value = query;
        if (value) {
            // Clear any existing timeouts to prevent unnecessary searches
            if (searchDebounce.current) {
                clearTimeout(searchDebounce.current);
            }
            // Set a new timeout for the search
            searchDebounce.current = setTimeout(async () => {
                if (value) {
                    let data = await fetchData();

                    // MAke sure data is of type array
                    if (!Array.isArray(data)) {
                        data = [];
                    }
                    setResults(data);
                } else {
                    setResults([]);
                }
            }, 700); // 700ms delay
        } else {
            setResults([]);
        }
    };

    useEffect(() => {
        handleSearch();
    }, [startDate, endDate, query, appSelected, searchType, starOnly]);

    const classForSearch =
        'mt-2 scroll-smooth absolute flex overflow-x-auto space-x-8  max-w-fit rounded-lg shadow-md z-10' +
        (!is_hotkeyed ? ' bg-slate-50 dark:bg-slate-900 border border-slate-300 ' : ' ');

    return (
        <div className=" dark:text-white w-full">
            <div className="flex items-center mb-3">
                <div className={'relative ' + (is_hotkeyed ? ' bg-black text-white bg-opacity-20' : '')}>
                    <DatePicker date={startDate} setDate={setStartDate} />
                </div>
                <span className="mx-4 text-slate-500">to</span>
                <div className={'relative ' + (is_hotkeyed ? 'bg-black text-white bg-opacity-20' : '')}>
                    <DatePicker date={endDate} setDate={setEndDate} />
                </div>
                <span className="mx-4 text-slate-500">in</span>
                <div className={'relative ' + (is_hotkeyed ? 'bg-black text-white bg-opacity-20' : '')}>
                    <Combobox value={appSelected} setValue={setAppSelected} />
                </div>
                <span className="mx-4 text-slate-500">via</span>
                <div className={'relative ' + (is_hotkeyed ? 'bg-black text-white bg-opacity-20' : '')}>
                    <Select>
                        <SelectTrigger>
                            <SelectValue
                                placeholder="Keyword"
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value)}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="keyword">Keyword</SelectItem>
                            <SelectItem value="vector">Vector</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className={'relative ml-2' + (is_hotkeyed ? 'bg-black text-white bg-opacity-20' : '')}>
                    <Toggle
                        aria-label="Toggle italic"
                        pressed={starOnly}
                        onPressedChange={(e) => {
                            console.log(e);
                            setStarOnly(e);
                        }}
                        className="cursor-pointer"
                    >
                        {starOnly ? <StarFilledIcon className="w-4 h-4" /> : <StarIcon className="w-4 h-4" />}
                    </Toggle>
                </div>
            </div>
            <div className="relative w-full flex ">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MagnifyingGlassIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                </div>
                <Input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={'block w-full p-4 pl-10 ' + (is_hotkeyed ? 'bg-black text-white bg-opacity-20' : '')}
                    placeholder="Search for anything..."
                    required
                />
            </div>
            {results.length > 0 && !searchLoading && query && (
                <div className={classForSearch}>
                    {results.map((item) => (
                        <SingleCard
                            item={item}
                            key={item?.id}
                            is_hotkeyed={is_hotkeyed}
                            is_keyword={searchType === 'keyword'}
                            keyword={query}
                        />
                    ))}
                </div>
            )}{' '}
            {searchLoading && query && (
                <div className={classForSearch}>
                    <SingleCard isLoading={true} />
                    <SingleCard isLoading={true} />
                    <SingleCard isLoading={true} />
                    <SingleCard isLoading={true} />
                </div>
            )}
        </div>
    );
}

export default SearchBar;
