'use client'

import { useState, SubmitEvent, ChangeEvent } from 'react';

export default function Textbox({handleSubmit} : {handleSubmit: (question : string) =>  void}) {
    const [value, setValue ] = useState("");

    const handleInput = (event : SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (value) {
            handleSubmit(value);
            setValue("");
        }
    }

    const handleChange = (event : ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
        const input = event.target.value;
        setValue(input);
    }

    return (
        <div className="queryBox">
            <form onSubmit={handleInput}>
                <input className="pl-2 mr-2" type="text" placeholder="Ask a question..." onChange={handleChange} value={value}/>
                <button type="submit">Submit <img className="h-5 mb-1 inline" src="/send.svg" /></button>
            </form>
        </div>
    )
}