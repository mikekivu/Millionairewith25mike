
import { db } from "../server/db";
import { users, transactions, notifications } from "@shared/schema";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

async function createDemoUser() {
  try {
    console.log('Creating demo user with special privileges...');

    // Check if demo user already exists
    const existingDemoUser = await db
      .select()
      .from(users)
      .where(eq(users.email, "kelvinjohn0001@gmail.com"))
      .limit(1);

    if (existingDemoUser.length > 0) {
      console.log('Demo user already exists. Updating privileges...');
      
      // Update existing demo user with demo money
      const [updatedUser] = await db
        .update(users)
        .set({
          username: "KelvinJohn",
          email: "kelvinjohn0001@gmail.com",
          firstName: "Kelvin",
          lastName: "John",
          walletBalance: "10000.00000000", // $10,000 demo money
          role: "demo_user",
          active: true
        })
        .where(eq(users.id, existingDemoUser[0].id))
        .returning();

      console.log('Demo user updated successfully:', updatedUser.email);
      return updatedUser;
    }

    // Hash password for demo user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("demo123", salt);

    // Create demo user
    const [demoUser] = await db.insert(users).values({
      username: "KelvinJohn",
      password: hashedPassword,
      email: "kelvinjohn0001@gmail.com",
      firstName: "Kelvin",
      lastName: "John",
      country: "Kenya",
      phoneNumber: "+254712345678",
      walletBalance: "10000.00000000", // Start with $10,000 demo money
      active: true,
      role: "demo_user", // Special role for demo user
      referralCode: "KELVIN" + nanoid(8),
    }).returning();

    console.log('Demo user created successfully:', demoUser.email);

    // Create welcome notification for demo user
    await db.insert(notifications).values({
      userId: demoUser.id,
      title: "Welcome to MillionareWith$25!",
      message: "Your account is ready with $10,000. Start exploring investment opportunities and earn great returns!",
      type: "welcome",
      entityId: demoUser.id,
      entityType: "user",
      link: "/dashboard"
    });

    // Create initial demo transactions for realistic account history
    const demoTransactions = [
      {
        userId: demoUser.id,
        type: "deposit" as const,
        amount: "5000.00000000",
        currency: "USD",
        status: "completed" as const,
        paymentMethod: "demo_deposit",
        transactionDetails: "Initial demo deposit",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        userId: demoUser.id,
        type: "deposit" as const,
        amount: "5000.00000000", 
        currency: "USD",
        status: "completed" as const,
        paymentMethod: "demo_deposit",
        transactionDetails: "Second demo deposit",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ];

    for (const transaction of demoTransactions) {
      await db.insert(transactions).values(transaction);
    }

    console.log('Demo transactions created successfully');

    // Create notification about demo account features
    await db.insert(notifications).values({
      userId: demoUser.id,
      title: "Demo Account Features",
      message: "✅ Virtual money for testing\n✅ All investment plans available\n✅ Withdrawal testing\n✅ Real-time notifications\n✅ Complete dashboard access",
      type: "info",
      entityId: demoUser.id,
      entityType: "user",
      link: "/dashboard"
    });

    return demoUser;

  } catch (error) {
    console.error('Error creating demo user:', error);
    throw error;
  }
}

// Run the script
createDemoUser()
  .then(() => {
    console.log('Demo user setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to create demo user:', error);
    process.exit(1);
  });
