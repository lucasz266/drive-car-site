/* ==========================================================================
   Drive Car Mecânica — configuração do site
   ----------------------------------------------------------------------------
   Este é o arquivo que você edita para trocar telefone, endereço, redes
   sociais, serviços, preços e promoções. Não precisa mexer no HTML.

   ATENÇÃO: os preços abaixo são EXEMPLOS. Substitua pelos valores reais
   da oficina antes de publicar o site.
   ========================================================================== */
(function () {
  'use strict';

  window.SITE_CONFIG = {
    /* Dados de contato e endereço */
    business: {
      name: 'Drive Car Mecânica',
      whatsappNumber: '5555999251707',   // DDI + DDD + número, somente dígitos
      phoneDisplay: '(55) 99925-1707',
      address: 'Rua Duque de Caxias, 3430 – Nonoai, Santa Maria – RS, CEP 97060-210',
      mapsUrl: 'https://www.google.com/maps/place/Mecanica+drive+car+Santa+Maria/@-29.7073679,-53.8057905,17z/data=!3m1!4b1!4m6!3m5!1s0x9503cb9f6fcbc8c5:0x3e204a17cc341328!8m2!3d-29.7073726!4d-53.8032156!16s%2Fg%2F11c201y9fk?entry=ttu',
      mapsEmbedUrl: 'https://www.google.com/maps?q=-29.7073726,-53.8032156&z=17&output=embed',
      facebookUrl: 'https://www.facebook.com/DRIVECAR728/',
      // Troque pelo perfil oficial do Instagram. Deixe '' para ocultar o link.
      instagramUrl: 'https://www.instagram.com/p/DcXQ2_Yu-3W/',
    },

    /* Contador da promoção (faixa "Serviços em destaque").
       Deixe endsAt como null para ocultar. Formato: 'AAAA-MM-DDTHH:MM:SS-03:00' */
    promo: {
      endsAt: null,
    },

    /* Tipo de veículo. O fator multiplica o preço base de cada serviço. */
    vehicleTypes: [
      { id: 'compacto', label: 'Hatch / sedan', description: 'Carros compactos e médios', factor: 1 },
      { id: 'suv', label: 'SUV / picape', description: 'Veículos maiores e picapes', factor: 1.2 },
      { id: 'utilitario', label: 'Utilitário / van', description: 'Vans e utilitários de carga', factor: 1.35 },
    ],

    /* Serviços.
       - price: preço base em reais (EXEMPLO, troque pelos valores reais)
       - featured: true aparece na faixa de destaques (use no máximo 4)
       - icon: oil, checklist, scan, brake, spring, snow, battery, gear */
    services: [
      {
        id: 'oleo', name: 'Troca de óleo e filtros', tag: 'Manutenção',
        description: 'Óleo e filtros conforme o manual do fabricante.',
        price: 189, icon: 'oil', featured: true,
      },
      {
        id: 'revisao', name: 'Revisão preventiva', tag: 'Preventiva',
        description: 'Checklist completo dos itens do veículo.',
        price: 249, icon: 'checklist', featured: false,
      },
      {
        id: 'diagnostico', name: 'Diagnóstico eletrônico', tag: 'Diagnóstico',
        description: 'Leitura de falhas com scanner.',
        price: 120, icon: 'scan', featured: true,
      },
      {
        id: 'freios', name: 'Freios dianteiros', tag: 'Freios',
        description: 'Inclui pastilhas dianteiras e mão de obra.',
        price: 290, icon: 'brake', featured: true,
      },
      {
        id: 'suspensao', name: 'Suspensão (par dianteiro)', tag: 'Suspensão',
        description: 'Mão de obra. Os amortecedores são cobrados à parte.',
        price: 420, icon: 'spring', featured: false,
      },
      {
        id: 'arcondicionado', name: 'Higienização do ar-condicionado', tag: 'Conforto',
        description: 'Limpeza do sistema de climatização.',
        price: 180, icon: 'snow', featured: true,
      },
      {
        id: 'bateria', name: 'Instalação de bateria', tag: 'Elétrica',
        description: 'Mão de obra. A bateria é cobrada à parte.',
        price: 60, icon: 'battery', featured: false,
      },
    ],
  };

  /* Funções auxiliares usadas pelos outros scripts */
  const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  window.SiteUtils = {
    money: (value) => currency.format(value),
    whatsappUrl: (text) =>
      `https://wa.me/${window.SITE_CONFIG.business.whatsappNumber}?text=${encodeURIComponent(text)}`,
  };
})();
