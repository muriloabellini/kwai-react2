import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift } from 'lucide-react';
import { TextAnimate } from '../components/TextAnimate';



const Index = () => {
  useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const utmParams = {
    utm_source: urlParams.get("utm_source"),
    utm_medium: urlParams.get("utm_medium"),
    utm_campaign: urlParams.get("utm_campaign"),
    utm_term: urlParams.get("utm_term"),
    utm_content: urlParams.get("utm_content")
  };

  // Remove chaves com valor null
  const filteredParams = Object.fromEntries(
    Object.entries(utmParams).filter(([_, v]) => v != null)
  );

  localStorage.setItem("utm_params", JSON.stringify(filteredParams));
}, []);


  const [textAnimationKey, setTextAnimationKey] = useState(0);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const navigate = useNavigate();

  // Função para extrair e armazenar UTMs da URL
  const extractAndStoreUTMs = (): URL => {
    const currentUrl = new URL(window.location.href);
    const urlParams = currentUrl.searchParams;
    
    // Parâmetros UTM obrigatórios e valores padrão
    const requiredUTMs: Record<string, string> = {
      'utm_source': '7f52b1f8-0a0c-4e17-82c7-88e97b73f0d5::Teste_xTracky::::',
      'utm_medium': 'Xtracky',
      'utm_campaign': '',
      'utm_content': '',
      'utm_term': ''
    };

    // Objeto para armazenar os UTMs encontrados
    const foundUTMs: Record<string, string> = {};

    // Verifica parâmetros UTM na URL
    Object.keys(requiredUTMs).forEach((param) => {
      const value = urlParams.get(param);
      if (value) {
        foundUTMs[param] = value;
      }
    });

    // Se encontrou UTMs na URL, armazena no localStorage
    if (Object.keys(foundUTMs).length > 0) {
      localStorage.setItem('utm_params', JSON.stringify(foundUTMs));
      console.log('UTMs armazenados no localStorage:', foundUTMs);
    } else {
      // Se não encontrou, verifica se já existe no localStorage
      const storedUTMs = localStorage.getItem('utm_params');
      if (!storedUTMs) {
        // Se não existir no localStorage, usa os valores padrão
        Object.entries(requiredUTMs).forEach(([param, defaultValue]) => {
          urlParams.set(param, defaultValue);
        });
        window.history.replaceState({}, '', currentUrl.toString());
        console.log('UTMs padrão adicionados à URL');
      }
    }

    return currentUrl;
  };

  // Função para preservar UTMs em redirecionamentos
  const preserveUTMParams = (destinationPath: string): string => {
    const currentUrl = extractAndStoreUTMs();
    const searchParams = new URLSearchParams();
    
    // Primeiro verifica se há UTMs no localStorage
    const storedUTMs = localStorage.getItem('utm_params');
    if (storedUTMs) {
      const utmParams = JSON.parse(storedUTMs);
      Object.entries(utmParams).forEach(([key, value]) => {
        searchParams.append(key, value as string);
      });
    } else {
      // Se não houver no localStorage, usa os da URL atual
      currentUrl.searchParams.forEach((value, key) => {
        if (key.startsWith('utm_') || key === 'click_id') {
          searchParams.append(key, value);
        }
      });
    }
    
    return `${destinationPath}?${searchParams.toString()}`;
  };

  const handleValidateAccount = () => {
    if (isButtonClicked) return;
    
    setIsButtonClicked(true);
    const destinationPath = '/loading';
    const finalPath = preserveUTMParams(destinationPath);
    console.log('Redirecionando para:', finalPath);
    navigate(finalPath);
  };

  // Executa a extração de UTMs quando o componente monta
  useEffect(() => {
    extractAndStoreUTMs();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFD] relative overflow-hidden flex flex-col">
      {/* Header laranja com texto animado */}
      <div className="bg-[#FF4906] py-6 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#FF4906] via-[#FF5722] to-[#FF4906] animate-pulse"></div>
        <div className="relative z-10">
          <TextAnimate 
            key={`text-animation-${textAnimationKey}`}
            animation="blurInUp" 
            by="character" 
            duration={3}
            startOnView={false}
            once={true}
            className="text-white font-bold text-lg font-inter"
          >
            Parabéns! Você foi selecionado!
          </TextAnimate>
        </div>
      </div>

      {/* Luzes laranjas animadas no fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-40 left-6 w-40 h-40 bg-[#FF4906] rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-12 w-28 h-28 bg-[#FF4906] rounded-full blur-2xl opacity-30 animate-bounce delay-500"></div>
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-8 max-w-sm mx-auto w-full">
        
        {/* Logo adicionado aqui */}
        <div className="text-center mb-4">
          <img
            src="/img/premio.png"
            alt="Logo"
            className="w-[120px] h-auto mx-auto object-cover"
          />
        </div>

        {/* Imagem do presente */}
        <div className="text-center mb-6">
          <img
            src="/img/gif.gif"
            alt="Presente animado"
            className="w-[200px] h-[200px] mx-auto object-cover rounded-2xl"
          />
        </div>

        {/* Texto principal */}
        <div className="text-center mb-3">
          <p className="text-black font-bold text-[24px] font-inter leading-tight mb-6">
            Valide sua conta para 
            <span className="text-[#FF4906] font-bold"> se tornar Nosso Parceiro</span>
          </p>
        </div>

        {/* Botão de validação */}
        <button 
          onClick={handleValidateAccount}
          disabled={isButtonClicked}
          className={`w-full bg-[#FF4906] text-white font-semibold py-4 rounded-2xl font-inter text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-[#FF4906]/25 mb-8 ${
            isButtonClicked ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <Gift className="w-5 h-5" />
            <span>{isButtonClicked ? 'REDIRECIONANDO...' : 'VALIDAR CONTA'}</span>
          </div>
        </button>

        {/* Valor em destaque */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-[#FF4906]/20 to-[#FF4906]/10 rounded-2xl p-6 border border-[#FF4906]/30">
            <p className="text-gray-700 text-sm font-inter mb-2">
              Ganhe
            </p>
            <p className="text-[#FF4906] text-3xl font-bold font-inter">
              R$783,98
            </p>
            <p className="text-gray-700 text-sm font-inter mt-2">
              em suas primeiras missões!
            </p>
          </div>
        </div>

        {/* Texto informativo */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm font-inter">
            Você será recompensado por cada missão completada!
          </p>
          <p className="text-gray-600 text-xs font-inter mt-2">
            Valide agora mesmo antes que expire!
          </p>
        </div>
      </div>

      {/* Efeito de brilho adicional */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FF4906]/5 to-transparent"></div>
    </div>
  );
};

export default Index;