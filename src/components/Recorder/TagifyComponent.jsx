import React, { useState } from 'react';
import { Input } from '../ui/input';

const Tag = ({ tag, removeTag }) => (
    <span
        className="inline-block bg-blue-200 rounded-full px-3 py-1 text-sm font-semibold text-blue-700 mr-2 mb-2 mt-2 cursor-pointer hover:bg-red-500 hover:text-white transition-colors duration-200"
        onClick={() => removeTag(tag)}
    >
        {tag}
    </span>
);

const TagsInput = ({ tags, setTags }) => {
    const addTag = (tag) => {
        setTags([...tags, tag]);
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    return (
        <div className="flex flex-wrap  items-center justify-between ">
            {tags.map((tag, index) => (
                <Tag key={index} tag={tag} removeTag={removeTag} />
            ))}
            <Input
                className="flex-grow rounded-md px-3 py-1 text-sm font-semibold text-gray-700 dark:text-gray-200 mr-2 mb-2 w-1/2"
                placeholder="Add a tag"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(e.target.value);
                        e.target.value = '';
                    }
                }}
            />
        </div>
    );
};

export default TagsInput;
