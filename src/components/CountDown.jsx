import React, { useState, useEffect } from "react";

export const CountdownTimer = ({initialTime, resetTrigger}) => {
    // 5 minutes in milliseconds
    const [timeLeft, setTimeLeft] = useState(initialTime);
    useEffect(() => {
        setTimeLeft(initialTime); // Reset timer when resetTrigger changes
    }, [resetTrigger, initialTime]);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1000);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    // Convert milliseconds to minutes:seconds
    const minutes = Math.floor(timeLeft / 1000 / 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);

    return (
        <div style={{ fontFamily: "monospace"}}>
            {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
    );
}