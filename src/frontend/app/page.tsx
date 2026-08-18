'use client'

import Textbox from '../components/Textbox';
import Chatbox from '../components/Chatbox';

import { useState } from 'react';

export type Message = {
    origin: "user" | "system",
    content: string
}

export default function Home() {
    const [messageHistory, setMessageHistory ] = useState<Array<Message>>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (question : string) => {
        setIsLoading(true);
        const body : Message = {origin: "user", content: question};

        setMessageHistory((prev) => [...prev, body]);

        const response = await fetch('/api/response', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                "Content-Type": 'application/json'
            }
        })

        if (response.ok) {
            const content = await response.json();
            const answer = content.answer;
            setIsLoading(false);

            setMessageHistory((prev) => [...prev, {origin: 'system', content: answer}]);
        } else {
            const content = await response.json();
            const error = content.error;
            console.error(error);
            setIsLoading(false);

            setMessageHistory((prev) => [...prev, {origin: 'system', content: 'An error has occurred. Please try again.'}]);
        }
    }

  return (
      <div className="chatsection">
        <h1 className="title">Stardew Valley Almanac</h1>
          <div className="messageHistory"><Chatbox messages={messageHistory} /></div>
          <div className="form"><Textbox handleSubmit={handleSubmit}/></div>
      </div>
  )
}