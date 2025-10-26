import React, { useState, useEffect } from 'react';
import { AlertCircle, Calendar, MapPin, AlertTriangle, DollarSign, Award } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Property } from '../App';
import { apiService, type Property as ApiProperty } from '../services/api';

type DashboardProps = {
  onSelectProperty: (property: Property) => void;
};

// Additional hardcoded properties to show alongside database properties
const additionalProperties: Property[] = [
  {
    id: '1',
    address: '1425 Oak Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94117',
    tourDate: '2025-10-28',
    issueCount: 8,
    criticalIssues: 2,
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3VzZSUyMGV4dGVyaW9yfGVufDF8fHx8MTc2MTM1NjIyNXww&ixlib=rb-4.1.0&q=80&w=1080',
    grade: 'C+',
    estimatedPrice: 1250000,
    listPrice: 1250000,
    ourEstimate: 1214000,
  },
  {
    id: '2',
    address: '892 Maple Avenue',
    city: 'Berkeley',
    state: 'CA',
    zipCode: '94704',
    tourDate: '2025-10-30',
    issueCount: 5,
    criticalIssues: 1,
    imageUrl: 'https://images.unsplash.com/photo-1760229090663-fe14715d4efe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWJ1cmJhbiUyMGhvbWUlMjBmYWNhZGV8ZW58MXx8fHwxNzYxMzcyMDk5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    grade: 'B',
    estimatedPrice: 895000,
    listPrice: 895000,
    ourEstimate: 881000,
  },
  {
    id: '3',
    address: '2156 Pine Ridge Drive',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94611',
    tourDate: '2025-11-02',
    issueCount: 12,
    criticalIssues: 4,
    imageUrl: 'https://images.unsplash.com/photo-1717245233537-1b51136c35ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXNpZGVudGlhbCUyMGhvdXNlJTIwZnJvbnR8ZW58MXx8fHwxNzYxMzcyMTAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    grade: 'D',
    estimatedPrice: 675000,
    listPrice: 675000,
    ourEstimate: 625000,
  },
];

export function Dashboard({ onSelectProperty }: DashboardProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        console.log('🚀 Starting to fetch properties...');
        
        // Test direct fetch first
        console.log('🔍 Testing direct fetch to http://localhost:8000/api/properties/');
        const directResponse = await fetch('http://localhost:8000/api/properties/');
        console.log('📡 Direct fetch response status:', directResponse.status);
        const directData = await directResponse.json();
        console.log('📊 Direct fetch data:', directData);
        
        // Now try the API service
        console.log('🔧 Using API service...');
        const response = await apiService.getProperties();
        console.log('📋 API service response:', response);
        console.log('📋 API service success:', response.success);
        console.log('📋 API service data:', response.data);
        console.log('📋 API service data length:', response.data?.length);
        
        if (response.success && response.data && response.data.length > 0) {
          console.log('✅ Found database properties:', response.data);
          const databaseProperties: Property[] = response.data.map(apiProp => ({
            id: apiProp.id,
            address: apiProp.address,
            city: apiProp.city,
            state: apiProp.state,
            zipCode: apiProp.zipCode,
            tourDate: apiProp.tourDate || new Date().toISOString().split('T')[0],
            issueCount: apiProp.issueCount || 0,
            criticalIssues: apiProp.criticalIssues || 0,
                imageUrl: apiProp.imageUrl ? 
                  (apiProp.imageUrl.startsWith('/ml_training/') ? 
                    `http://localhost:8000${apiProp.imageUrl}` : 
                    `http://localhost:8000${apiProp.imageUrl}`) : 
                  'https://images.unsplash.com/photo-1560170412-0f7df0eb0fb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBob21lJTIwZXh0ZXJpb3J8ZW58MXx8fHwxNzYxMzE3NDM0fDA&ixlib=rb-4.1.0&q=80&w=1080',
            grade: apiProp.grade || 'B+',
            estimatedPrice: apiProp.estimatedPrice || 0,
            listPrice: apiProp.listPrice || 0,
            ourEstimate: apiProp.ourEstimate || 0,
          }));
          
          console.log('🎯 Setting properties:', databaseProperties);
          // Combine database properties with additional hardcoded properties
          setProperties([...databaseProperties, ...additionalProperties]);
        } else {
          console.log('❌ No database properties found, showing additional properties only');
          setProperties(additionalProperties);
        }
      } catch (err) {
        console.error('💥 Error fetching database properties:', err);
        setError('Failed to load properties from database');
        setProperties(additionalProperties);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h3 className="text-gray-900 mb-2">Error Loading Properties</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-600 text-white';
    if (grade.startsWith('B')) return 'bg-blue-600 text-white';
    if (grade.startsWith('C')) return 'bg-yellow-600 text-white';
    if (grade.startsWith('D')) return 'bg-orange-600 text-white';
    return 'bg-red-600 text-white';
  };

  const getSeverityColor = (critical: number, total: number) => {
    const ratio = total > 0 ? critical / total : 0;
    if (ratio > 0.3) return 'text-red-600 bg-red-50 border-red-200';
    if (ratio > 0.15) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getSeverityIcon = (critical: number, total: number) => {
    const ratio = total > 0 ? critical / total : 0;
    if (ratio > 0.3) return <AlertTriangle className="w-4 h-4" />;
    if (ratio > 0.15) return <AlertCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-blue-50/30 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-red-600 text-2xl">🏠</div>
              <div>
                <h1 className="text-gray-900 text-2xl">Real(i)ty.AI</h1>
                <p className="text-gray-600">Property Inspection Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Report Ready ✓
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white cursor-pointer hover:shadow-lg transition-shadow">
                JD
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-gray-900 mb-2 text-xl">Your Property Tours</h2>
          <p className="text-gray-600">Click on any property to view detailed inspection results</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {properties.map((property) => (
            <Card
              key={property.id}
              className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-250 cursor-pointer border-2 hover:border-blue-900 hover:-translate-y-1 relative h-72"
              style={{ transition: 'all 0.25s ease', transform: 'translateY(0)' }}
              onClick={() => onSelectProperty(property)}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <ImageWithFallback
                  src={property.imageUrl}
                  alt={property.address}
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
              </div>

              {/* Content Overlay */}
              <div className="relative h-full flex flex-col justify-between p-6">
                {/* Top Section */}
                <div className="flex items-start justify-between">
                  <Badge className={`${getGradeColor(property.grade)} shadow-lg text-base px-3 py-1`}>
                    <Award className="w-4 h-4 mr-1" />
                    Grade {property.grade}
                  </Badge>
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                    <div className="text-gray-500 text-xs mb-0.5">List Price</div>
                    <div className="text-gray-900 flex items-center gap-0.5">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span className="text-sm">{formatPrice(property.listPrice)}</span>
                    </div>
                    <div className="text-blue-900 flex items-center gap-0.5 mt-1">
                      <span className="text-xs">Our Estimate:</span>
                      <span className="text-sm">{formatPrice(property.ourEstimate)}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-white text-xl mb-1 drop-shadow-lg">{property.address}</h3>
                    <div className="flex items-center gap-1 text-white/90 drop-shadow-lg">
                      <MapPin className="w-4 h-4" />
                      <span>{property.city}, {property.state} {property.zipCode}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-white/90 drop-shadow-lg">
                      <Calendar className="w-4 h-4" />
                      <span>Tour: {property.tourDate ? new Date(property.tourDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }) : 'TBD'}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-white/90 drop-shadow-lg">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">
                          {property.issueCount} {property.issueCount === 1 ? 'Issue' : 'Issues'}
                        </span>
                      </div>
                      {property.criticalIssues > 0 && (
                        <Badge className={`${getSeverityColor(property.criticalIssues, property.issueCount)} border flex items-center gap-1 shadow-lg`}>
                          {getSeverityIcon(property.criticalIssues, property.issueCount)}
                          {property.criticalIssues} Critical
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {properties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-gray-900 mb-2">No Properties Yet</h3>
            <p className="text-gray-600">Your scheduled property tours will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}