export default () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pizzaholic',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  whatsapp: {
    number: process.env.WHATSAPP_NUMBER || '917300760917',
  },
});
