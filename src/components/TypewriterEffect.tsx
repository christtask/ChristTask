import React, { useState, useEffect } from 'react';

interface TypewriterEffectProps {
  phrases: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseTime?: number;
  className?: string;
  jesusClassName?: string;
  typewriterClassName?: string;
}

export const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  phrases = [
    'never claimed he was God',
    'is just a prophet',
    'is only human'
  ],
  speed = 100,
  deleteSpeed = 50,
  pauseTime = 2000,
  className = '',
  jesusClassName = 'text-black font-bold',
  typewriterClassName = 'text-white'
}) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    
    if (!isDeleting) {
      // Typing effect
      if (currentText.length < currentPhrase.length) {
        const timeout = setTimeout(() => {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1));
        }, speed);
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, pause then start deleting
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
        return () => clearTimeout(timeout);
      }
    } else {
      // Deleting effect
      if (currentText.length > 0) {
        const timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, deleteSpeed);
        return () => clearTimeout(timeout);
      } else {
        // Finished deleting, move to next phrase
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }
  }, [currentText, isDeleting, currentPhraseIndex, phrases, speed, deleteSpeed, pauseTime]);

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <div className={`${jesusClassName} mb-3 text-5xl md:text-7xl font-bold`}>Jesus</div>
      <div className={`${typewriterClassName} text-4xl md:text-6xl font-semibold h-[4rem] md:h-[6rem] flex items-center justify-center`}>
        <span className="min-w-[1ch]">
          {currentText}
          <span className="typewriter-cursor">|</span>
        </span>
      </div>
    </div>
  );
}; 