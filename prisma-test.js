import { PrismaClient } from "@prisma/client";

async function testPrisma(prisma) {
  try {
    const companyInfo = await prisma.companyInfo.findFirst();
    if (companyInfo) {
      console.log("✅ Prisma test successful! Company info:", companyInfo);
    } else {
      console.log("❌ Prisma test failed: No company info found.");
    }
  } catch (error) {
    console.error("❌ Prisma test failed with error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

export { testPrisma };
