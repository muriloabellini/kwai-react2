import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const loadingMessages = [
  "Validando Pesquisa",
  "Processando Saque...",
  "Quase lá! Falta apenas um passo..."
];

const Saque = () => {
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(0);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Inicia o progresso
    const totalDuration = 6000; // 6 segundos no total
    const messageDuration = totalDuration / loadingMessages.length; // 2 segundos por mensagem
    
    // Atualiza o progresso gradualmente
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / (totalDuration / 100));
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 100);

    // Mudança das mensagens a cada 2 segundos
    const messageInterval = setInterval(() => {
      setCurrentLoadingMessage(prev => (prev + 1) % loadingMessages.length);
    }, messageDuration);

    // Após 6 segundos, redireciona para a página IOF
    const redirectTimer = setTimeout(() => {
      navigate('/iof');
    }, totalDuration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Conteúdo principal */}
      <div className="relative z-10 text-center">
        {/* Logo animada */}
        <div className="mb-8">
          <svg 
            width="128" 
            height="128" 
            viewBox="0 0 295 296" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-32 h-32 mx-auto animate-float"
          >
            {/* Quadrado laranja */}
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              d="M231.27 296.341H64.579C28.7361 296.341 -0.197266 267.408 -0.197266 231.565V64.8741C-0.197266 29.0313 28.7361 0.0978394 64.579 0.0978394H230.838C266.681 0.0978394 295.614 29.0313 295.614 64.8741V231.565C295.614 267.408 266.681 296.341 231.27 296.341Z" 
              fill="#FF7705"
            />
            {/* Câmera */}
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              d="M99.1264 249.271C95.6716 249.271 87.4666 247.543 79.2616 245.384C71.0566 243.225 65.4427 240.202 65.4427 240.202C62.4198 238.475 61.1243 235.884 60.6924 233.293C60.6924 233.293 59.8287 224.656 59.8287 208.246C59.8287 195.722 60.2606 188.813 60.6924 187.085C61.1243 184.926 61.988 183.199 65.0108 183.199C68.0337 183.199 71.4885 183.199 80.5572 184.926C91.3532 187.085 96.5353 188.813 99.1264 189.676C101.286 190.54 103.877 192.268 104.308 195.722C104.308 195.722 105.604 204.791 105.604 218.61C105.604 229.838 104.74 241.066 104.308 244.52C103.877 247.543 102.581 249.271 99.1264 249.271ZM147.924 210.405C147.924 208.246 147.061 206.518 145.765 205.223L117.696 177.585C114.673 174.13 110.786 171.971 106.036 171.107C106.036 171.107 95.6716 168.516 79.6935 165.925C64.1472 163.334 59.8287 163.766 59.8287 163.766C46.0098 163.766 45.578 178.449 45.1461 180.176C44.7143 183.631 43.8506 193.131 43.8506 206.518C43.8506 222.065 44.7143 232.861 45.1461 239.77C46.4416 249.703 54.2148 254.453 57.6695 256.612C58.5332 257.044 68.4656 261.362 77.9661 264.385C84.4437 266.544 95.2398 269.567 99.99 269.999C101.717 270.431 111.218 271.726 115.968 265.681L145.765 227.247C147.061 225.519 147.493 224.656 147.493 222.065L147.924 210.405ZM213.133 154.265C208.814 153.834 204.496 153.834 200.609 153.834L133.674 160.311C133.674 160.311 129.355 161.175 126.764 164.198C124.605 166.789 124.605 168.948 124.605 168.948L126.332 170.675L152.675 197.45C155.698 200.473 157.425 203.064 157.425 207.382V222.496C157.425 225.088 156.993 227.679 155.698 229.406L141.447 248.839L155.698 254.453C161.312 256.18 166.062 256.18 171.676 255.316L232.997 241.066C232.997 241.066 244.225 238.043 244.225 227.679V190.108C244.225 189.245 243.793 188.813 242.93 188.813L203.632 196.586C202.337 197.018 201.041 198.313 201.041 199.609V217.746C201.041 219.042 202.337 219.905 203.632 219.474L215.724 216.883C216.156 216.883 217.019 217.314 217.019 218.178V224.224C217.019 225.519 216.156 226.383 214.86 226.383L201.041 229.406C201.041 229.406 191.541 231.997 191.541 221.633V198.313C191.541 188.381 198.882 187.085 198.882 187.085L242.066 178.88C243.362 178.88 244.225 177.585 244.225 176.721V167.221C244.225 156.856 234.293 155.993 234.293 155.993L213.133 154.265ZM132.81 56.2373C148.788 57.101 160.88 72.2155 160.016 90.7847C159.152 109.354 145.333 124.036 129.787 123.605C113.809 122.741 102.149 107.626 103.013 89.0573C103.877 70.0562 117.264 55.3736 132.81 56.2373ZM197.586 99.4215C198.45 86.8981 207.087 76.9657 217.883 77.3975C227.815 77.8294 236.02 88.6255 235.588 100.717C234.725 113.24 225.656 123.173 215.292 122.741C204.928 122.309 197.154 111.945 197.586 99.4215ZM251.567 101.149C251.567 76.102 232.997 56.2373 210.11 56.2373C196.723 56.2373 184.631 63.1467 176.858 73.9428C170.812 47.1686 148.788 27.7357 122.014 27.7357C90.0577 27.7357 64.579 55.3736 65.0108 89.0573C65.0108 123.173 90.9214 151.243 122.014 150.811C123.741 150.811 210.542 144.765 210.11 144.765C234.725 142.606 251.567 125.764 251.567 101.149Z" 
              fill="white"
            />
          </svg>
        </div>

        {/* Mensagem de loading */}
        <div className="mb-6">
          <h2 className="text-[#FF4906] font-inter text-2xl font-bold mb-2 animate-pulse">
            {loadingMessages[currentLoadingMessage]}
          </h2>
        </div>

        {/* Barra de progresso */}
        <div className="w-80 max-w-sm mx-auto">
          <div className="bg-[#FF4906]/20 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#FF4906] h-full transition-all duration-100 ease-linear rounded-full"
              style={{
                width: `${progress}%`
              }}
            ></div>
          </div>
        </div>

        {/* Texto motivacional */}
        <p className="text-[#FF4906]/80 font-inter text-sm mt-6 max-w-xs mx-auto">
          Estamos processando seu saque com segurança...
        </p>
      </div>
    </div>
  );
};

export default Saque;