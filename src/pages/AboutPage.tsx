import { Award, Globe, Heart, Shield, Users, Zap } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { label: 'Countries Served', value: '120+' },
    { label: 'Daily Flights', value: '500+' },
    { label: 'Happy Customers', value: '10M+' },
    { label: 'Years of Service', value: '25+' },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Your safety is our top priority. We maintain the highest safety standards and employ experienced crew members.',
    },
    {
      icon: Heart,
      title: 'Customer Care',
      description: 'We go above and beyond to ensure your journey is comfortable, enjoyable, and stress-free.',
    },
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Connect to over 120 countries worldwide with our extensive route network and partnerships.',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Cutting-edge technology and modern aircraft fleet for efficient and comfortable travel.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Award-winning service recognized globally for quality, reliability, and customer satisfaction.',
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Dedicated professionals committed to making your travel experience exceptional.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="relative h-[500px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">About SkyWings</h1>
          <p className="text-xl text-gray-200 max-w-2xl">
            Connecting people and places across the globe with excellence, safety, and care since 1999
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center">
              <p className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</p>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              Founded in 1999, SkyWings Airlines has grown from a small regional carrier to one of the world's most trusted airlines. Our journey began with a simple mission: to make air travel accessible, comfortable, and safe for everyone.
            </p>
            <p>
              Over the past 25 years, we've expanded our operations to serve more than 120 countries, operating over 500 daily flights with a modern fleet of aircraft. We've carried millions of passengers to their destinations, creating countless memories and connections along the way.
            </p>
            <p>
              Today, SkyWings stands as a symbol of excellence in aviation, recognized globally for our commitment to safety, innovation, and customer satisfaction. Our team of dedicated professionals works tirelessly to ensure that every flight meets the highest standards of quality and service.
            </p>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow"
                >
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="relative h-[400px] bg-cover bg-center rounded-2xl overflow-hidden shadow-xl"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.pexels.com/photos/933964/pexels-photo-933964.jpeg)',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Join Us on Your Next Journey
              </h2>
              <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                Experience the SkyWings difference and discover why millions of travelers choose us for their journeys
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
