'use client'

import type { Message } from '../app/page.tsx';
import {Fragment, useEffect, useRef} from "react";

export default function Chatbox ({messages} : {messages : Array<Message>}) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({behavior: "smooth", block: "end"})
        }
    }, [messages])

    return (
        <Fragment>
            {messages.map((message, index) => (
                <div key={index} className={message.origin === "user" ? "user-message" : "system-message"}>
                    <p>{message.content}</p>
                </div>
            ))}
            <div ref={bottomRef} />
        </Fragment>
    )
}