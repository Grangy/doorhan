import prisma from "../prisma";
import bcrypt from "bcryptjs";

async function createAdminUser() {
  const email = process.argv[2] || "admin@doorhan.com";
  const password = process.argv[3] || "admin123";
  const name = process.argv[4] || "Admin User";

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        name,
        role: "admin",
      },
      create: {
        email,
        password: hashedPassword,
        name,
        role: "admin",
      },
    });

    console.log("✅ Admin user created/updated successfully!");
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log(`\nYou can now login with:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();

