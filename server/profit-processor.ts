
import { storage } from './storage';
import { Decimal } from 'decimal.js';

export class InvestmentProfitProcessor {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Profit processor started');
    
    // Check for completed investments every minute
    this.intervalId = setInterval(async () => {
      await this.processCompletedInvestments();
    }, 60 * 1000); // 1 minute
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Profit processor stopped');
  }

  private async processCompletedInvestments() {
    try {
      const now = new Date();
      
      // Get all active investments that have completed (endDate <= now)
      const allInvestments = await storage.getAllInvestments();
      const completedInvestments = allInvestments.filter(investment => 
        investment.status === 'active' && 
        new Date(investment.endDate) <= now
      );

      console.log(`Processing ${completedInvestments.length} completed investments`);

      for (const investment of completedInvestments) {
        await this.processInvestmentProfit(investment);
      }
    } catch (error) {
      console.error('Error processing completed investments:', error);
    }
  }

  private async processInvestmentProfit(investment: any) {
    try {
      const investmentAmount = new Decimal(investment.amount);
      const profitAmount = investmentAmount.mul(4); // 400% return
      const totalReturn = investmentAmount.add(profitAmount); // Original + 400%

      // Update user wallet balance
      const user = await storage.getUser(investment.userId);
      if (!user) {
        console.error(`User not found for investment ${investment.id}`);
        return;
      }

      const currentBalance = new Decimal(user.walletBalance);
      const newBalance = currentBalance.add(totalReturn);

      // Update user balance
      await storage.updateUser(investment.userId, {
        walletBalance: newBalance.toString()
      });

      // Update investment status and profit
      await storage.updateInvestment(investment.id, {
        status: 'completed',
        profit: profitAmount.toString()
      });

      // Create profit transaction
      await storage.createTransaction({
        userId: investment.userId,
        type: 'profit',
        amount: totalReturn.toString(),
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'system',
        transactionDetails: `Investment profit: ${profitAmount.toString()} USD + principal ${investmentAmount.toString()} USD`,
        description: `Investment completed with 400% profit`,
        investmentId: investment.id
      });

      // Create notification for user
      await storage.createNotification({
        userId: investment.userId,
        title: 'Investment Completed',
        message: `Your investment has matured! You earned ${profitAmount.toString()} USD profit (400% return). Total amount ${totalReturn.toString()} USD has been added to your wallet.`,
        type: 'investment_completed',
        entityId: investment.id,
        entityType: 'investment',
        link: '/dashboard/investments'
      });

      console.log(`Processed investment ${investment.id}: Added ${totalReturn.toString()} USD to user ${investment.userId}`);
    } catch (error) {
      console.error(`Error processing investment ${investment.id}:`, error);
    }
  }
}

// Singleton instance
export const profitProcessor = new InvestmentProfitProcessor();
