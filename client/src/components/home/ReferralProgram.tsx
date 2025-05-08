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

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-dark-900 mb-4 text-center font-heading">5-Level Genealogy Tree</h3>
              <div className="relative w-full h-80">
                <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
                  {/* Level 1 - Root */}
                  <g transform="translate(400, 40)">
                    <circle cx="0" cy="0" r="25" fill="#FF9500" />
                    <text x="0" y="5" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">You</text>
                  </g>
                  
                  {/* Level 2 - Direct Referrals */}
                  <g transform="translate(250, 120)">
                    <circle cx="0" cy="0" r="20" fill="#FFA940" />
                    <text x="0" y="5" textAnchor="middle" fill="white" fontSize="12">R1</text>
                    <line x1="0" y1="-20" x2="150" y2="-80" stroke="#FF9500" strokeWidth="2" />
                  </g>
                  <g transform="translate(550, 120)">
                    <circle cx="0" cy="0" r="20" fill="#FFA940" />
                    <text x="0" y="5" textAnchor="middle" fill="white" fontSize="12">R2</text>
                    <line x1="0" y1="-20" x2="-150" y2="-80" stroke="#FF9500" strokeWidth="2" />
                  </g>
                  
                  {/* Level 3 */}
                  <g transform="translate(175, 200)">
                    <circle cx="0" cy="0" r="15" fill="#FFBD5C" />
                    <text x="0" y="4" textAnchor="middle" fill="white" fontSize="10">R3</text>
                    <line x1="0" y1="-15" x2="75" y2="-80" stroke="#FFA940" strokeWidth="1.5" />
                  </g>
                  <g transform="translate(325, 200)">
                    <circle cx="0" cy="0" r="15" fill="#FFBD5C" />
                    <text x="0" y="4" textAnchor="middle" fill="white" fontSize="10">R4</text>
                    <line x1="0" y1="-15" x2="-75" y2="-80" stroke="#FFA940" strokeWidth="1.5" />
                  </g>
                  <g transform="translate(475, 200)">
                    <circle cx="0" cy="0" r="15" fill="#FFBD5C" />
                    <text x="0" y="4" textAnchor="middle" fill="white" fontSize="10">R5</text>
                    <line x1="0" y1="-15" x2="75" y2="-80" stroke="#FFA940" strokeWidth="1.5" />
                  </g>
                  <g transform="translate(625, 200)">
                    <circle cx="0" cy="0" r="15" fill="#FFBD5C" />
                    <text x="0" y="4" textAnchor="middle" fill="white" fontSize="10">R6</text>
                    <line x1="0" y1="-15" x2="-75" y2="-80" stroke="#FFA940" strokeWidth="1.5" />
                  </g>
                  
                  {/* Level 4 (just showing a few for clarity) */}
                  <g transform="translate(150, 260)">
                    <circle cx="0" cy="0" r="10" fill="#FFCE80" />
                    <line x1="0" y1="-10" x2="25" y2="-50" stroke="#FFBD5C" strokeWidth="1" />
                  </g>
                  <g transform="translate(200, 260)">
                    <circle cx="0" cy="0" r="10" fill="#FFCE80" />
                    <line x1="0" y1="-10" x2="-25" y2="-50" stroke="#FFBD5C" strokeWidth="1" />
                  </g>
                  <g transform="translate(600, 260)">
                    <circle cx="0" cy="0" r="10" fill="#FFCE80" />
                    <line x1="0" y1="-10" x2="25" y2="-50" stroke="#FFBD5C" strokeWidth="1" />
                  </g>
                  <g transform="translate(650, 260)">
                    <circle cx="0" cy="0" r="10" fill="#FFCE80" />
                    <line x1="0" y1="-10" x2="-25" y2="-50" stroke="#FFBD5C" strokeWidth="1" />
                  </g>
                  
                  {/* Level 5 (minimal representation) */}
                  <g transform="translate(130, 320)">
                    <circle cx="0" cy="0" r="6" fill="#FFDEA0" />
                    <line x1="0" y1="-6" x2="20" y2="-54" stroke="#FFCE80" strokeWidth="0.75" />
                  </g>
                  <g transform="translate(170, 320)">
                    <circle cx="0" cy="0" r="6" fill="#FFDEA0" />
                    <line x1="0" y1="-6" x2="-20" y2="-54" stroke="#FFCE80" strokeWidth="0.75" />
                  </g>
                  <g transform="translate(630, 320)">
                    <circle cx="0" cy="0" r="6" fill="#FFDEA0" />
                    <line x1="0" y1="-6" x2="20" y2="-54" stroke="#FFCE80" strokeWidth="0.75" />
                  </g>
                  <g transform="translate(670, 320)">
                    <circle cx="0" cy="0" r="6" fill="#FFDEA0" />
                    <line x1="0" y1="-6" x2="-20" y2="-54" stroke="#FFCE80" strokeWidth="0.75" />
                  </g>
                </svg>
              </div>
              <p className="mt-4 text-dark-500 text-center">
                Track your network's growth with our real-time genealogy tree. See 5 levels of your referral network.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-dark-900 mb-4 text-center font-heading">Referral Profit Analytics</h3>
              <div className="w-full h-80">
                <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
                  {/* Chart background */}
                  <rect x="80" y="40" width="640" height="300" fill="#f8f9fa" stroke="#e9ecef" strokeWidth="1" />
                  
                  {/* Y-axis */}
                  <line x1="80" y1="40" x2="80" y2="340" stroke="#6c757d" strokeWidth="1" />
                  
                  {/* Y-axis labels */}
                  <text x="75" y="340" textAnchor="end" fill="#6c757d" fontSize="12">0%</text>
                  <text x="75" y="265" textAnchor="end" fill="#6c757d" fontSize="12">25%</text>
                  <text x="75" y="190" textAnchor="end" fill="#6c757d" fontSize="12">50%</text>
                  <text x="75" y="115" textAnchor="end" fill="#6c757d" fontSize="12">75%</text>
                  <text x="75" y="40" textAnchor="end" fill="#6c757d" fontSize="12">100%</text>
                  
                  {/* X-axis */}
                  <line x1="80" y1="340" x2="720" y2="340" stroke="#6c757d" strokeWidth="1" />
                  
                  {/* X-axis labels */}
                  <text x="160" y="355" textAnchor="middle" fill="#6c757d" fontSize="12">Level 1</text>
                  <text x="280" y="355" textAnchor="middle" fill="#6c757d" fontSize="12">Level 2</text>
                  <text x="400" y="355" textAnchor="middle" fill="#6c757d" fontSize="12">Level 3</text>
                  <text x="520" y="355" textAnchor="middle" fill="#6c757d" fontSize="12">Level 4</text>
                  <text x="640" y="355" textAnchor="middle" fill="#6c757d" fontSize="12">Level 5</text>
                  
                  {/* Bars */}
                  <rect x="120" y="40" width="80" height="300" fill="url(#grad1)" opacity="0.8" />
                  <rect x="240" y="155" width="80" height="185" fill="url(#grad1)" opacity="0.8" />
                  <rect x="360" y="215" width="80" height="125" fill="url(#grad1)" opacity="0.8" />
                  <rect x="480" y="250" width="80" height="90" fill="url(#grad1)" opacity="0.8" />
                  <rect x="600" y="295" width="80" height="45" fill="url(#grad1)" opacity="0.8" />
                  
                  {/* Percentage labels */}
                  <text x="160" y="30" textAnchor="middle" fill="#6c757d" fontSize="12" fontWeight="bold">10%</text>
                  <text x="280" y="145" textAnchor="middle" fill="#6c757d" fontSize="12" fontWeight="bold">5%</text>
                  <text x="400" y="205" textAnchor="middle" fill="#6c757d" fontSize="12" fontWeight="bold">3%</text>
                  <text x="520" y="240" textAnchor="middle" fill="#6c757d" fontSize="12" fontWeight="bold">2%</text>
                  <text x="640" y="285" textAnchor="middle" fill="#6c757d" fontSize="12" fontWeight="bold">1%</text>
                  
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FF9500" stopOpacity="1" />
                      <stop offset="100%" stopColor="#FFBD5C" stopOpacity="1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <p className="mt-4 text-dark-500 text-center">
                Visualize your earnings potential from each level of your referral network. Higher commission rates for direct referrals.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
