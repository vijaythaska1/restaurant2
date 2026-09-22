export default () => ({
  port: parseInt(process.env.PORT || "", 10),
  database: {
    uri: process.env.MONGODB_URI,
  },
  cors: {
    origin: process.env.CORS_ORIGIN,
  },
  whatsapp: {
    number: process.env.WHATSAPP_NUMBER || '917300760917',
  },
});
