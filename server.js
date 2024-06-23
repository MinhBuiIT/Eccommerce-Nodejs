const app = require('./src/app');
const { app: appConfig } = require('./src/configs/config');

const PORT = appConfig.port;

const server = app.listen(PORT, () => {
  console.log(`Server Eccommerce is running on port ${PORT}`);
});

// process.on('SIGINT', () => {
//   server.close(() => {
//     console.log('Server closed');
//   });
// });
