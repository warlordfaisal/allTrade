const { PrismaClient } = require('@prisma/client');

function createPrismaClient(databaseUrl) {
    if (!databaseUrl) {
        throw new Error("Database URL is missing!");
    }

    return new PrismaClient({
        datasources: {
            db: { url: databaseUrl }
        }
    });
}

module.exports = { createPrismaClient };
