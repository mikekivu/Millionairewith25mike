import { db } from '../server/db';
import { referrals, users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function main() {
  try {
    console.log('Creating test referral data...');
    
    // Get admin user
    const [adminUser] = await db.select().from(users).where(eq(users.username, 'admin'));
    if (!adminUser) {
      console.error('Admin user not found');
      process.exit(1);
    }
    
    console.log(`Found admin user with ID: ${adminUser.id}`);
    
    // Get all non-admin users
    const allUsers = await db.select().from(users).where(eq(users.role, 'user'));
    console.log(`Found ${allUsers.length} regular users`);
    
    if (allUsers.length < 2) {
      console.error('Not enough users to create a referral tree. Please create at least 2 regular users.');
      process.exit(1);
    }
    
    // Clear existing referrals for testing
    await db.delete(referrals);
    console.log('Cleared existing referrals');
    
    // Create Level 1 referrals (admin refers first user)
    const level1User = allUsers[0];
    await db.insert(referrals).values({
      referrer_id: adminUser.id,
      referred_id: level1User.id,
      level: 1,
      commission_rate: "10",
      commission_amount: "50",
      status: "active",
      created_at: new Date()
    });
    console.log(`Created level 1 referral: admin -> ${level1User.username}`);
    
    // Update referredBy field for the referred user
    await db.update(users)
      .set({ referredBy: adminUser.id })
      .where(eq(users.id, level1User.id));
    
    // Create Level 2 referrals (first user refers second user)
    if (allUsers.length >= 2) {
      const level2User = allUsers[1];
      await db.insert(referrals).values({
        referrer_id: level1User.id,
        referred_id: level2User.id,
        level: 1,
        commission_rate: "10",
        commission_amount: "25",
        status: "active",
        created_at: new Date()
      });
      console.log(`Created level 1 referral: ${level1User.username} -> ${level2User.username}`);
      
      // This is a level 2 referral for the admin
      await db.insert(referrals).values({
        referrer_id: adminUser.id,
        referred_id: level2User.id,
        level: 2,
        commission_rate: "5",
        commission_amount: "10",
        status: "active",
        created_at: new Date()
      });
      console.log(`Created level 2 referral: admin -> ${level2User.username}`);
      
      // Update referredBy field for the referred user
      await db.update(users)
        .set({ referredBy: level1User.id })
        .where(eq(users.id, level2User.id));
      
      // Create Level 3 referrals if there are enough users
      if (allUsers.length >= 3) {
        const level3User = allUsers[2];
        await db.insert(referrals).values({
          referrerId: level2User.id,
          referredId: level3User.id,
          level: 1,
          commissionRate: "10",
          commissionAmount: "15",
          status: "active",
          createdAt: new Date()
        });
        console.log(`Created level 1 referral: ${level2User.username} -> ${level3User.username}`);
        
        // Level 2 for the previous referrer
        await db.insert(referrals).values({
          referrerId: level1User.id,
          referredId: level3User.id,
          level: 2,
          commissionRate: "5",
          commissionAmount: "5",
          status: "active",
          createdAt: new Date()
        });
        console.log(`Created level 2 referral: ${level1User.username} -> ${level3User.username}`);
        
        // Level 3 for admin
        await db.insert(referrals).values({
          referrerId: adminUser.id,
          referredId: level3User.id,
          level: 3,
          commissionRate: "3",
          commissionAmount: "3",
          status: "active",
          createdAt: new Date()
        });
        console.log(`Created level 3 referral: admin -> ${level3User.username}`);
        
        // Update referredBy field for the referred user
        await db.update(users)
          .set({ referredBy: level2User.id })
          .where(eq(users.id, level3User.id));
      }
    }
    
    console.log('Test referral data created successfully!');
  } catch (error) {
    console.error('Error creating test referral data:', error);
  } finally {
    process.exit(0);
  }
}

main();