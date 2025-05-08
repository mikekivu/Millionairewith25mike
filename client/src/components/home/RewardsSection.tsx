import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Tablet, Heart, Palmtree, ChevronRight } from "lucide-react";
import { Link } from "wouter";

const RewardsSection: React.FC = () => {
  const categories = [
    {
      id: "electronics",
      name: "Electronics",
      icon: <Gift className="h-5 w-5" />,
      items: [
        {
          title: "iPhone 14 Pro",
          description: "Earn this premium smartphone when you reach $15,000 in team investments",
          image: "https://images.unsplash.com/photo-1678685382135-89eb8a1db28a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aXBob25lJTIwMTQlMjBwcm98ZW58MHx8MHx8fDA%3D",
          level: "Gold Level",
          condition: "$15,000 Team Volume"
        },
        {
          title: "MacBook Pro",
          description: "Premium laptop reward for reaching $50,000 in total team investment volume",
          image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWFjYm9vayUyMHByb3xlbnwwfHwwfHx8MA%3D%3D",
          level: "Platinum Level",
          condition: "$50,000 Team Volume"
        },
        {
          title: "Smart TV",
          description: "Enjoy this 65\" 4K smart TV when your team investments total $25,000",
          image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8c21hcnQlMjB0dnxlbnwwfHwwfHx8MA%3D%3D",
          level: "Diamond Level",
          condition: "$25,000 Team Volume"
        }
      ]
    },
    {
      id: "tablets",
      name: "Tablets",
      icon: <Tablet className="h-5 w-5" />,
      items: [
        {
          title: "iPad Pro",
          description: "Premium tablet with M2 chip for creative professionals in your network",
          image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8aXBhZHxlbnwwfHwwfHx8MA%3D%3D",
          level: "Silver Level",
          condition: "$10,000 Team Volume"
        },
        {
          title: "Samsung Galaxy Tab S9",
          description: "High-performance Android tablet with S Pen included",
          image: "https://images.unsplash.com/photo-1589739900266-4853e720104f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGFibGV0fGVufDB8fDB8fHww",
          level: "Gold Level",
          condition: "$15,000 Team Volume"
        },
        {
          title: "Microsoft Surface Pro",
          description: "Versatile 2-in-1 tablet/laptop for business professionals",
          image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c3VyZmFjZSUyMHByb3xlbnwwfHwwfHx8MA%3D%3D",
          level: "Platinum Level",
          condition: "$20,000 Team Volume"
        }
      ]
    },
    {
      id: "health",
      name: "Health Products",
      icon: <Heart className="h-5 w-5" />,
      items: [
        {
          title: "Premium Fitness Watch",
          description: "Advanced health monitoring and workout tracking capabilities",
          image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c21hcnQlMjB3YXRjaHxlbnwwfHwwfHx8MA%3D%3D",
          level: "Bronze Level",
          condition: "$5,000 Team Volume"
        },
        {
          title: "Home Gym Equipment",
          description: "Complete home gym setup with premium equipment",
          image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aG9tZSUyMGd5bXxlbnwwfHwwfHx8MA%3D%3D",
          level: "Gold Level",
          condition: "$15,000 Team Volume"
        },
        {
          title: "Massage Chair",
          description: "Luxury full-body massage chair for ultimate relaxation",
          image: "https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFzc2FnZSUyMGNoYWlyfGVufDB8fDB8fHww",
          level: "Diamond Level",
          condition: "$25,000 Team Volume"
        }
      ]
    },
    {
      id: "vacation",
      name: "Holiday Treatments",
      icon: <Palmtree className="h-5 w-5" />,
      items: [
        {
          title: "Luxury Spa Retreat",
          description: "3-day premium spa treatment at a 5-star resort",
          image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c3BhfGVufDB8fDB8fHww",
          level: "Silver Level",
          condition: "$10,000 Team Volume"
        },
        {
          title: "Beach Vacation Package",
          description: "7-day all-inclusive vacation to a tropical paradise",
          image: "https://images.unsplash.com/photo-1520483601560-389dff434fdf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhY2glMjB2YWNhdGlvbnxlbnwwfHwwfHx8MA%3D%3D",
          level: "Platinum Level",
          condition: "$30,000 Team Volume"
        },
        {
          title: "European Luxury Tour",
          description: "10-day guided tour of Europe's most exclusive destinations",
          image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFyaXN8ZW58MHx8MHx8fDA%3D",
          level: "Diamond Elite Level",
          condition: "$50,000 Team Volume"
        }
      ]
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-white to-gray-50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600">
            Exclusive Rewards Program
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Our members enjoy exclusive rewards as they build their networks. From premium electronics to luxury vacations, 
            discover the benefits of growing your team.
          </p>
        </div>

        <Tabs defaultValue={categories[0].id} className="w-full">
          <TabsList className="flex flex-wrap justify-center mb-8 bg-transparent">
            {categories.map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
              >
                {category.icon}
                <span className="ml-2">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent 
              key={category.id} 
              value={category.id}
              className="transition-all duration-500 ease-in-out"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((item, i) => (
                  <Card key={i} className="overflow-hidden transition-all hover:shadow-lg border-gray-200">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105" 
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          {item.level}
                        </span>
                      </div>
                      <CardDescription className="text-gray-600">{item.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center text-sm font-medium text-yellow-600 mb-2">
                        <Gift className="h-4 w-4 mr-1" />
                        <span>{item.condition}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t bg-gray-50 pt-3 pb-3">
                      <Button asChild variant="link" className="text-orange-600 hover:text-orange-700 p-0">
                        <Link to="/register">
                          Get started <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default RewardsSection;