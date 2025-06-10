import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const Videos = () => {
  const navigate = useNavigate();
  const [currentVideo, setCurrentVideo] = useState(0);
  const [videoWatchTime, setVideoWatchTime] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(100);
  const [showCashToast, setShowCashToast] = useState(false);
  const [showStartModal, setShowStartModal] = useState(true);
  const [lastEarning, setLastEarning] = useState(0);
  const [isClosingPopup, setIsClosingPopup] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [isLastVideo, setIsLastVideo] = useState(false);
  const [skipNotification, setSkipNotification] = useState(false);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const videoFiles = [
    '/media/1.mp4',
    '/media/2.mp4',
    '/media/3.mp4',
    '/media/4.mp4',
    '/media/5.mp4'
  ];

  // Inicializa o áudio corretamente
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        const audioElement = new Audio();
        audioElement.src = 'media/cash.mp3';
        audioElement.preload = 'auto';
        
        await new Promise<void>((resolve, reject) => {
          const onCanPlay = () => {
            audioElement.removeEventListener('canplaythrough', onCanPlay);
            audioElement.removeEventListener('error', onError);
            resolve();
          };
          
          const onError = (err: Event) => {
            audioElement.removeEventListener('canplaythrough', onCanPlay);
            audioElement.removeEventListener('error', onError);
            reject(new Error('Failed to load audio'));
          };
          
          audioElement.addEventListener('canplaythrough', onCanPlay);
          audioElement.addEventListener('error', onError);
          audioElement.load();
        });

        audioRef.current = audioElement;
      } catch (error) {
        console.error("Erro ao carregar áudio:", error);
        const fallbackAudio = new Audio('/media/cash.mp3');
        fallbackAudio.preload = 'auto';
        audioRef.current = fallbackAudio;
      }
    };

    initializeAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const getVideoEarning = useCallback((seconds: number) => {
    if (seconds >= 60) return 157.98;
    if (seconds >= 30) return 74.13;
    if (seconds >= 15) return 38.29;
    return 0;
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setVideoWatchTime(0);
    timerRef.current = setInterval(() => {
      setVideoWatchTime(prev => prev + 1);
    }, 1000);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const playCashSound = useCallback(async () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        await audioRef.current.play().catch(async (e) => {
          console.error("Erro na primeira tentativa de áudio:", e);
          await audioRef.current?.load();
          audioRef.current!.currentTime = 0;
          await audioRef.current?.play().catch(e => {
            console.error("Erro na segunda tentativa de áudio:", e);
          });
        });
        return;
      }

      const fallbackAudio = new Audio('/media/cash.mp3');
      fallbackAudio.volume = 0.7;
      await fallbackAudio.play().catch(e => {
        console.error("Erro no fallback de áudio:", e);
      });
    } catch (error) {
      console.error("Erro geral no sistema de áudio:", error);
    }
  }, []);

  const handleClaimEarning = useCallback(async () => {
    if (buttonsDisabled && !isLastVideo) return;
    
    clearTimer();
    const earning = getVideoEarning(videoWatchTime);
    setLastEarning(earning);
    setTotalEarnings(prev => prev + earning);
    setShowCashToast(true);
    setSkipNotification(false);
    await playCashSound();

    if (!isLastVideo) {
      setIsVideoEnded(true);
    }
  }, [clearTimer, getVideoEarning, videoWatchTime, playCashSound, buttonsDisabled, isLastVideo]);

  const handleVideoEnded = useCallback(() => {
    handleClaimEarning();
  }, [handleClaimEarning]);

  const handleSkipVideo = useCallback(async () => {
    if (buttonsDisabled && !isLastVideo) return;
    
    clearTimer();
    const earning = 38.29;
    setLastEarning(earning);
    setTotalEarnings(prev => prev + earning);
    setShowCashToast(true);
    setSkipNotification(true);
    await playCashSound();

    if (!isLastVideo) {
      setIsVideoEnded(true);
    }
  }, [clearTimer, playCashSound, buttonsDisabled, isLastVideo]);

  const handleGoToBalance = useCallback(() => {
    navigate('/pix');
  }, [navigate]);

  const handleStartVideos = useCallback(() => {
    setShowStartModal(false);
    startTimer();
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  }, [startTimer]);

  const handleVideoLoadStart = useCallback(() => {
    setVideoLoaded(false);
  }, []);

  const handleVideoLoadedData = useCallback(() => {
    setVideoLoaded(true);
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.error("Erro ao reproduzir vídeo:", e));
    }
  }, []);

  const handleContinueToNextVideo = useCallback(() => {
    setIsClosingPopup(true);
    
    setTimeout(() => {
      setShowCashToast(false);
      setIsClosingPopup(false);
      setSkipNotification(false);
      setIsVideoEnded(false);
      
      if (currentVideo < videoFiles.length - 1) {
        setCurrentVideo(prev => prev + 1);
        setVideoLoaded(false);
        // Garante que o próximo vídeo será reproduzido com som
        if (videoRef.current) {
          videoRef.current.muted = false;
          setIsMuted(false);
        }
      }
    }, 300);
  }, [currentVideo]);

  useEffect(() => {
    const lastVideo = currentVideo >= videoFiles.length - 1;
    setIsLastVideo(lastVideo);
    if (lastVideo) {
      setButtonsDisabled(false);
    }
  }, [currentVideo]);

  useEffect(() => {
    if (currentVideo >= 0 && !showStartModal && !isVideoEnded) {
      startTimer();
    }
    return () => clearTimer();
  }, [currentVideo, showStartModal, startTimer, clearTimer, isVideoEnded]);

  return (
    <div className="h-screen bg-black relative overflow-hidden">
      {/* Modal de Início */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#FF4906] to-[#FF5722] rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl animate-scale-in">
            <div className="mb-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#FF4906">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 font-inter">
                Vamos Começar!
              </h2>
              <p className="text-white/90 font-inter text-sm">
                Assista aos vídeos e acumule seus ganhos
              </p>
            </div>
            
            <button 
              onClick={handleStartVideos}
              className="w-full bg-white text-[#FF4906] font-semibold py-4 rounded-2xl font-inter text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
            >
              Iniciar Vídeos
            </button>
          </div>
        </div>
      )}

      {/* Pop-up modal de ganhos */}
      {showCashToast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Fundo transparente com vídeo continuando a tocar */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 18 }, (_, i) => (
              <div 
                key={i}
                className="confetti-piece" 
                style={{
                  left: `${(i * 5 + 10) % 90}%`, 
                  animationDelay: `${(i * 0.3) % 1.5}s`,
                  backgroundColor: '#FF5722'
                }}
              />
            ))}
          </div>
          
          {isLastVideo ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
              <div className="relative z-50 mx-4 max-w-sm w-full">
                <div 
                  className={`${
                    isClosingPopup ? 'animate-scale-out' : 'animate-scale-in'
                  }`}
                >
                  <img 
                    src="/img/ultimapop.png" 
                    alt="Última pop-up"
                    className="w-full h-auto rounded-3xl shadow-2xl cursor-pointer"
                    onClick={handleGoToBalance}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className={`bg-white rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl ${
              isClosingPopup ? 'animate-scale-out' : 'animate-scale-in'
            }`}>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 font-inter">
                Você ganhou
              </h2>
              
              <div className="text-5xl font-black text-[#FF5722] mb-6 font-inter animate-number-glow">
                R${lastEarning.toFixed(2)}
              </div>
              
              {skipNotification && (
                <div className="bg-[#FF5722] text-white px-3 py-2 rounded-lg mb-4 animate-fade-in">
                  Vídeo pulado! Ganho mínimo creditado.
                </div>
              )}
              
              <p className="text-gray-600 text-sm mb-6 font-inter">
                Continue assistindo para ganhar ainda mais!
              </p>
              
              <button 
                onClick={handleContinueToNextVideo}
                className="w-full bg-[#FF5722] text-white font-semibold py-3 rounded-xl font-inter text-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Continuar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Header fixo sobreposto */}
      <div className="absolute top-0 left-0 right-0 px-4 py-3 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent z-40">
        <img 
          src="/img/parceirokwai.svg" 
          alt="Parceiro Kwai" 
          className="h-7"
        />

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-black/50 px-2 py-1 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M2.27307 5.62524C3.06638 4.92494 4.10851 4.5 5.24989 4.5H18.7499C19.8913 4.5 20.9334 4.92494 21.7267 5.62524C21.5423 4.14526 20.2798 3 18.7499 3H5.24989C3.71995 3 2.4575 4.14525 2.27307 5.62524Z" fill="#FF5722"/>
              <path d="M2.27307 8.62524C3.06638 7.92494 4.10851 7.5 5.24989 7.5H18.7499C19.8913 7.5 20.9334 7.92494 21.7267 8.62524C21.5423 7.14526 20.2798 6 18.7499 6H5.24989C3.71995 6 2.4575 7.14525 2.27307 8.62524Z" fill="#FF5722"/>
              <path d="M5.25 9C3.59315 9 2.25 10.3431 2.25 12V18C2.25 19.6569 3.59315 21 5.25 21H18.75C20.4069 21 21.75 19.6569 21.75 18V12C21.75 10.3431 20.4069 9 18.75 9H15C14.5858 9 14.25 9.33579 14.25 9.75C14.25 10.9926 13.2426 12 12 12C10.7574 12 9.75 10.9926 9.75 9.75C9.75 9.33579 9.41421 9 9 9H5.25Z" fill="#FF5722"/>
            </svg>
            <span className="text-white font-semibold font-inter text-xs">
              R$ {totalEarnings.toFixed(2)}
            </span>
          </div>
          <button 
            onClick={handleGoToBalance}
            className="px-4 py-2 rounded-lg font-semibold font-inter text-xs bg-[#FF5722] text-white hover:bg-[#FF4906] transition-all duration-300"
          >
            SACAR
          </button>
        </div>
      </div>

      {/* Vídeo em tela cheia */}
      <div className="w-full h-full relative">
        {!showStartModal && (
          <video
            key={currentVideo}
            ref={videoRef}
            src={videoFiles[currentVideo]}
            className="w-full h-full object-cover absolute top-0 left-0 z-0"
            autoPlay
            muted={isMuted}
            playsInline
            onLoadStart={handleVideoLoadStart}
            onLoadedData={handleVideoLoadedData}
            onEnded={handleVideoEnded}
            onError={(e) => {
              console.error("Erro no vídeo:", e);
              if (currentVideo < videoFiles.length - 1) {
                setCurrentVideo(prev => prev + 1);
              }
            }}
          />
        )}
        
        {!videoLoaded && !showStartModal && (
          <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF5722]"></div>
          </div>
        )}
      </div>

      {/* Barra de progresso por segundos */}
      {!showStartModal && !showCashToast && (
        <div className="absolute top-16 left-4 right-4 z-40">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-inter text-xs">
                Etapa {currentVideo + 1}/{videoFiles.length} • {videoWatchTime}s
              </span>
              <span className="text-white font-inter text-xs">
                Próxima meta: {videoWatchTime < 15 ? '15s' : videoWatchTime < 30 ? '30s' : '60s'}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  videoWatchTime >= 60 ? 'bg-[#FF5722]' : 
                  videoWatchTime >= 30 ? 'bg-[#FF9142]' : 
                  videoWatchTime >= 15 ? 'bg-[#FFB142]' : 
                  'bg-[#FF5722]'
                }`}
                style={{ width: `${Math.min((videoWatchTime / 60) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-white/80 font-inter">
              <span className={videoWatchTime >= 15 ? 'text-[#FF5722]' : ''}>15s • R$38,29</span>
              <span className={videoWatchTime >= 30 ? 'text-[#FF5722]' : ''}>30s • R$74,13</span>
              <span className={videoWatchTime >= 60 ? 'text-[#FF5722]' : ''}>60s • R$157,98</span>
            </div>
          </div>
        </div>
      )}

      {/* Controles na parte inferior */}
      {!showStartModal && !showCashToast && (
        <div className="absolute bottom-4 left-4 right-4 z-40">
          <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-4">
            <div className="text-center mb-4">
              <p className="text-white font-inter text-lg font-bold">
                💰 {videoWatchTime >= 15 ? `R$ ${getVideoEarning(videoWatchTime).toFixed(2)}` : 'R$ 0,00'}
              </p>
              <p className="text-white/80 font-inter text-xs">
                {videoWatchTime < 15 ? 'Assista 15s para desbloquear ganhos' :
                videoWatchTime < 30 ? 'Continue para R$ 74,13 (30s)' :
                videoWatchTime < 60 ? 'Continue para R$ 157,98 (60s)' :
                'Máximo atingido! Resgate agora'}
              </p>
            </div>

            <div className="flex space-x-3">
              {videoWatchTime >= 15 ? (
                <button 
                  onClick={handleClaimEarning}
                  disabled={buttonsDisabled && !isLastVideo}
                  className={`flex-1 bg-[#FF5722] text-white font-semibold py-3 rounded-xl font-inter text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    buttonsDisabled && !isLastVideo ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  RESGATAR R$ {getVideoEarning(videoWatchTime).toFixed(2)}
                </button>
              ) : (
                <div className="flex-1 bg-gray-600 text-gray-300 font-semibold py-3 rounded-xl font-inter text-sm text-center">
                  Aguarde 15s
                </div>
              )}
              
              <button 
                onClick={handleSkipVideo}
                disabled={buttonsDisabled && !isLastVideo}
                className={`flex-1 bg-gray-600 text-white font-semibold py-3 rounded-xl font-inter text-sm transition-all duration-300 ${
                  buttonsDisabled && !isLastVideo ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                PULAR
              </button>
            </div>

            <div className="text-center mt-3">
              <p className="font-inter text-xs text-white/70">
                🎯 Meta: R$ 789,89 • Restam {Math.max(0, videoFiles.length - currentVideo - 1)} vídeo{videoFiles.length - currentVideo - 1 !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;