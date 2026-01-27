const { MercadoPagoConfig } = require('mercadopago');

if (!process.env.MP_ACCESS_TOKEN) {
  throw new Error('❌ MP_ACCESS_TOKEN no está configurado en .env');
}

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: {
    timeout: 5000,
  }
});

console.log('✅ Mercado Pago configurado con token:', 
  process.env.MP_ACCESS_TOKEN.substring(0, 15) + '...');

module.exports = client;