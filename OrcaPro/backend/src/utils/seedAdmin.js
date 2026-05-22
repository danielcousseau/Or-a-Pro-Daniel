const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

module.exports = async function seedAdmin() {
    const { ADMIN_NAME, ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
        console.log('ℹ️  ADMIN_USERNAME ou ADMIN_PASSWORD não definidos — criação de admin ignorada.');
        return;
    }

    const exists = await prisma.user.findFirst({ where: { isAdmin: true } });
    if (exists) return;

    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await prisma.user.create({
        data: {
            name: ADMIN_NAME || ADMIN_USERNAME,
            usuario: ADMIN_USERNAME,
            email: ADMIN_EMAIL || null,
            password: hash,
            isAdmin: true,
        },
    });

    console.log(`✅ Admin inicial criado: ${ADMIN_USERNAME}`);
};
