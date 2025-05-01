import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact = () => {
  const { user } = useAuth();
  const [form, setForm] = useState<ContactForm>({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          user_id: user?.id,
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          status: 'pending'
        });

      if (error) throw error;

      setSubmitted(true);
      setForm({
        name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        subject: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />
      
      <div className="container mx-auto px-4 py-12 flex-grow">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Have a question or need assistance? Fill out the form and we'll get back to you as soon as possible.
                </p>
                
                {submitted ? (
                  <div className="text-green-600">
                    Thank you for your message! We'll get back to you soon.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={form.subject}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={form.message}
                        onChange={handleInputChange}
                        required
                        className="min-h-[150px]"
                      />
                    </div>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">MC STORE</h3>
                  <p className="text-gray-600 mb-4">
                    Your one-stop shop for all your tech needs. Quality products, competitive prices, and excellent customer service.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold">Social Media</h3>
                  <div className="flex space-x-4 mt-2">
                    <a href="#" className="text-gray-500 hover:text-brand-orange">
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-gray-500 hover:text-brand-orange">
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-gray-500 hover:text-brand-orange">
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-gray-500 hover:text-brand-orange">
                      <Youtube className="h-5 w-5" />
                    </a>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-gray-600">support@mcstore.com</p>
                </div>
                
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-gray-600">+213 555 123 456</p>
                </div>
                
                <div>
                  <h3 className="font-semibold">Business Hours</h3>
                  <p className="text-gray-600">
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday: 10:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold">Payment Methods</h3>
                  <div className="mt-2">
                    <div className="bg-white p-2 rounded-lg border inline-block">
                      <img
                        src="/assets/images/edahabia-logo.png"
                        alt="Edhahabia"
                        className="h-6"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact; 