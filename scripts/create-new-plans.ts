
import { db } from "../server/db";
import { plans } from "../shared/schema";

async function createNewPlans() {
  try {
    console.log('Clearing existing plans...');
    
    // Delete all existing plans
    await db.delete(plans);
    console.log('Existing plans cleared successfully');
    
    console.log('Creating new Bronze, Silver, and Gold plans...');
    
    // Create Bronze plan
    await db.insert(plans).values({
      name: "Bronze",
      description: "High-return investment plan with 400% returns in just 12 hours",
      returnPercentage: "400.00",
      minDeposit: "100",
      maxDeposit: "999",
      durationHours: 12,
      features: [
        "400% return on investment",
        "12-hour investment cycle",
        "Minimum $100 investment",
        "Quick turnaround",
        "24/7 support"
      ],
      active: true
    });
    
    // Create Silver plan
    await db.insert(plans).values({
      name: "Silver", 
      description: "Premium investment plan with 400% returns and higher investment limits",
      returnPercentage: "400.00",
      minDeposit: "1000",
      maxDeposit: "4999", 
      durationHours: 12,
      features: [
        "400% return on investment",
        "12-hour investment cycle",
        "Higher investment limits",
        "Priority support",
        "Advanced analytics"
      ],
      active: true
    });
    
    // Create Gold plan
    await db.insert(plans).values({
      name: "Gold",
      description: "Elite investment plan with maximum returns and premium features",
      returnPercentage: "400.00", 
      minDeposit: "5000",
      maxDeposit: "9999",
      durationHours: 12,
      features: [
        "400% return on investment",
        "12-hour investment cycle", 
        "Maximum investment limits",
        "VIP support",
        "Exclusive features",
        "Personal advisor"
      ],
      active: true
    });
    
    console.log('New plans created successfully!');
    
    // Verify plans were created
    const newPlans = await db.select().from(plans);
    console.log(`Total plans created: ${newPlans.length}`);
    newPlans.forEach(plan => {
      console.log(`- ${plan.name}: $${plan.minDeposit} - $${plan.maxDeposit} (${plan.returnPercentage}% return)`);
    });
    
  } catch (error) {
    console.error('Error creating plans:', error);
    throw error;
  }
}

// Run the script
createNewPlans()
  .then(() => {
    console.log('Plan creation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Plan creation failed:', error);
    process.exit(1);
  });
