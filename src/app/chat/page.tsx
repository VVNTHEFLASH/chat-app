'use client'
import { useEffect, useState } from "react";

export default function Chat() {

    const [isProduction, setIsProduction] = useState<boolean | null>(null);

    useEffect(() => {
        checkIsProduction()
    }, [])

    function checkIsProduction():void {
        const dev = process.env.NODE_ENV === 'production';
        setIsProduction(dev)
    }
    return (
      <div>
        <span>Chat app - Page</span>
        <footer>
            <span>{isProduction != null && isProduction ? "Chat app is running in production": "Chat app is running in development/test"}</span>
        </footer>
      </div>
    );
  }
  