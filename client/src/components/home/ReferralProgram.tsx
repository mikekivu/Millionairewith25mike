import { Users, Coins, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ReferralProgram() {
  return (
    <section id="referral" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl font-heading">
            Simple Referral Program
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-dark-500 sm:mt-4">
            Refer friends and earn $20 for every successful referral.
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
                      <Share2 className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-dark-900">Share Your Link</h4>
                    <p className="mt-1 text-dark-500">Share your unique referral link with friends and family.</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-700 text-white">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-dark-900">Friend Joins & Invests</h4>
                    <p className="mt-1 text-dark-500">Your friend registers using your link and makes their first investment.</p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-700 text-white">
                      <Coins className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-dark-900">You Earn $20</h4>
                    <p className="mt-1 text-dark-500">Receive $20 directly in your account for each successful referral.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-dark-900 mb-6 font-heading text-center">Referral Rewards</h3>

              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 mb-6">
                <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">$20</div>
                    <div className="text-lg font-medium text-green-800">Referral Commission</div>
                    <div className="text-sm text-green-600 mt-2">Paid instantly to your account</div>
                  </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Minimum referrals:</span>
                  <span className="font-semibold">No minimum</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Maximum referrals:</span>
                  <span className="font-semibold">Unlimited</span>
                </div>
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Payment method:</span>
                  <span className="font-semibold">Account credit</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment timing:</span>
                  <span className="font-semibold">Instant</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button className="w-full">
                  Start Referring Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-dark-900 mb-4">Why Refer Friends?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Coins className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Easy Money</h4>
                  <p className="text-gray-600">Earn $20 for every friend who joins and invests</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Help Friends</h4>
                  <p className="text-gray-600">Share amazing investment opportunities with people you care about</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Share2 className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-2">Simple Process</h4>
                  <p className="text-gray-600">Just share your link and earn when they invest</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}