'use client'
import { } from "react";

export default function Chat() {

    return (
      <div>
        <div className="flex flex-row justify-center">
            <div className="mx-10">
                <input type="text" placeholder="Your name"/>
            </div>
            <div className="mx-10">
                <input type="text" placeholder="Chat room"/>
            </div>
            <div className="mx-10">
                <button type="button">
                    <span>Join</span>
                </button>
            </div>
        </div>
        {/* Message box */}
        <main>
            <div>
                <p>Welcome to Chat App!</p>
            </div>
        </main>
        {/* <footer>
            <span>{isProduction != null && isProduction ? "Chat app is running in production": "Chat app is running in development/test"}</span>
        </footer> */}
      </div>
    );
  }
  