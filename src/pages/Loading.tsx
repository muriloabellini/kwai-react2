
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { ConfettiComponent } from '../components/ConfettiComponent';

const loadingMessages = [
  "Analisando informações da conta",
  "Analisando seu tempo na plataforma",
  "Verificando quantidade de vídeos assistidos",
  "Calculando seu potencial de ganhos",
  "Validando dados de segurança",
  "Finalizando análise"
];

const Loading = () => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsComplete(true);
          setShowConfetti(true);
          setTimeout(() => {
            navigate('/partner');
          }, 2000);
          return 100;
        }
        return prev + 1;
      });
    }, 80);

    const messageInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-300">
        {/* Logo Kwai */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1000 296.4" 
          xmlSpace="preserve"
          className="h-8"
        >
          <path d="M56.6-156.6H18c-8.3 0-15-6.7-15-15v-38.6c0-8.3 6.7-15 15-15h38.5c8.3 0 15 6.7 15 15v38.6c0 8.3-6.7 15-14.9 15" style={{fillRule: 'evenodd', clipRule: 'evenodd', fill: '#ff7705'}} transform="matrix(4.31842 0 0 4.31842 -13.153 972.606)"/>
          <path d="M26-167.5c-.8 0-2.7-.4-4.6-.9-1.9-.5-3.2-1.2-3.2-1.2-.7-.4-1-1-1.1-1.6 0 0-.2-2-.2-5.8 0-2.9.1-4.5.2-4.9.1-.5.3-.9 1-.9s1.5 0 3.6.4c2.5.5 3.7.9 4.3 1.1.5.2 1.1.6 1.2 1.4 0 0 .3 2.1.3 5.3 0 2.6-.2 5.2-.3 6-.1.7-.4 1.1-1.2 1.1zm11.3-9c0-.5-.2-.9-.5-1.2l-6.5-6.4c-.7-.8-1.6-1.3-2.7-1.5 0 0-2.4-.6-6.1-1.2-3.6-.6-4.6-.5-4.6-.5-3.2 0-3.3 3.4-3.4 3.8-.1.8-.3 3-.3 6.1 0 3.6.2 6.1.3 7.7.3 2.3 2.1 3.4 2.9 3.9.2.1 2.5 1.1 4.7 1.8 1.5.5 4 1.2 5.1 1.3.4.1 2.6.4 3.7-1l6.9-8.9c.3-.4.4-.6.4-1.2l.1-2.7zm15.1-13c-1-.1-2-.1-2.9-.1L34-188.1s-1 .2-1.6.9c-.5.6-.5 1.1-.5 1.1l.4.4 6.1 6.2c.7.7 1.1 1.3 1.1 2.3v3.5c0 .6-.1 1.2-.4 1.6l-3.3 4.5 3.3 1.3c1.3.4 2.4.4 3.7.2l14.2-3.3s2.6-.7 2.6-3.1v-8.7c0-.2-.1-.3-.3-.3l-9.1 1.8c-.3.1-.6.4-.6.7v4.2c0 .3.3.5.6.4l2.8-.6c.1 0 .3.1.3.3v1.4c0 .3-.2.5-.5.5l-3.2.7s-2.2.6-2.2-1.8v-5.4c0-2.3 1.7-2.6 1.7-2.6l10-1.9c.3 0 .5-.3.5-.5v-2.2c0-2.4-2.3-2.6-2.3-2.6l-4.9-.4zm-18.6-22.7c3.7.2 6.5 3.7 6.3 8-.2 4.3-3.4 7.7-7 7.6-3.7-.2-6.4-3.7-6.2-8 .2-4.4 3.3-7.8 6.9-7.6zm15 10c.2-2.9 2.2-5.2 4.7-5.1 2.3.1 4.2 2.6 4.1 5.4-.2 2.9-2.3 5.2-4.7 5.1-2.4-.1-4.2-2.5-4.1-5.4zm12.5.4c0-5.8-4.3-10.4-9.6-10.4-3.1 0-5.9 1.6-7.7 4.1-1.4-6.2-6.5-10.7-12.7-10.7-7.4 0-13.3 6.4-13.2 14.2 0 7.9 6 14.4 13.2 14.3.4 0 20.5-1.4 20.4-1.4 5.7-.5 9.6-4.4 9.6-10.1z" style={{fillRule: 'evenodd', clipRule: 'evenodd', fill: '#fff'}} transform="matrix(4.31842 0 0 4.31842 -13.153 972.606)"/>
          <g>
            <g transform="matrix(4.31842 0 0 4.31842 240.58 995.885)">
              <linearGradient id="a" gradientUnits="userSpaceOnUse" x1="83.454" y1="-10.383" x2="82.473" y2="23.125" gradientTransform="matrix(3.7702 0 0 -4.9463 -171.004 -220.774)">
                <stop offset="0" style={{stopColor: '#ff6000'}}/>
                <stop offset="1" style={{stopColor: '#ff8d0a'}}/>
              </linearGradient>
              <path d="M132.1-206.6h.1c2.7-.5 6.6-1.1 11.1-1.1 9.4 0 14.5 4.2 14.5 12.7v23.9c0 .7-.6 1.4-1.3 1.4h-5.6c-.2 0-.7-.1-1-.4-.3-.2-.4-.7-.4-.9v-.5c-.8.9-2.5 2.2-7.3 2.3-5.1.1-7.6-1.3-8.8-2.2-1.5-1.1-2.7-2.5-3.6-4.1-.5-1-.9-2.1-1.1-4.1-.2-2.2.2-4.3.8-5.7 1.7-4.1 6-6.4 13.6-6.9 2.3-.1 6.1-.2 6.1-.2v-2.5c0-4.3-1.8-4.9-5.7-4.9-5.6 0-10.6 1-11.5 1.2-.4 0-.6-.1-.7-.2-.2-.2-.3-.5-.3-.6v-5.6c0-.6.5-1.1 1.1-1.3-.1-.3-.1-.3 0-.3zm5 25.6c.2-2.4 2.4-3.2 2.9-3.3 1.1-.4 2.6-.7 4.5-.8 2.3-.2 4.5-.1 4.5-.1v7.6c-1.9.9-3.4 1.3-5.7 1.4h-.7c-2.1 0-5.1-.6-5.6-4.3.1-.3.1-.4.1-.5z" style={{fillRule: 'evenodd', clipRule: 'evenodd', fill: 'url(#a)'}}/>
              <linearGradient id="b" gradientUnits="userSpaceOnUse" x1="97.457" y1="-29.737" x2="96.919" y2="-11.338" gradientTransform="matrix(2.1647 0 0 -8.6151 -39.606 -426.12)">
                <stop offset="0" style={{stopColor: '#ff6000'}}/>
                <stop offset="1" style={{stopColor: '#ff8d0a'}}/>
              </linearGradient>
              <path d="M168-206.6c-.8 0-1.3.7-1.4 1.4v34c0 .2.1.5.4.9s.8.4 1 .4h6.4c.9 0 1.3-.6 1.3-1.4v-33.8c0-.8-.6-1.4-1.4-1.4H168z" style={{fillRule: 'evenodd', clipRule: 'evenodd', fill: 'url(#b)'}}/>
              <linearGradient id="c" gradientUnits="userSpaceOnUse" x1="58.556" y1="-9.836" x2="57.187" y2="36.913" gradientTransform="matrix(3.8065 0 0 -4.8991 -173.976 -218.133)">
                <stop offset=".021" style={{stopColor: '#ff6000'}}/>
                <stop offset="1" style={{stopColor: '#ff8d0a'}}/>
              </linearGradient>
              <path d="M56.3-222.9c-.5 0-.9.2-1.2.5l-16 20.3c-.4.5-1.4.1-1.4-.7v-18.6c0-.5-.2-.8-.4-1.1-.2-.2-.5-.5-1-.5h-6.4c-.9 0-1.5.7-1.5 1.5v50.1c0 .5.2.8.4 1 .3.3.7.4 1 .4h6.4c1 0 1.5-.6 1.5-1.4V-193c0-1.7 1.3-1.4 1.8-.8l19.3 23c.4.5 1 .8 1.7.8h8.6c.2 0 .3-.1.4-.3.1-.2.1-.5-.1-.6l-22-25.8c-.3-.3-.4-.7-.2-1l18.3-24.5c.1-.1.2-.3 0-.6-.2-.2-.3-.2-.4-.2l-8.8.1z" style={{fillRule: 'evenodd', clipRule: 'evenodd', fill: 'url(#c)'}}/>
              <linearGradient id="d" gradientUnits="userSpaceOnUse" x1="90.111" y1="-6.785" x2="90.111" y2="43.918" gradientTransform="matrix(4.0727 0 0 -4.579 -195.758 -200.213)">
                <stop offset="0" style={{stopColor: '#ff6000'}}/>
                <stop offset="1" style={{stopColor: '#ff8d0a'}}/>
              </linearGradient>
              <path d="M168-222.9c-.9 0-1.4.6-1.4 1.3V-214c0 .8.6 1.4 1.4 1.4h6.3c.9 0 1.5-.6 1.5-1.4v-7.5c0-.8-.6-1.4-1.4-1.4H168z" style={{fillRule: 'evenodd', clipRule: 'evenodd', fill: 'url(#d)'}}/>
              <linearGradient id="e" gradientUnits="userSpaceOnUse" x1="74.036" y1="8.74" x2="72.707" y2="54.15" gradientTransform="matrix(5.3395 0 0 -3.4926 -299.434 -139.407)">
                <stop offset="0" style={{stopColor: '#ff6000'}}/>
                <stop offset="1" style={{stopColor: '#ff8d0a'}}/>
              </linearGradient>
              <path d="M107.5-183.5c-.2.7-1.2.7-1.5 0l-8.1-22.2c-.2-.4-.7-.8-1.3-.8h-4.2c-.7 0-1.2.4-1.4.9l-8.1 22.1c-.2.7-1.4.7-1.5 0l-6.1-21.3c0-.1-.1-.9-.6-1.3-.5-.3-.6-.3-1.2-.4h-5.6c-.9 0-1.7.7-1.5 1.7 0 .1 9.2 33.1 9.4 33.8.1.4.2.7.5.9s.6.4 1 .4h8.9c.7 0 1.2-.3 1.4-.8l1.4-3.2 5.1-13.6c.3-.6 1.2-.7 1.4 0l6.1 16.6c.1.3.2.5.5.7.2.2.6.3.9.3h9.4c.8 0 1.4-.4 1.5-1l.4-1.6s.2-.9.7-2.6l7.6-29.5c.2-.9-.2-1.8-1.1-2H115c-.7 0-1.2.4-1.4 1-.2.4-5.9 21.2-6.1 21.9z" style={{fillRule: 'evenodd', clipRule: 'evenodd', fill: 'url(#e)'}}/>
            </g>
          </g>
        </svg>

        {/* Valor e Botão agrupados */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M2.27307 5.62524C3.06638 4.92494 4.10851 4.5 5.24989 4.5H18.7499C19.8913 4.5 20.9334 4.92494 21.7267 5.62524C21.5423 4.14526 20.2798 3 18.7499 3H5.24989C3.71995 3 2.4575 4.14525 2.27307 5.62524Z" fill="#FF4906"/>
              <path d="M2.27307 8.62524C3.06638 7.92494 4.10851 7.5 5.24989 7.5H18.7499C19.8913 7.5 20.9334 7.92494 21.7267 8.62524C21.5423 7.14526 20.2798 6 18.7499 6H5.24989C3.71995 6 2.4575 7.14525 2.27307 8.62524Z" fill="#FF4906"/>
              <path d="M5.25 9C3.59315 9 2.25 10.3431 2.25 12V18C2.25 19.6569 3.59315 21 5.25 21H18.75C20.4069 21 21.75 19.6569 21.75 18V12C21.75 10.3431 20.4069 9 18.75 9H15C14.5858 9 14.25 9.33579 14.25 9.75C14.25 10.9926 13.2426 12 12 12C10.7574 12 9.75 10.9926 9.75 9.75C9.75 9.33579 9.41421 9 9 9H5.25Z" fill="#FF4906"/>
            </svg>
            <span className="text-[#FF4906] font-semibold font-inter">R$ 0,00</span>
          </div>
          <button 
            className="bg-[#FF4906] text-white px-6 py-2 rounded-xl font-semibold font-inter text-sm hover:bg-[#E5420A] transition-all duration-300 animate-gentle-pulse"
          >
            SACAR
          </button>
        </div>
      </div>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(100)].map((_, i) => {
            const colors = ['#FF4906', '#FF6B35', '#F7931E', '#FFB627', '#FFC93C', '#FB5607', '#FF006E', '#8338EC', '#3A86FF'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 8 + 4;
            const animationDuration = Math.random() * 3 + 2;
            const delay = Math.random() * 2;
            
            return (
              <div
                key={i}
                className="absolute opacity-90"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10px`,
                  width: `${size}px`,
                  height: `${size * 2}px`,
                  backgroundColor: randomColor,
                  animation: `confetti-fall ${animationDuration}s linear infinite`,
                  animationDelay: `${delay}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  borderRadius: '1px'
                }}
              />
            );
          })}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-8 max-w-sm mx-auto w-full text-center">
        <h2 className="text-2xl font-bold text-black font-inter mb-8">
          Analisando sua conta
        </h2>

        {/* Progress Circle */}
        <div className="mb-8 relative">
          <div className="w-48 h-48 mx-auto relative">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#f3f4f6"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#FF4906"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              {isComplete ? (
                <div className="text-[#FF4906] animate-bounce">
                  <Check className="w-15 h-15 animate-scale-in" strokeWidth={3} />
                </div>
              ) : (
                <span className="text-3xl font-bold text-[#FF4906] font-inter">
                  {Math.round(progress)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Loading message */}
        <p className="text-lg font-inter text-gray-700 mb-4 h-16 flex items-center justify-center">
          {loadingMessages[messageIndex]}
        </p>

        {/* Loading dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-[#FF4906] rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loading;
