import { useState } from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ContactInfo {
  email: string;
  phone: string;
  chatAvailable: boolean;
}

interface ContactFormValues {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactUs() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo: ContactInfo = {
    email: 'info@prosperitygroups.io',
    phone: '',
    chatAvailable: true
  };

  const [formValues, setFormValues] = useState<ContactFormValues>({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiRequest('POST', '/api/contact', formValues);
      const data = await response.json();

      toast({
        title: 'Message Sent',
        description: 'Your message has been sent successfully. We will get back to you soon.',
      });

      // Reset form
      setFormValues({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'There was an error sending your message. Please try again later.',
        variant: 'destructive',
      });
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-dark-900 sm:text-4xl font-heading">
            Contact Us
          </h2>
          <p className="mt-3 text-xl text-dark-500">
            Have questions? We're here to help. Reach out to our team.
          </p>
        </div>

        <div className="mt-12 max-w-lg mx-auto lg:max-w-none">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary-800">
                    <Mail className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-3 text-lg font-medium text-dark-900 font-heading">Email</h3>
                <p className="mt-2 text-dark-500">
                  {contactInfo.email}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex justify-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary-800">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mt-3 text-lg font-medium text-dark-900 font-heading">Live Chat</h3>
                <p className="mt-2 text-dark-500">
                  Available 24/7 through the dashboard
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-12">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-dark-700">First name</label>
                    <div className="mt-1">
                      <Input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={formValues.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-dark-700">Last name</label>
                    <div className="mt-1">
                      <Input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={formValues.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-dark-700">Email</label>
                    <div className="mt-1">
                      <Input
                        type="email"
                        name="email"
                        id="email"
                        value={formValues.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-dark-700">Subject</label>
                    <div className="mt-1">
                      <Input
                        type="text"
                        name="subject"
                        id="subject"
                        value={formValues.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="block text-sm font-medium text-dark-700">Message</label>
                    <div className="mt-1">
                      <Textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formValues.message}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
