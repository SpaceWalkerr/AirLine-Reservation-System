import { useState, useEffect } from 'react';
import { Plane, Users, Gauge, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Aircraft } from '../types';

export default function AircraftPage() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAircraft();
  }, []);

  const loadAircraft = async () => {
    const { data } = await supabase
      .from('aircraft')
      .select('*')
      .order('manufacturer, model');

    if (data) setAircraft(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Plane className="w-16 h-16 text-blue-600 animate-bounce mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading fleet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="relative h-[400px] bg-cover bg-center flex items-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.pexels.com/photos/46148/aircraft-jet-landing-cloud-46148.jpeg)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Our Fleet</h1>
          <p className="text-xl text-gray-200">
            Experience comfort and luxury with our modern aircraft collection
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {aircraft.map((plane) => (
            <div
              key={plane.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
            >
              <div
                className="h-64 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${plane.image_url})`,
                }}
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{plane.model}</h2>
                    <p className="text-gray-600">{plane.manufacturer}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Plane className="w-6 h-6 text-blue-600" />
                  </div>
                </div>

                <p className="text-gray-700 mb-6">{plane.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-600">Capacity</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{plane.total_seats}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      E: {plane.economy_seats} | B: {plane.business_seats} | F: {plane.first_class_seats}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-600">Speed</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{plane.cruise_speed}</p>
                    <p className="text-xs text-gray-600 mt-1">km/h</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-600">Maximum Range</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {plane.range_km.toLocaleString()} km
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
