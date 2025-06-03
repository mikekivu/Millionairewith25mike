
import { db } from "../server/db";
import { plans } from "../shared/schema";

async function clearAllPlans() {
  try {
    console.log('Clearing all existing plans...');
    
    // Delete all existing plans
    const result = await db.delete(plans);
    console.log('All plans cleared successfully');
    
    // Verify plans were deleted
    const remainingPlans = await db.select().from(plans);
    console.log(`Remaining plans count: ${remainingPlans.length}`);
    
    if (remainingPlans.length === 0) {
      console.log('✅ All plans have been successfully deleted');
    } else {
      console.log('⚠️ Some plans may still exist');
    }
    
  } catch (error) {
    console.error('Error clearing plans:', error);
    throw error;
  }
}

// Run the script
clearAllPlans()
  .then(() => {
    console.log('Plan clearing completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Plan clearing failed:', error);
    process.exit(1);
  });
