import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';

interface ContactPageProps {
  onNavigate: (page: string) => void;
}

export default function ContactPage({ onNavigate }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSubmitted(true);
    setLoading(false);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const contactMethods = [
    {
      icon: Phone,
      title: 'Phone',
      value: '+1 (555) 123-4567',
      description: '24/7 Customer Support',
      color: '#10b981',
    },
    {
      icon: Mail,
      title: 'Email',
      value: 'support@skywings.com',
      description: "We'll respond within 24 hours",
      color: '#3b82f6',
    },
    {
      icon: MapPin,
      title: 'Office',
      value: '123 Aviation Blvd, Sky City',
      description: 'Visit us Mon-Fri, 9AM-6PM',
      color: '#8b5cf6',
    },
  ];

  const faqs = [
    {
      question: 'How can I change my booking?',
      answer: 'You can modify your booking through the "My Bookings" page or contact our support team.',
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'Cancellations made 24 hours before departure receive a full refund. Later cancellations may incur fees.',
    },
    {
      question: 'Do you offer group bookings?',
      answer: 'Yes! Contact our group travel desk for bookings of 10 or more passengers.',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <div className="relative py-20 mb-16" style={{ background: 'var(--color-bg-soft)' }}>
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(99, 102, 241, 0.08)', color: 'var(--color-primary)' }}>
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">We're Here to Help</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6" style={{ color: 'var(--color-text)' }}>
              Get in Touch
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-3)' }}>
              Have questions? We're here 24/7 to assist you with your travel needs.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Methods */}
          {contactMethods.map((method, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6 text-center"
              style={{ background: 'var(--color-bg-soft)' }}
            >
              <div
                className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: `${method.color}15` }}
              >
                <method.icon className="w-6 h-6" style={{ color: method.color }} />
              </div>
              <h3 className="text-lg font-bold font-display mb-2" style={{ color: 'var(--color-text)' }}>
                {method.title}
              </h3>
              <p className="font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
                {method.value}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-4)' }}>
                {method.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold font-display mb-6" style={{ color: 'var(--color-text)' }}>
              Send Us a Message
            </h2>
            
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card p-8 text-center"
                style={{ background: 'var(--color-bg-soft)' }}
              >
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                  <CheckCircle className="w-8 h-8" style={{ color: '#10b981' }} />
                </div>
                <h3 className="text-xl font-bold font-display mb-2" style={{ color: 'var(--color-text)' }}>
                  Message Sent!
                </h3>
                <p style={{ color: 'var(--color-text-3)' }}>
                  Thank you for contacting us. We'll get back to you shortly.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="card p-6" style={{ background: 'var(--color-bg-soft)' }}>
                <div className="space-y-4">
                  <Input
                    label="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                  <Input
                    type="email"
                    label="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                  />
                  <Input
                    label="Subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="How can we help?"
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                      Message
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      required
                      className="w-full px-4 py-3 rounded-lg text-sm transition-all resize-none"
                      style={{
                        background: 'var(--color-surface)',
                        color: 'var(--color-text)',
                        border: '1px solid var(--color-border)',
                      }}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6 flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner w-4 h-4" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            )}
          </motion.div>

          {/* FAQs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold font-display mb-6" style={{ color: 'var(--color-text)' }}>
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="card p-5"
                  style={{ background: 'var(--color-bg-soft)' }}
                >
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                    {faq.question}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>

            <div className="card p-6 mt-6" style={{ background: 'var(--color-bg-soft)', borderLeft: '4px solid var(--color-primary)' }}>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
                    Customer Support Hours
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-3)' }}>
                    Our team is available 24/7 to assist you with urgent matters. For general inquiries, we typically respond within 2-4 hours during business hours.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-3)' }}>
            Looking for something else?
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" onClick={() => onNavigate('my-bookings')}>
              My Bookings
            </Button>
            <Button variant="outline" onClick={() => onNavigate('flight-status')}>
              Flight Status
            </Button>
            <Button variant="outline" onClick={() => onNavigate('search')}>
              Book a Flight
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
