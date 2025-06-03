import { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { copyToClipboard } from '@/lib/utils';

interface ReferralToolsProps {
  referralCode: string;
  referralLink: string;
}

export default function ReferralTools({ referralCode, referralLink }: ReferralToolsProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const handleCopyCode = async () => {
    const success = await copyToClipboard(referralCode);

    if (success) {
      setIsCopied(true);
      toast({
        title: 'Copied!',
        description: 'Referral code copied to clipboard',
      });

      setTimeout(() => setIsCopied(false), 2000);
    } else {
      toast({
        title: 'Failed to copy',
        description: 'Please select and copy the code manually',
        variant: 'destructive',
      });
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(referralLink);

    if (success) {
      setIsLinkCopied(true);
      toast({
        title: 'Copied!',
        description: 'Referral link copied to clipboard',
      });

      setTimeout(() => setIsLinkCopied(false), 2000);
    } else {
      toast({
        title: 'Failed to copy',
        description: 'Please select and copy the link manually',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join MillionaireWith$25 Investment Platform',
          text: 'Join me on MillionaireWith$25 and start earning passive income through smart investments!',
          url: referralLink,
        });

        toast({
          title: 'Shared!',
          description: 'Thank you for sharing your referral link',
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        await handleCopyLink();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: 'Sharing failed',
        description: 'Please copy the link and share it manually',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Referral Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Referral Code</label>
          <div className="flex gap-2">
            <div className="flex-1 p-2 bg-gray-50 border rounded text-sm font-mono">
              {referralCode}
            </div>
            <Button 
              size="sm" 
              onClick={handleCopyCode}
              variant={isCopied ? "default" : "outline"}
            >
              <Copy className="h-4 w-4 mr-1" />
              {isCopied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Your Referral Link</label>
          <div className="flex gap-2">
            <div className="flex-1 p-2 bg-gray-50 border rounded text-sm break-all">
              {referralLink}
            </div>
            <Button 
              size="sm" 
              onClick={handleCopyLink}
              variant={isLinkCopied ? "default" : "outline"}
            >
              <Share2 className="h-4 w-4 mr-1" />
              {isLinkCopied ? 'Copied!' : 'Share'}
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium">How Referrals Work</h4>
          <p className="text-sm text-muted-foreground">
            Share your referral code or link with friends. When they sign up and invest, you earn:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
            <li>10% commission on Level 1 (direct referrals)</li>
            <li>5% on Level 2 referrals</li>
            <li>3% on Level 3 referrals</li>
            <li>2% on Level 4 referrals</li>
            <li>1% on Level 5 referrals</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}