import React, { useEffect, useRef, useState } from "react";
import './QnAChatBubble.css';
import { RedditTestimonial } from './RedditTestimonial';

const messageData = [
  {
    role: "user",
    text: "Jesus never said, ‘I am God.’",
  },
  {
    role: "ai",
    // We'll use a placeholder for the underlined part and replace it in render
    text: '— John 8:58, Jesus states, "Before Abraham was, I AM," which is a direct reference to God\'s name.',
  },
];

export default function QnAChatBubble() {
  const [userCharIndex, setUserCharIndex] = useState(messageData[0].text.length);
  const [aiDisplayText, setAiDisplayText] = useState("");
  const [aiCharIndex, setAiCharIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [startAiTyping, setStartAiTyping] = useState(false);
  const containerRef = useRef(null);

  // Intersection Observer to trigger animation on scroll into view
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  // Show typing indicator for 1 second after user message is visible
  useEffect(() => {
    if (!isVisible) return;
    setShowTyping(true);
    const timer = setTimeout(() => {
      setShowTyping(false);
      setStartAiTyping(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isVisible]);

  // Typing animation for AI message (starts after typing indicator)
  useEffect(() => {
    if (!startAiTyping) return;
    const aiMsg = messageData[1].text;
    if (aiCharIndex < aiMsg.length) {
      const timeout = setTimeout(() => {
        setAiDisplayText((prev) => prev + aiMsg[aiCharIndex]);
        setAiCharIndex((prev) => prev + 1);
      }, 12);
      return () => clearTimeout(timeout);
    }
  }, [aiCharIndex, startAiTyping]);

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-1 items-center py-4 mt-4 sm:py-6 sm:mt-6">
      {/* User Message (received, gray) */}
      <div className="flex w-full justify-start">
        <div className="bg-gray-300 text-gray-900 px-3 py-2 sm:px-4 sm:py-2 rounded-2xl rounded-bl-md max-w-[90vw] sm:max-w-[75%] shadow text-sm sm:text-base font-medium">
          {messageData[0].text}
        </div>
      </div>

      {/* Typing indicator */}
      {showTyping && (
        <div className="flex w-full justify-end">
          <div className="bg-blue-100 text-blue-700 px-3 py-2 sm:px-4 sm:py-2 rounded-2xl rounded-br-md max-w-[60vw] sm:max-w-[40%] shadow text-xs sm:text-sm font-medium italic animate-pulse">
            ...typing
          </div>
        </div>
      )}

      {/* AI Message (sent, blue) */}
      {(!showTyping && (aiDisplayText.length > 0 || startAiTyping)) && (
        <div className="flex w-full justify-end">
          <div className="bg-blue-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-2xl rounded-br-md max-w-[90vw] sm:max-w-[75%] shadow-md text-sm sm:text-base font-medium whitespace-pre-wrap">
            {/* Render with purple underline for 'Before Abraham was, I AM' */}
            {(() => {
              // Find the underlined phrase in the full text
              const underlinePhrase = 'Before Abraham was, I AM';
              const idx = aiDisplayText.indexOf(underlinePhrase);
              if (idx === -1) return <>{aiDisplayText}{aiCharIndex < messageData[1].text.length && <span className="animate-pulse">|</span>}</>;
              return <>
                {aiDisplayText.slice(0, idx)}
                <span className={`pb-0.5 inline-block relative ${aiDisplayText.slice(idx, idx + underlinePhrase.length) === underlinePhrase ? 'underline-animate' : ''}`}>{aiDisplayText.slice(idx, idx + underlinePhrase.length)}</span>
                {aiDisplayText.slice(idx + underlinePhrase.length)}
                {aiCharIndex < messageData[1].text.length && <span className="animate-pulse">|</span>}
              </>;
            })()}
          </div>
        </div>
      )}
      {/* Subtext below bubbles */}
      <div className="w-full flex justify-center mt-[2cm]">
        <span className="text-gray-400 text-center font-medium max-w-xs" style={{ fontFamily: 'Inter, "Inter Regular", Arial, sans-serif', fontSize: '18px' }}>
          Have the perfect answer every time even when faced with difficulty.
        </span>
      </div>
      {/* Why ChristTask text */}
      <div className="w-full flex justify-center mt-[3cm]">
        <span className="text-center font-bold max-w-xs" style={{ 
          fontFamily: 'Inter, "Inter Regular", Arial, sans-serif', 
          fontSize: '20px',
          color: '#a855f7'
        }}>
          • Why ChristTask?
        </span>
      </div>
      
      {/* Reddit Testimonial */}
      <div className="w-full flex justify-center mt-6">
        <div className="max-w-md w-full">
          <RedditTestimonial
            username="u/nico14301"
            timestamp="2 days ago"
            testimonial="I want to lead a Muslim friend to Jesus, but I cannot seem to find the right things to say without a possible contradiction to her. The usual 'corruption' argument, etc. She says she would likely remain a Muslim, but I get guilt as a Christian knowing that my opportunity to lead someone to Jesus was missed."
            initialVotes={127}
          />
        </div>
      </div>
    </div>
  );
} 