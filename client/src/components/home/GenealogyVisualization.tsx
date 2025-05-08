import React from 'react';
import { Network, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Sample data for genealogy tree visualization (static for home page)
const sampleTreeData = {
  id: 1,
  name: "You",
  level: 0,
  isActive: true,
  children: [
    {
      id: 2,
      name: "Sarah J.",
      level: 1,
      isActive: true,
      children: [
        {
          id: 5,
          name: "Michael L.",
          level: 2,
          isActive: true,
          children: [
            {
              id: 11,
              name: "Anna W.",
              level: 3,
              isActive: true,
              children: [
                {
                  id: 21,
                  name: "Tomas R.",
                  level: 4,
                  isActive: true,
                  children: [
                    {
                      id: 31,
                      name: "Dana H.",
                      level: 5,
                      isActive: true
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 6,
          name: "Jessica K.",
          level: 2,
          isActive: true
        }
      ]
    },
    {
      id: 3,
      name: "Robert T.",
      level: 1,
      isActive: true,
      children: [
        {
          id: 7,
          name: "David M.",
          level: 2,
          isActive: true,
          children: [
            {
              id: 12,
              name: "Lisa P.",
              level: 3,
              isActive: true
            }
          ]
        }
      ]
    },
    {
      id: 4,
      name: "Patricia N.",
      level: 1,
      isActive: true,
      children: [
        {
          id: 8,
          name: "Chris S.",
          level: 2,
          isActive: true
        },
        {
          id: 9,
          name: "Emily W.",
          level: 2,
          isActive: true
        },
        {
          id: 10,
          name: "Daniel F.",
          level: 2,
          isActive: true
        }
      ]
    }
  ]
};

export default function GenealogyVisualization() {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold sm:text-4xl font-heading">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-yellow-500">
              Network Visualization
            </span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            See how your network grows through 5 levels of referrals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Network className="h-6 w-6 text-orange-500 mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">Genealogy Tree</h3>
                </div>
                <div className="text-sm text-gray-600">5 Levels Deep</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 overflow-hidden relative">
                <div className="w-full h-[400px] overflow-auto">
                  <div className="flex flex-col items-center relative">
                    <svg width="800" height="500" className="overflow-visible">
                      {/* Root Node (You) */}
                      <g transform="translate(400, 50)">
                        <circle r="25" fill="#f97316" stroke="#fff" strokeWidth="2" />
                        <text y="5" textAnchor="middle" fill="white" fontWeight="bold">You</text>
                        <text y="35" textAnchor="middle" fontSize="12">Root</text>
                      </g>
                      
                      {/* Level 1 Nodes */}
                      <g transform="translate(250, 150)">
                        <circle r="20" fill="#f97316" stroke="#fff" strokeWidth="2" />
                        <text y="5" textAnchor="middle" fill="white" fontWeight="bold">S.J</text>
                        <text y="35" textAnchor="middle" fontSize="12">Level 1</text>
                        <path d="M 0,-20 L 150,-100" stroke="#ccc" fill="none" strokeWidth="2" />
                      </g>
                      <g transform="translate(400, 150)">
                        <circle r="20" fill="#f97316" stroke="#fff" strokeWidth="2" />
                        <text y="5" textAnchor="middle" fill="white" fontWeight="bold">R.T</text>
                        <text y="35" textAnchor="middle" fontSize="12">Level 1</text>
                        <path d="M 0,-20 L 0,-80" stroke="#ccc" fill="none" strokeWidth="2" />
                      </g>
                      <g transform="translate(550, 150)">
                        <circle r="20" fill="#f97316" stroke="#fff" strokeWidth="2" />
                        <text y="5" textAnchor="middle" fill="white" fontWeight="bold">P.N</text>
                        <text y="35" textAnchor="middle" fontSize="12">Level 1</text>
                        <path d="M 0,-20 L -150,-100" stroke="#ccc" fill="none" strokeWidth="2" />
                      </g>
                      
                      {/* Level 2 Nodes */}
                      <g transform="translate(200, 250)">
                        <circle r="18" fill="#ef4444" stroke="#fff" strokeWidth="2" />
                        <text y="5" textAnchor="middle" fill="white" fontWeight="bold">M.L</text>
                        <text y="30" textAnchor="middle" fontSize="11">Level 2</text>
                        <path d="M 0,-18 L 50,-100" stroke="#ccc" fill="none" strokeWidth="2" />
                      </g>
                      <g transform="translate(300, 250)">
                        <circle r="18" fill="#ef4444" stroke="#fff" strokeWidth="2" />
                        <text y="5" textAnchor="middle" fill="white" fontWeight="bold">J.K</text>
                        <text y="30" textAnchor="middle" fontSize="11">Level 2</text>
                        <path d="M 0,-18 L -50,-100" stroke="#ccc" fill="none" strokeWidth="2" />
                      </g>
                      <g transform="translate(400, 250)">
                        <circle r="18" fill="#ef4444" stroke="#fff" strokeWidth="2" />
                        <text y="5" textAnchor="middle" fill="white" fontWeight="bold">D.M</text>
                        <text y="30" textAnchor="middle" fontSize="11">Level 2</text>
                        <path d="M 0,-18 L 0,-100" stroke="#ccc" fill="none" strokeWidth="2" />
                      </g>
                      <g transform="translate(480, 250)">
                        <circle r="18" fill="#ef4444" stroke="#fff" strokeWidth="2" />
                        <text y="5" textAnchor="middle" fill="white" fontWeight="bold">C.S</text>
                        <text y="30" textAnchor="middle" fontSize="11">Level 2</text>
                        <path d="M 0,-18 L 70,-100" stroke="#ccc" fill="none" strokeWidth="2" />
                      </g>
                      <g transform="translate(550, 250)">
                        <circle r="18" fill="#ef4444" stroke="#fff" strokeWidth="2" />
                        <text y="5" textAnchor="middle" fill="white" fontWeight="bold">E.W</text>
                        <text y="30" textAnchor="middle" fontSize="11">Level 2</text>
                        <path d="M 0,-18 L 0,-100" stroke="#ccc" fill="none" strokeWidth="2" />
                      </g>
                      <g transform="translate(620, 250)">
                        <circle r="18" fill="#ef4444" stroke="#fff" strokeWidth="2" />
                        <text y="5" textAnchor="middle" fill="white" fontWeight="bold">D.F</text>
                        <text y="30" textAnchor="middle" fontSize="11">Level 2</text>
                        <path d="M 0,-18 L -70,-100" stroke="#ccc" fill="none" strokeWidth="2" />
                      </g>
                      
                      {/* Level 3 Nodes */}
                      <g transform="translate(200, 330)">
                        <circle r="15" fill="#dc2626" stroke="#fff" strokeWidth="2" />
                        <text y="4" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">A.W</text>
                        <text y="25" textAnchor="middle" fontSize="9">Level 3</text>
                        <path d="M 0,-15 L 0,-80" stroke="#ccc" fill="none" strokeWidth="2" />
                      </g>
                      <g transform="translate(400, 330)">
                        <circle r="15" fill="#dc2626" stroke="#fff" strokeWidth="2" />
                        <text y="4" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">L.P</text>
                        <text y="25" textAnchor="middle" fontSize="9">Level 3</text>
                        <path d="M 0,-15 L 0,-80" stroke="#ccc" fill="none" strokeWidth="2" />
                      </g>
                      
                      {/* Level 4 Node */}
                      <g transform="translate(200, 400)">
                        <circle r="12" fill="#b91c1c" stroke="#fff" strokeWidth="2" />
                        <text y="3" textAnchor="middle" fill="white" fontWeight="bold" fontSize="8">T.R</text>
                        <text y="20" textAnchor="middle" fontSize="7">Level 4</text>
                        <path d="M 0,-12 L 0,-58" stroke="#ccc" fill="none" strokeWidth="2" />
                      </g>
                      
                      {/* Level 5 Node */}
                      <g transform="translate(200, 450)">
                        <circle r="10" fill="#991b1b" stroke="#fff" strokeWidth="2" />
                        <text y="3" textAnchor="middle" fill="white" fontWeight="bold" fontSize="7">D.H</text>
                        <text y="18" textAnchor="middle" fontSize="6">Level 5</text>
                        <path d="M 0,-10 L 0,-40" stroke="#ccc" fill="none" strokeWidth="2" />
                      </g>
                      
                      {/* $25 Branding */}
                      <text x="20" y="30" fontSize="24" fontWeight="bold" fill="#f97316" transform="rotate(-15, 20, 30)">
                        $25
                      </text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Users className="h-6 w-6 text-orange-500 mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">Referral Levels</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold mr-2">1</div>
                      <span className="text-sm font-medium">Level 1 Referrals</span>
                    </div>
                    <div className="text-sm font-semibold text-orange-600">10% Commission</div>
                  </div>
                  
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold mr-2">2</div>
                      <span className="text-sm font-medium">Level 2 Referrals</span>
                    </div>
                    <div className="text-sm font-semibold text-red-600">5% Commission</div>
                  </div>
                  
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold mr-2">3</div>
                      <span className="text-sm font-medium">Level 3 Referrals</span>
                    </div>
                    <div className="text-sm font-semibold text-red-700">3% Commission</div>
                  </div>
                  
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-red-700 flex items-center justify-center text-white text-xs font-bold mr-2">4</div>
                      <span className="text-sm font-medium">Level 4 Referrals</span>
                    </div>
                    <div className="text-sm font-semibold text-red-800">2% Commission</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 rounded-full bg-red-800 flex items-center justify-center text-white text-xs font-bold mr-2">5</div>
                      <span className="text-sm font-medium">Level 5 Referrals</span>
                    </div>
                    <div className="text-sm font-semibold text-red-900">1% Commission</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Network Benefits</h3>
                
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center text-white text-xs mr-2 mt-0.5">✓</div>
                    <span className="text-sm text-gray-700">Earn passive income from all 5 levels</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center text-white text-xs mr-2 mt-0.5">✓</div>
                    <span className="text-sm text-gray-700">Qualify for special rewards and bonuses</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center text-white text-xs mr-2 mt-0.5">✓</div>
                    <span className="text-sm text-gray-700">Track performance with detailed analytics</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center text-white text-xs mr-2 mt-0.5">✓</div>
                    <span className="text-sm text-gray-700">Advanced tools for recruiting and marketing</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center text-white text-xs mr-2 mt-0.5">✓</div>
                    <span className="text-sm text-gray-700">Unlimited referral potential with no cap</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}