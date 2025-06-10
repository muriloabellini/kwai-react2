import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Pix = () => {
  const navigate = useNavigate();
  const [pixKey, setPixKey] = useState('');
  const [selectedAmount, setSelectedAmount] = useState('');
  const [showWithdrawOptions, setShowWithdrawOptions] = useState(false);
  const [showValidationPopup, setShowValidationPopup] = useState(false);

  const handleRequestWithdraw = () => {
    if (pixKey.trim()) {
      setShowWithdrawOptions(true);
    }
  };

  const handleWithdraw = () => {
    if (selectedAmount) {
      setShowValidationPopup(true);
      setTimeout(() => {
        setShowValidationPopup(false);
        navigate('/saque');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 relative overflow-x-hidden">
      {/* Meta tag para viewport responsivo */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />

      {/* Pop-up de validação */}
      {showValidationPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 mx-4 max-w-sm w-full text-center shadow-xl animate-fade-in">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 font-inter">
              Validação concluída
            </h2>
            <p className="text-gray-600 text-sm font-inter">
              Seu Pix foi cadastrado e validado com sucesso!
            </p>
          </div>
        </div>
      )}

      {/* Header laranja */}
      <div className="px-4 py-6 bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url("/img/background saldo.png")'}}>
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-white font-inter text-xl font-semibold">
            Minha conta
          </h1>
          <div className="w-6"></div>
        </div>
        
        {/* Saldo */}
        <div>
          <span className="text-white/80 font-inter text-base">Saldo</span>
          <h2 className="text-white font-inter text-4xl font-bold">
            R$ 789,89
          </h2>
        </div>
      </div>

      {/* Formulário PIX ou Seleção de Valor */}
      <div className="bg-white mx-4 mt-4 p-6 rounded-lg shadow-sm">
        {!showWithdrawOptions ? (
          <>
            <h3 className="font-inter text-lg font-semibold text-gray-800 mb-4">
              Adicionar Chave PIX
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
                  Digite sua chave PIX
                </label>
                <input
                  type="text"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder="CPF, e-mail, telefone ou chave aleatória"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF4906] focus:border-[#FF4906] font-inter text-sm"
                />
              </div>
              <button 
                onClick={handleRequestWithdraw}
                disabled={!pixKey.trim()}
                className={`w-full py-3 rounded-lg font-semibold font-inter text-sm transition-all duration-200 ${
                  pixKey.trim() 
                    ? 'bg-[#FF4906] text-white hover:bg-[#E5420A] active:scale-95' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Solicitar Saque
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-inter text-lg font-semibold text-gray-800 mb-4">
              Sacar dinheiro
            </h3>
            
            <div className="flex items-center space-x-2 mb-6">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-gray-600 font-inter text-sm">Transferência bancária</span>
              <span className="text-gray-400 font-inter text-sm">/</span>
              <span className="text-green-600 font-inter text-sm font-semibold">PIX</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {['100', '250', '789.89'].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`py-3 rounded-lg border font-inter text-base font-semibold transition-colors duration-200 ${
                    selectedAmount === amount 
                      ? 'bg-[#FF4906] text-white border-[#FF4906]' 
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  R${amount.includes('.') ? amount.replace('.', ',') : amount}
                </button>
              ))}
            </div>

            <button 
              onClick={handleWithdraw}
              disabled={!selectedAmount}
              className={`w-full py-3 rounded-lg font-semibold font-inter text-base transition-all duration-200 mb-4 ${
                selectedAmount 
                  ? 'bg-[#FF4906] text-white hover:bg-[#E5420A] active:scale-95' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Sacar Dinheiro
            </button>

            <p className="text-gray-500 font-inter text-xs text-center">
              Para sacar dinheiro, você precisa de um saldo mínimo de R$ 1,50. Os limites de saque para transações individuais e mensais podem variar conforme o país ou a região.
            </p>
          </>
        )}
      </div>

      {/* Card de convite */}
      <div className="mx-4 mt-6 mb-6">
        <img 
          src="/img/bannerkwai 12amigos.png" 
          alt="Convide 12 amigos para ganhar"
          className="w-full rounded-xl shadow-sm"
        />
      </div>

      {/* Seção de convite */}
      <div className="bg-white mx-4 p-6 rounded-lg shadow-sm mb-8">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="39" viewBox="0 0 564 547" fill="none">
              <g filter="url(#filter0_d_276_54)">
                <circle cx="268" cy="268" r="268" fill="#FFDF4F"/>
              </g>
              <mask id="mask0_276_54" style={{maskType:'alpha'}} maskUnits="userSpaceOnUse" x="0" y="0" width="536" height="536">
                <circle cx="268" cy="268" r="268" fill="#FFDF4F"/>
              </mask>
              <g mask="url(#mask0_276_54)">
                <g style={{mixBlendMode:'color-dodge'}} filter="url(#filter1_f_276_54)">
                  <path d="M432.475 551.556L0 124.638L32.4125 70L476 511.735L432.475 551.556Z" fill="#FCEC95" fillOpacity="0.62"/>
                </g>
                <g style={{mixBlendMode:'color-dodge'}} filter="url(#filter2_f_276_54)">
                  <path d="M559 421L127.5 -0.5L147.412 -53L591 388.735L559 421Z" fill="#FCEC95" fillOpacity="0.62"/>
                </g>
                <g style={{mixBlendMode:'color-dodge'}} filter="url(#filter3_f_276_54)">
                  <path d="M512 460L82.5 41.5L92.4125 0L536 441.735L512 460Z" fill="#FCEC95" fillOpacity="0.62"/>
                </g>
              </g>
              <g filter="url(#filter4_i_276_54)">
                <circle cx="267.5" cy="267.5" r="215.5" fill="url(#paint0_linear_276_54)"/>
              </g>
              <g filter="url(#filter5_d_276_54)">
                <path d="M178 387.377V148H228.61V253.545H231.766L317.909 148H378.571L289.74 255.182L379.623 387.377H319.078L253.507 288.961L228.61 319.351V387.377H178Z" fill="#FFEB95"/>
              </g>
              <defs>
                <filter id="filter0_d_276_54" x="0" y="0" width="564" height="547" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                  <feOffset dx="28" dy="11"/>
                  <feComposite in2="hardAlpha" operator="out"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 0.980392 0 0 0 0 0.74902 0 0 0 0 0 0 0 0 1 0"/>
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_276_54"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_276_54" result="shape"/>
                </filter>
                <filter id="filter1_f_276_54" x="-5.8" y="64.2" width="487.6" height="493.157" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                  <feGaussianBlur stdDeviation="2.9" result="effect1_foregroundBlur_276_54"/>
                </filter>
                <filter id="filter2_f_276_54" x="121.7" y="-58.8" width="475.1" height="485.6" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                  <feGaussianBlur stdDeviation="2.9" result="effect1_foregroundBlur_276_54"/>
                </filter>
                <filter id="filter3_f_276_54" x="76.7" y="-5.8" width="465.1" height="471.6" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                  <feGaussianBlur stdDeviation="2.9" result="effect1_foregroundBlur_276_54"/>
                </filter>
                <filter id="filter4_i_276_54" x="52" y="52" width="431.8" height="431.8" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                  <feOffset dx="23" dy="12"/>
                  <feGaussianBlur stdDeviation="0.4"/>
                  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 0.992157 0 0 0 0 0.545098 0 0 0 0 0 0 0 0 1 0"/>
                  <feBlend mode="normal" in2="shape" result="effect1_innerShadow_276_54"/>
                </filter>
                <filter id="filter5_d_276_54" x="178" y="143" width="209.625" height="244.377" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                  <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                  <feOffset dx="8" dy="-5"/>
                  <feComposite in2="hardAlpha" operator="out"/>
                  <feColorMatrix type="matrix" values="0 0 0 0 0.960784 0 0 0 0 0.580392 0 0 0 0 0 0 0 0 1 0"/>
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_276_54"/>
                  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_276_54" result="shape"/>
                </filter>
                <linearGradient id="paint0_linear_276_54" x1="168.5" y1="342.5" x2="428.5" y2="88" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FAA200"/>
                  <stop offset="1" stopColor="#FEBD01"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-inter text-lg font-semibold text-gray-800 mb-2">
              Convide amigos para ganhar R$ 12,00
            </h4>
            <p className="text-gray-600 font-inter text-sm leading-relaxed">
              Chame seus amigos para assistir vídeos para ganhar dinheiro. Quanto mais amigos você convidar, mais você poderá ganhar.
            </p>
          </div>
          <img 
            src="/img/botaodeconvidar.svg" 
            alt="Convidar"
            className="cursor-pointer transition-all duration-200 hover:scale-105 flex-shrink-0"
            style={{width: '125px'}}
          />
        </div>
      </div>

      {/* Espaçamento inferior */}
      <div className="h-8"></div>
    </div>
  );
};

export default Pix;