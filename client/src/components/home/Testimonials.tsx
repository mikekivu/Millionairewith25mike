import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  rating: number;
  content: string;
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Financial Analyst",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      rating: 5,
      content: "I've been with RichLance for 8 months now and have already built a network of 47 people. The passive income has allowed me to quit my 9-5 job."
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Entrepreneur",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      rating: 4.5,
      content: "The platform is incredibly user-friendly, and the returns have been consistently above my expectations. My genealogy tree keeps growing every week."
    },
    {
      id: 3,
      name: "Priya Patel",
      role: "Marketing Director",
      image: "https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
      rating: 5,
      content: "The support team is exceptional, and I love how transparent the entire system is. I can track my investments and referral earnings in real-time."
    }
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="fill-gold-500 text-gold-500" />);
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half-star" className="relative">
          <Star className="text-gold-300" />
          <Star className="absolute top-0 left-0 w-1/2 overflow-hidden fill-gold-500 text-gold-500" />
        </span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="text-gold-300" />);
    }

    return stars;
  };

  return (
    <section id="testimonials" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl font-heading">
            Success Stories
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-dark-500 sm:mt-4">
            Hear what our members have to say about their experience.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3 md:grid-cols-2">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img 
                      className="h-12 w-12 rounded-full" 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                    />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-bold text-dark-900">{testimonial.name}</h4>
                    <div className="flex text-gold-500">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-dark-500">
                  {testimonial.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
