require('dotenv').config();

const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnv = REQUIRED_ENV.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
    console.error(`FATAL: Variáveis de ambiente não definidas: ${missingEnv.join(', ')}`);
    process.exit(1);
}

const app = require('./app');
const seedAdmin = require('./utils/seedAdmin');

const PORT = process.env.PORT || 3333;

seedAdmin()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Erro ao verificar/criar admin:', err);
        process.exit(1);
    });
