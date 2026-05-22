const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

module.exports = async function seedAdmin() {
    const { ADMIN_NAME, ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
        console.log('ℹ️  ADMIN_USERNAME ou ADMIN_PASSWORD não definidos — criação de admin ignorada.');
        return;
    }

    // Busca por email primeiro; se não tiver email, busca por username
    const existente = ADMIN_EMAIL
        ? await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })
        : await prisma.user.findUnique({ where: { usuario: ADMIN_USERNAME } });

    if (existente) {
        const data = { isAdmin: true };

        if (ADMIN_PASSWORD) {
            data.password = await bcrypt.hash(ADMIN_PASSWORD, 10);
        }

        if (ADMIN_NAME) {
            data.name = ADMIN_NAME;
        }

        // Atualiza username só se for diferente e não houver conflito
        if (ADMIN_USERNAME && existente.usuario !== ADMIN_USERNAME) {
            const conflito = await prisma.user.findUnique({ where: { usuario: ADMIN_USERNAME } });
            if (!conflito) data.usuario = ADMIN_USERNAME;
        }

        await prisma.user.update({ where: { id: existente.id }, data });
        console.log(`✅ Usuário existente promovido a admin: ${existente.usuario}`);
        return;
    }

    // Usuário não existe — cria normalmente
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
