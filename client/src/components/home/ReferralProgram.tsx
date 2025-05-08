import { Network, Users, Coins } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';

export default function ReferralProgram() {
  const referralLevels = [
    { level: 'Level 1 (Direct)', rate: '10%', earnings: 'Up to 100 USDT per referral' },
    { level: 'Level 2', rate: '5%', earnings: 'Up to 50 USDT per referral' },
    { level: 'Level 3', rate: '3%', earnings: 'Up to 30 USDT per referral' },
    { level: 'Level 4', rate: '2%', earnings: 'Up to 20 USDT per referral' },
    { level: 'Level 5', rate: '1%', earnings: 'Up to 10 USDT per referral' },
  ];

  return (
    <section id="referral" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl font-heading">
            Genealogy Referral System
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-dark-500 sm:mt-4">
            Earn rewards through our multi-level referral network.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-dark-900 mb-4 font-heading">How It Works</h3>
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-700 text-white">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-dark-900">Invite Your Network</h4>
                    <p className="mt-1 text-dark-500">Share your unique referral link with friends and family.</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-700 text-white">
                      <Network className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-dark-900">Build Your Network</h4>
                    <p className="mt-1 text-dark-500">As your network grows, so does your earning potential.</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-700 text-white">
                      <Coins className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-dark-900">Earn Commissions</h4>
                    <p className="mt-1 text-dark-500">Receive commissions from up to 5 levels of referrals.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-dark-900 mb-4 font-heading">Commission Structure</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level</TableHead>
                      <TableHead>Commission Rate</TableHead>
                      <TableHead>Potential Earnings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referralLevels.map((level, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{level.level}</TableCell>
                        <TableCell>{level.rate}</TableCell>
                        <TableCell>{level.earnings}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-12">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-dark-900 mb-4 text-center font-heading">Genealogy Network Visualization</h3>
            <img 
              src="https://images.unsplash.com/photo-1633613286848-e6f43bbafb8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600" 
              alt="Genealogy tree visualization" 
              className="w-full max-h-96 object-contain"
            />
            <p className="mt-4 text-dark-500 text-center">
              Track your network's growth with our interactive genealogy tree. See your direct referrals and their subsequent layers in real-time.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
