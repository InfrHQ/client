import * as React from 'react';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const frameworks = [
    {
        value: 'all',
        label: 'All',
    },
    {
        value: 'google',
        label: 'Google',
    },
    {
        value: 'youtube',
        label: 'YouTube',
    },
    {
        value: 'twitter',
        label: 'Twitter',
    },
    {
        value: 'gmail',
        label: 'Gmail',
    },
    {
        value: 'slack',
        label: 'Slack',
    },
    {
        value: 'discord',
        label: 'Discord',
    },
    {
        value: 'visual',
        label: 'VSCode',
    },
    {
        value: 'infr',
        label: 'Infr',
    },
];

export function Combobox({ value, setValue }) {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between">
                    {value ? frameworks.find((framework) => framework.value === value)?.label : 'Select app...'}
                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className=" p-0 h-[180px] overflow-y-scroll	">
                <Command>
                    <CommandInput placeholder="Search app..." className="h-9" />
                    <CommandEmpty>No app found.</CommandEmpty>
                    <CommandGroup>
                        {frameworks.map((framework) => (
                            <CommandItem
                                key={framework.value}
                                onSelect={(currentValue) => {
                                    setValue(currentValue === value ? '' : currentValue);
                                    setOpen(false);
                                }}
                            >
                                {framework.label}
                                <CheckIcon
                                    className={cn(
                                        'ml-auto h-4 w-4',
                                        value === framework.value ? 'opacity-100' : 'opacity-0'
                                    )}
                                />
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
