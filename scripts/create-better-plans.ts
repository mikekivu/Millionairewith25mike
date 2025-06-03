
import { db } from "../server/db";
import { plans } from "../shared/schema";

async function createBetterPlans() {
  try {
    console.log('Clearing existing plans...');
    
    // Delete all existing plans
    await db.delete(plans);
    console.log('Existing plans cleared successfully');
    
    console.log('Creating new Bronze, Silver, and Gold plans with better structure...');
    
    // Create Bronze plan
    await db.insert(plans).values({
      name: "Bronze",
      description: "Perfect starter plan with exceptional 400% returns in just 12 hours. Ideal for new investors looking to multiply their capital quickly.",
      returnPercentage: "400.00",
      minDeposit: "100",
      maxDeposit: "999",
      durationHours: 12,
      features: [
        "🚀 400% guaranteed return",
        "⏰ Quick 12-hour investment cycle",
        "💰 Minimum investment: $100",
        "📈 Perfect for beginners",
        "🔒 Secure and protected",
        "💬 24/7 premium support",
        "📊 Real-time profit tracking"
      ],
      active: true
    });
    
    // Create Silver plan
    await db.insert(plans).values({
      name: "Silver", 
      description: "Premium investment opportunity with 400% returns and higher investment limits. Designed for serious investors ready to scale their profits.",
      returnPercentage: "400.00",
      minDeposit: "1000",
      maxDeposit: "4999", 
      durationHours: 12,
      features: [
        "🚀 400% guaranteed return",
        "⏰ Fast 12-hour turnaround",
        "💎 Higher investment capacity",
        "🎯 Advanced profit optimization",
        "👑 Priority customer support",
        "📈 Enhanced analytics dashboard",
        "🔐 Maximum security protocols",
        "💼 Professional investment tools"
      ],
      active: true
    });
    
    // Create Gold plan
    await db.insert(plans).values({
      name: "Gold",
      description: "Elite investment plan offering maximum 400% returns with premium features. The ultimate choice for high-volume investors seeking exceptional profits.",
      returnPercentage: "400.00", 
      minDeposit: "5000",
      maxDeposit: "9999",
      durationHours: 12,
      features: [
        "🚀 400% guaranteed return",
        "⏰ Ultra-fast 12-hour cycle",
        "💎 Maximum investment limits",
        "👑 VIP exclusive support",
        "🏆 Premium investor status",
        "📊 Advanced profit analytics",
        "🔒 Military-grade security",
        "💼 Personal investment advisor",
        "🎁 Exclusive bonus rewards",
        "📈 Priority profit processing"
      ],
      active: true
    });
    
    console.log('New appealing plans created successfully!');
    
    // Verify plans were created
    const newPlans = await db.select().from(plans);
    console.log(`Total plans created: ${newPlans.length}`);
    newPlans.forEach(plan => {
      console.log(`✅ ${plan.name}: $${plan.minDeposit} - $${plan.maxDeposit} (${plan.returnPercentage}% return in ${plan.durationHours} hours)`);
    });
    
  } catch (error) {
    console.error('Error creating better plans:', error);
    throw error;
  }
}

// Run the script
createBetterPlans()
  .then(() => {
    console.log('🎉 Better plan creation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Plan creation failed:', error);
    process.exit(1);
  });
