import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { UserRole } from "../src/generated/prisma/enums";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function seedUser(emailVar: string, nameVar: string, passwordVar: string, role: UserRole) {
  const email = process.env[emailVar];
  const name = process.env[nameVar];
  const password = process.env[passwordVar];

  if (!email || !name || !password) {
    throw new Error(
      `Missing ${emailVar}/${nameVar}/${passwordVar} in environment — set them in .env before seeding.`
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role },
    create: { email, name, passwordHash, role },
  });

  console.log(`Seeded user: ${user.email} (${role})`);
}

async function main() {
  await seedUser("SEED_USER_1_EMAIL", "SEED_USER_1_NAME", "SEED_USER_1_PASSWORD", "OWNER");
  await seedUser("SEED_USER_2_EMAIL", "SEED_USER_2_NAME", "SEED_USER_2_PASSWORD", "OWNER");
  await seedUser("SEED_USER_3_EMAIL", "SEED_USER_3_NAME", "SEED_USER_3_PASSWORD", "SALES");
  await seedUser("SEED_USER_4_EMAIL", "SEED_USER_4_NAME", "SEED_USER_4_PASSWORD", "MARKETING");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
