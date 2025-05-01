
import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    // In a real app, you'd call an API here
    toast.success("Thank you for subscribing to our newsletter!");
    setEmail("");
  };

  return (
    <section className="py-12 bg-brand-blue text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Subscribe to our newsletter</h2>
          <p className="text-white/80 mb-6">
            Subscribe to our newsletter and get 10% off your first purchase
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 h-12 px-4 rounded-md text-brand-dark focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              type="submit"
              className="h-12 px-6 bg-brand-orange text-white font-medium rounded-md inline-flex items-center justify-center hover:bg-opacity-90 transition-colors"
            >
              Subscribe
              <Send className="ml-2 h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
