import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, DollarSign } from 'lucide-react';
import Lottie from 'lottie-react';

const Partner = () => {
  const navigate = useNavigate();
  
  const [audioFinished, setAudioFinished] = useState(false);
  const [lottieAnimation, setLottieAnimation] = useState(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [scratched, setScratched] = useState(false);
  const [scratchedPercentage, setScratchedPercentage] = useState(0);
  const [showMoneyNotification, setShowMoneyNotification] = useState(false);
  const [showFinalContent, setShowFinalContent] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [isCountingMoney, setIsCountingMoney] = useState(false);
  const [hasStartedScratching, setHasStartedScratching] = useState(false);
  const [notificationValue, setNotificationValue] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const interactionButtonRef = useRef<HTMLButtonElement>(null);
  const scratchCardRef = useRef<HTMLDivElement>(null);
  const scratchCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioPlayAttempted = useRef(false);

  // Função para animar o valor na notificação
  const animateNotificationValue = (targetValue: number) => {
    const duration = 2000; // 2 segundos
    const steps = 40;
    const increment = targetValue / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newValue = Math.min(currentStep * increment, targetValue);
      setNotificationValue(newValue);
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setNotificationValue(targetValue);
      }
    }, duration / steps);
  };

  // Função para animar o saldo subindo
  const animateBalance = (targetValue: number) => {
    setIsCountingMoney(true);
    const duration = 2000; // 2 segundos
    const steps = 60;
    const increment = targetValue / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newValue = Math.min(currentStep * increment, targetValue);
      setCurrentBalance(newValue);
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setCurrentBalance(targetValue);
        setIsCountingMoney(false);
      }
    }, duration / steps);
  };

  // Função para tocar áudio quando começar a raspar
  const playAudioOnScratch = async () => {
    if (!audioRef.current || audioPlayAttempted.current) return;

    audioPlayAttempted.current = true;
    
    try {
      await audioRef.current.play();
      console.log('Áudio reproduzido ao começar a raspar');
    } catch (e) {
      console.error('Erro ao reproduzir áudio:', e);
    }
  };

  // Efeito otimizado para configurar a raspadinha
  useEffect(() => {
    if (!scratchCardRef.current || !scratchCanvasRef.current || !scratched) return;

    const canvas = scratchCanvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Configurações otimizadas do canvas
    const cardRect = scratchCardRef.current.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = cardRect.width * dpr;
    canvas.height = cardRect.height * dpr;
    canvas.style.width = cardRect.width + 'px';
    canvas.style.height = cardRect.height + 'px';
    
    ctx.scale(dpr, dpr);

    // Desenha a camada de cobertura com gradiente mais suave
    const gradient = ctx.createLinearGradient(0, 0, cardRect.width, cardRect.height);
    gradient.addColorStop(0, '#FF8E53');
    gradient.addColorStop(0.5, '#FF6B35');
    gradient.addColorStop(1, '#FE6B8B');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, cardRect.width, cardRect.height);
    
    // Texto otimizado
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = `bold ${Math.min(cardRect.width / 15, 18)}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.fillText('RASPE AQUI PARA REVELAR', cardRect.width / 2, cardRect.height / 2);

    // Variáveis para rastrear o raspado
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let animationFrameId: number;

    // Função otimizada para calcular porcentagem raspada
    const calculateScratchedPercentage = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      animationFrameId = requestAnimationFrame(() => {
        const sampleSize = 8; // Amostragem mais espaçada para performance
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let transparentPixels = 0;
        let totalPixels = 0;

        for (let y = 0; y < canvas.height; y += sampleSize) {
          for (let x = 0; x < canvas.width; x += sampleSize) {
            const i = (y * canvas.width + x) * 4;
            if (imageData[i + 3] === 0) transparentPixels++;
            totalPixels++;
          }
        }

        const percentage = (transparentPixels / totalPixels) * 100;
        setScratchedPercentage(percentage);

        // Ativa animação quando atingir 70%
        if (percentage >= 70 && !showMoneyNotification) {
          setShowMoneyNotification(true);
          
          // Anima o valor na notificação
          setTimeout(() => {
            animateNotificationValue(100);
          }, 300);
          
          // Anima o saldo subindo
          setTimeout(() => {
            animateBalance(100);
          }, 500);

          // Após 3 segundos, remove a notificação e mostra o conteúdo final
          setTimeout(() => {
            setShowMoneyNotification(false);
            setShowFinalContent(true);
            // Remove completamente a camada de raspadinha
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setScratchedPercentage(100);
            
            // Mostra o botão após mais 1 segundo
            setTimeout(() => {
              setShowButton(true);
            }, 1000);
          }, 3000);
        }
      });
    };

    const getEventPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
      const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const startScratching = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawing = true;
      
      // Marca que começou a raspar e toca o áudio
      if (!hasStartedScratching) {
        setHasStartedScratching(true);
        playAudioOnScratch();
      }
      
      const pos = getEventPos(e);
      lastX = pos.x;
      lastY = pos.y;
      calculateScratchedPercentage();
    };

    const scratch = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!isDrawing) return;
      
      const pos = getEventPos(e);

      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = 40; // Área de raspagem maior
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      lastX = pos.x;
      lastY = pos.y;
      
      calculateScratchedPercentage();
    };

    const stopScratching = (e?: MouseEvent | TouchEvent) => {
      if (e) e.preventDefault();
      isDrawing = false;
      calculateScratchedPercentage();
    };

    // Event listeners otimizados
    const options = { passive: false };
    canvas.addEventListener('mousedown', startScratching, options);
    canvas.addEventListener('mousemove', scratch, options);
    canvas.addEventListener('mouseup', stopScratching, options);
    canvas.addEventListener('mouseleave', stopScratching, options);
    canvas.addEventListener('touchstart', startScratching, options);
    canvas.addEventListener('touchmove', scratch, options);
    canvas.addEventListener('touchend', stopScratching, options);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      canvas.removeEventListener('mousedown', startScratching);
      canvas.removeEventListener('mousemove', scratch);
      canvas.removeEventListener('mouseup', stopScratching);
      canvas.removeEventListener('mouseleave', stopScratching);
      canvas.removeEventListener('touchstart', startScratching);
      canvas.removeEventListener('touchmove', scratch);
      canvas.removeEventListener('touchend', stopScratching);
    };
  }, [scratched, showMoneyNotification, hasStartedScratching]);

  const fallbackToVisual = () => {
    setAudioFinished(true);
    setScratched(true);
  };

  useEffect(() => {
    // Carrega a animação Lottie
    fetch('/img/Animation - 1749154790569.json')
      .then(response => response.json())
      .then(data => setLottieAnimation(data))
      .catch(error => console.log('Erro ao carregar animação Lottie:', error));

    // Cria o elemento de áudio
    const audio = new Audio('/img/contaaprovadakwai.mp3');
    audio.preload = 'auto';
    
    const handleCanPlay = () => {
      setAudioReady(true);
    };
    
    const handleEnded = () => {
      setAudioFinished(true);
      setScratched(true);
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

    audioRef.current = audio;

    // Fallback mais rápido (2 segundos)
    const timer = setTimeout(fallbackToVisual, 2000);
    
    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('canplaythrough', handleCanPlay);
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current = null;
      }
    };
  }, []);

  // Efeito para disparar interação automática
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!userInteracted && interactionButtonRef.current) {
        interactionButtonRef.current.click();
        console.log('Evento de clique disparado automaticamente');
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  const handleStartEvaluations = () => {
    console.log('Iniciando avaliações...');
    navigate('/videos');
  };

  const handleUserInteraction = () => {
    if (!userInteracted) {
      setUserInteracted(true);
    }
  };

  return (
    <div 
      className="min-h-screen bg-white relative overflow-hidden flex flex-col"
      onClick={handleUserInteraction}
    >
      {/* Botão invisível para interação */}
      <button 
        ref={interactionButtonRef}
        onClick={handleUserInteraction}
        className="absolute opacity-0 w-full h-full cursor-default"
        aria-hidden="true"
      />

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
              <linearGradient id="f" gradientUnits="userSpaceOnUse" x1="83.454" y1="-10.383" x2="82.473" y2="23.125" gradientTransform="matrix(3.7702 0 0 -4.9463 -171.004 -220.774)">
                <stop offset="0" style={{stopColor: '#ff6000'}}/>
                <stop offset="1" style={{stopColor: '#ff8d0a'}}/>
              </linearGradient>
              <path d="M132.1-206.6h.1c2.7-.5 6.6-1.1 11.1-1.1 9.4 0 14.5 4.2 14.5 12.7v23.9c0 .7-.6 1.4-1.3 1.4h-5.6c-.2 0-.7-.1-1-.4-.3-.2-.4-.7-.4-.9v-.5c-.8.9-2.5 2.2-7.3 2.3-5.1.1-7.6-1.3-8.8-2.2-1.5-1.1-2.7-2.5-3.6-4.1-.5-1-.9-2.1-1.1-4.1-.2-2.2.2-4.3.8-5.7 1.7-4.1 6-6.4 13.6-6.9 2.3-.1 6.1-.2 6.1-.2v-2.5c0-4.3-1.8-4.9-5.7-4.9-5.6 0-10.6 1-11.5 1.2-.4 0-.6-.1-.7-.2-.2-.2-.3-.5-.3-.6v-5.6c0-.6.5-1.1 1.1-1.3-.1-.3-.1-.3 0-.3zm5 25.6c.2-2.4 2.4-3.2 2.9-3.3 1.1-.4 2.6-.7 4.5-.8 2.3-.2 4.5-.1 4.5-.1v7.6c-1.9.9-3.4 1.3-5.7 1.4h-.7c-2.1 0-5.1-.6-5.6-4.3.1-.3.1-.4.1-.5z" style={{fillRule: 'evenodd', clipRule: 'evenodd', fill: 'url(#f)'}}/>
              <linearGradient id="g" gradientUnits="userSpaceOnUse" x1="97.457" y1="-29.737" x2="96.919" y2="-11.338" gradientTransform="matrix(2.1647 0 0 -8.6151 -39.606 -426.12)">
                <stop offset="0" style={{stopColor: '#ff6000'}}/>
                <stop offset="1" style={{stopColor: '#ff8d0a'}}/>
              </linearGradient>
              <path d="M168-206.6c-.8 0-1.3.7-1.4 1.4v34c0 .2.1.5.4.9s.8.4 1 .4h6.4c.9 0 1.3-.6 1.3-1.4v-33.8c0-.8-.6-1.4-1.4-1.4H168z" style={{fillRule: 'evenodd', clipRule: 'evenodd', fill: 'url(#g)'}}/>
              <linearGradient id="h" gradientUnits="userSpaceOnUse" x1="58.556" y1="-9.836" x2="57.187" y2="36.913" gradientTransform="matrix(3.8065 0 0 -4.8991 -173.976 -218.133)">
                <stop offset=".021" style={{stopColor: '#ff6000'}}/>
                <stop offset="1" style={{stopColor: '#ff8d0a'}}/>
              </linearGradient>
              <path d="M56.3-222.9c-.5 0-.9.2-1.2.5l-16 20.3c-.4.5-1.4.1-1.4-.7v-18.6c0-.5-.2-.8-.4-1.1-.2-.2-.5-.5-1-.5h-6.4c-.9 0-1.5.7-1.5 1.5v50.1c0 .5.2.8.4 1 .3.3.7.4 1 .4h6.4c1 0 1.5-.6 1.5-1.4V-193c0-1.7 1.3-1.4 1.8-.8l19.3 23c.4.5 1 .8 1.7.8h8.6c.2 0 .3-.1.4-.3.1-.2.1-.5-.1-.6l-22-25.8c-.3-.3-.4-.7-.2-1l18.3-24.5c.1-.1.2-.3 0-.6-.2-.2-.3-.2-.4-.2l-8.8.1z" style={{fillRule: 'evenodd', clipRule: 'evenodd', fill: 'url(#h)'}}/>
              <linearGradient id="i" gradientUnits="userSpaceOnUse" x1="90.111" y1="-6.785" x2="90.111" y2="43.918" gradientTransform="matrix(4.0727 0 0 -4.579 -195.758 -200.213)">
                <stop offset="0" style={{stopColor: '#ff6000'}}/>
                <stop offset="1" style={{stopColor: '#ff8d0a'}}/>
              </linearGradient>
              <path d="M168-222.9c-.9 0-1.4.6-1.4 1.3V-214c0 .8.6 1.4 1.4 1.4h6.3c.9 0 1.5-.6 1.5-1.4v-7.5c0-.8-.6-1.4-1.4-1.4H168z" style={{fillRule: 'evenodd', clipRule: 'evenodd', fill: 'url(#i)'}}/>
              <linearGradient id="j" gradientUnits="userSpaceOnUse" x1="74.036" y1="8.74" x2="72.707" y2="54.15" gradientTransform="matrix(5.3395 0 0 -3.4926 -299.434 -139.407)">
                <stop offset="0" style={{stopColor: '#ff6000'}}/>
                <stop offset="1" style={{stopColor: '#ff8d0a'}}/>
              </linearGradient>
              <path d="M107.5-183.5c-.2.7-1.2.7-1.5 0l-8.1-22.2c-.2-.4-.7-.8-1.3-.8h-4.2c-.7 0-1.2.4-1.4.9l-8.1 22.1c-.2.7-1.4.7-1.5 0l-6.1-21.3c0-.1-.1-.9-.6-1.3-.5-.3-.6-.3-1.2-.4h-5.6c-.9 0-1.7.7-1.5 1.7 0 .1 9.2 33.1 9.4 33.8.1.4.2.7.5.9s.6.4 1 .4h8.9c.7 0 1.2-.3 1.4-.8l1.4-3.2 5.1-13.6c.3-.6 1.2-.7 1.4 0l6.1 16.6c.1.3.2.5.5.7.2.2.6.3.9.3h9.4c.8 0 1.4-.4 1.5-1l.4-1.6s.2-.9.7-2.6l7.6-29.5c.2-.9-.2-1.8-1.1-2H115c-.7 0-1.2.4-1.4 1-.2.4-5.9 21.2-6.1 21.9z" style={{fillRule: 'evenodd', clipRule: 'evenodd', fill: 'url(#j)'}}/>
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
            <span className={`text-[#FF4906] font-semibold font-inter transition-all duration-300 ${isCountingMoney ? 'animate-pulse scale-110' : ''}`}>
              R$ {currentBalance.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <button 
            className="bg-[#FF4906] text-white px-6 py-2 rounded-xl font-semibold font-inter text-sm hover:bg-[#E5420A] transition-all duration-300 animate-pulse-soft"
          >
            SACAR
          </button>
        </div>
      </div>

      {/* Notificação de dinheiro flutuante melhorada */}
      {showMoneyNotification && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 mx-4 max-w-sm w-full border border-gray-100 animate-scale-in relative overflow-hidden">
            {/* Efeito de brilho animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-50/50 to-transparent animate-pulse"></div>
            
            {/* Círculo decorativo de fundo */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-green-100 rounded-full opacity-30"></div>
            <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-green-50 rounded-full opacity-40"></div>
            
            <div className="text-center relative z-10">
              {/* Ícone de dinheiro */}
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <DollarSign className="w-10 h-10 text-white animate-bounce" strokeWidth={2.5} />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Parabéns!</h3>
              <p className="text-lg text-gray-600 mb-4 font-medium">Você ganhou:</p>
              
              {/* Valor animado */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 mb-4 border border-green-200">
                <p className="text-4xl font-bold text-green-600 animate-number-glow">
                  R$ {notificationValue.toFixed(0)}
                </p>
                <p className="text-sm text-green-700 font-semibold mt-1">de bônus!</p>
              </div>
              
              {/* Texto adicional */}
              <p className="text-sm text-gray-500 leading-relaxed">
                Valor adicionado ao seu saldo
              </p>
            </div>
            
            {/* Partículas decorativas */}
            <div className="absolute top-4 left-4 w-2 h-2 bg-green-300 rounded-full animate-ping opacity-75"></div>
            <div className="absolute top-8 right-6 w-1.5 h-1.5 bg-green-400 rounded-full animate-ping delay-300 opacity-60"></div>
            <div className="absolute bottom-6 left-8 w-1 h-1 bg-green-500 rounded-full animate-ping delay-700 opacity-80"></div>
          </div>
        </div>
      )}

      {/* Luzes laranjas animadas no fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-40 left-6 w-40 h-40 bg-[#FF4906] rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-12 w-28 h-28 bg-[#FF4906] rounded-full blur-2xl opacity-30 animate-bounce delay-500"></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-8 max-w-sm mx-auto w-full text-center">
        
        {/* Animação Lottie de check */}
        {lottieAnimation ? (
          <div className="mb-6">
            <Lottie
              loop={true}
              animationData={lottieAnimation}
              style={{ width: 120, height: 120, margin: '0 auto' }}
            />
          </div>
        ) : (
          <div className="mb-6">
            <div className="w-[120px] h-[120px] mx-auto bg-gradient-to-r from-[#FF4906]/20 to-[#FF4906]/10 rounded-full flex items-center justify-center border border-[#FF4906]/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FF4906"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-bounce"
              >
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
          </div>
        )}

        {/* Mensagem de parabéns */}
        <h1 className="text-3xl font-bold text-black font-inter mb-8">
          Parabéns!
        </h1>

        <p className="text-lg font-inter text-gray-700 leading-tight mb-6">
          Você é um novo <span className="text-[#FF4906] font-bold">parceiro da plataforma</span>, 
          complete suas primeiras avaliações para sacar seu primeiro pagamento!
        </p>

        {/* Card de valor com raspadinha */}
        <div 
          ref={scratchCardRef}
          className="relative bg-gradient-to-r from-[#FF4906]/20 to-[#FF4906]/10 rounded-2xl p-6 border border-[#FF4906]/30 mb-4 overflow-hidden min-h-[120px] flex items-center justify-center"
        >
          {/* Conteúdo do prêmio - mostra durante a raspagem */}
          {hasStartedScratching && !showFinalContent && (
            <div className="text-center">
              <p className="text-green-600 text-2xl font-bold animate-pulse">
                R$100 de bônus!
              </p>
            </div>
          )}

          {/* Conteúdo final após a animação */}
          {showFinalContent && (
            <div className="text-center">
              <p className="text-gray-700 text-sm font-inter mb-2">
                Ganhe até
              </p>
              <p className="text-[#FF4906] text-3xl font-bold font-inter">
                R$759
              </p>
              <p className="text-green-600 text-sm font-bold">
                + R$100 de bônus!
              </p>
            </div>
          )}

          {/* Conteúdo oculto para quando não começou a raspar */}
          {!hasStartedScratching && (
            <div className="text-center opacity-0">
              <p className="text-gray-700 text-sm font-inter mb-2">
                Ganhe até
              </p>
              <p className="text-[#FF4906] text-3xl font-bold font-inter">
                R$759
              </p>
              <p className="text-green-600 text-sm font-bold">
                + R$100 de bônus!
              </p>
            </div>
          )}

          {/* Camada de raspadinha */}
          {scratched && !showFinalContent && (
            <canvas
              ref={scratchCanvasRef}
              className="absolute inset-0 w-full h-full touch-none cursor-pointer"
            />
          )}
        </div>

        {/* Indicador de progresso */}
        {scratched && scratchedPercentage < 70 && !showFinalContent && hasStartedScratching && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#FF4906] to-[#FF7705] h-2 rounded-full transition-all duration-300"
                style={{ width: `${scratchedPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Continue raspando: {Math.round(scratchedPercentage)}%
            </p>
          </div>
        )}

        <div className="flex items-center justify-center space-x-2 mb-8">
          <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 48 48" 
              width="24px" 
              height="24px" 
              baseProfile="basic"
            >
              <path fill="#37c6d0" d="M19.262,44.037l-8.04-8.04L11,35l-1.777-1.003l-5.26-5.26c-2.617-2.617-2.617-6.859,0-9.475 l5.26-5.26L11,13l0.223-0.997l8.04-8.04c2.617-2.617,6.859-2.617,9.475,0l8.04,8.04L37,13l1.777,1.003l5.26,5.26 c2.617,2.617,2.617,6.859,0,9.475l-5.26,5.26L37,35l-0.223,0.997l-8.04,8.04C26.121,46.653,21.879,46.653,19.262,44.037z"/>
              <path d="M35.79,11.01c-1.76,0.07-3.4,0.79-4.63,2.04l-6.81,6.77c-0.09,0.1-0.22,0.15-0.35,0.15 s-0.25-0.05-0.35-0.15l-6.8-6.76c-1.24-1.26-2.88-1.98-4.64-2.05L8.22,15h3.68c0.8,0,1.55,0.31,2.12,0.88l6.8,6.78 c0.85,0.84,1.98,1.31,3.18,1.31s2.33-0.47,3.18-1.31l6.79-6.78C34.55,15.31,35.3,15,36.1,15h3.68L35.79,11.01z M36.1,33 c-0.8,0-1.55-0.31-2.12-0.88l-6.8-6.78c-0.85-0.84-1.98-1.31-3.18-1.31s-2.33,0.47-3.18,1.31l-6.79,6.78 C13.45,32.69,12.7,33,11.9,33H8.22l3.99,3.99c1.76-0.07,3.4-0.79,4.63-2.04l6.81-6.77c0.09-0.1,0.22-0.15,0.35-0.15 s0.25,0.05,0.35,0.15l6.8,6.76c1.24,1.26,2.88,1.98,4.64,2.05L39.78,33H36.1z" opacity=".05"/>
              <path d="M36.28,11.5H36.1c-1.74,0-3.38,0.68-4.59,1.91l-6.8,6.77c-0.19,0.19-0.45,0.29-0.71,0.29 s-0.52-0.1-0.71-0.29l-6.79-6.77c-1.22-1.23-2.86-1.91-4.6-1.91h-0.18l-3,3h3.18c0.93,0,1.81,0.36,2.48,1.02l6.8,6.78 c0.75,0.76,1.75,1.17,2.82,1.17s2.07-0.41,2.82-1.17l6.8-6.77c0.67-0.67,1.55-1.03,2.48-1.03h3.18L36.28,11.5z M36.1,33.5 c-0.93,0-1.81-0.36-2.48-1.02l-6.8-6.78c-0.75-0.76-1.75-1.17-2.82-1.17s-2.07,0.41-2.82,1.17l-6.8,6.77 c-0.67,0.67-1.55,1.03-2.48,1.03H8.72l3,3h0.18c1.74,0,3.38-0.68,4.59-1.91l6.8-6.77c0.19-0.19,0.45-0.29,0.71-0.29 s0.52,0.1,0.71,0.29l6.79,6.77c1.22,1.23,2.86,1.91,4.6,1.91h0.18l3-3H36.1z" opacity=".07"/>
              <path fill="#fff" d="M38.78,14H36.1c-1.07,0-2.07,0.42-2.83,1.17l-6.8,6.78c-0.68,0.68-1.58,1.02-2.47,1.02 s-1.79-0.34-2.47-1.02l-6.8-6.78C13.97,14.42,12.97,14,11.9,14H9.22l2-2h0.68c1.6,0,3.11,0.62,4.24,1.76l6.8,6.77 c0.59,0.59,1.53,0.59,2.12,0l6.8-6.77C32.99,12.62,34.5,12,36.1,12h0.68L38.78,14z M36.1,34c-1.07,0-2.07-0.42-2.83-1.17l-6.8-6.78 c-1.36-1.36-3.58-1.36-4.94,0l-6.8,6.78C13.97,33.58,12.97,34,11.9,34H9.22l2,2h0.68c1.6,0,3.11-0.62,4.24-1.76l6.8-6.77 c0.59-0.59,1.53-0.59,2.12,0l6.8,6.77C32.99,35.38,34.5,36,36.1,36h0.68l2-2H36.1z"/>
            </svg>
            <p className="text-[#37c6d0] text-sm font-inter font-semibold">
              Pagamento direto em sua chave pix
            </p>
        </div>

        {/* Botão de ação principal - só aparece após a animação */}
        {showButton && (
          <button
            onClick={handleStartEvaluations}
            className="bg-gradient-to-r from-[#FF4906] to-[#FF7705] text-white font-bold py-4 px-6 rounded-xl w-full flex items-center justify-center space-x-2 shadow-lg hover:shadow-[#FF4906]/30 hover:scale-[1.02] transition-all duration-300 animate-pulse-soft"
          >
            <Rocket className="w-5 h-5" />
            <span>COMEÇAR AVALIAÇÕES</span>
          </button>
        )}
      
      </div>
    </div>
  );
};

export default Partner;
