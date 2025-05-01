import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const About = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />
      
      <div className="container mx-auto px-4 py-12 flex-grow">
        <h1 className="text-3xl font-bold mb-6">About Us</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Our Project</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Welcome to MC STORE - a mini project developed for the Web Development Module in 2025. This e-commerce 
                platform demonstrates our skills in modern web development, including responsive design, user authentication, 
                database integration, and more.
              </p>
              <p>
                Our goal was to create a fully functional online shopping experience that showcases the practical 
                application of web development concepts learned throughout the course.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technologies Used</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Frontend</h3>
                <p>
                  Built with React, TypeScript, and Tailwind CSS to create a responsive and 
                  intuitive user interface that works across all devices.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Backend</h3>
                <p>
                  Powered by Supabase for authentication, database management, and storage,
                  providing a scalable and secure foundation.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Tools & Frameworks</h3>
                <p>
                  Leveraging modern tools like Vite for fast development, Radix UI for 
                  accessible components, and React Router for navigation.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Team</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden">
                  <img 
                    src="/assets/images/team/benhadjer-mohamed.jpg" 
                    alt="Benhadjer Mohamed"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <h3 className="font-semibold">Benhadjer Mohamed</h3>
                <p className="text-gray-600">Full Stack Developer</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden">
                  <img 
                    src="/assets/images/team/bouziani-alaa.jpg" 
                    alt="Bouziani Alaa Eddine"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <h3 className="font-semibold">Bouziani Alaa Eddine</h3>
                <p className="text-gray-600">Frontend Developer</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden">
                  <img 
                    src="/assets/images/team/hachelaf-abdelbasset.jpg" 
                    alt="Hachelaf Abdelbasset"
                    className="w-full h-full object-cover" 
                  />
                </div>
                <h3 className="font-semibold">Hachelaf Abdelbasset</h3>
                <p className="text-gray-600">UI/UX Designer</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Features</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Our e-commerce platform includes:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>User authentication and profile management</li>
                <li>Product browsing and searching</li>
                <li>Shopping cart functionality</li>
                <li>Checkout process with Edahabia payment integration</li>
                <li>Order tracking and history</li>
                <li>Responsive design for all devices</li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Academic Context</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                This project was developed as part of the Web Development Module for the academic year 2025. 
                It represents our understanding and application of web development principles and best practices 
                taught throughout the course. We'd like to thank our instructors and mentors for their guidance 
                and support throughout this learning journey.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About; 