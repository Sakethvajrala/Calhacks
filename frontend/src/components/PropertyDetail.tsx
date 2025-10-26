import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Calendar, AlertTriangle, Droplet, Hammer, Wind, Zap, Bug, Thermometer, Download, Filter, DollarSign, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Property, Issue } from '../App';
import { apiService, type PropertyWithIssues, type Issue as ApiIssue } from '../services/api';
import jsPDF from 'jspdf';

type PropertyDetailProps = {
  property: Property;
  onBack: () => void;
};

// Mock issues data - this will come from PostgreSQL
const mockIssues: Record<string, Issue[]> = {
  '1': [
    {
      id: '1',
      propertyId: '1',
      title: 'Foundation Crack - Structural Integrity Risk',
      description: 'Horizontal crack detected in basement foundation wall measuring 6 feet in length and 3mm width. Pattern analysis indicates progressive settling over 18-24 months with thermal imaging revealing moisture intrusion behind the crack surface.|Requires immediate evaluation by a licensed structural engineer. Crack orientation suggests potential soil expansion issues that may affect other foundation areas.',
      concernLevel: 9,
      imageUrl: 'https://images.unsplash.com/photo-1758402481575-8245f9b8fbcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmFja2VkJTIwZm91bmRhdGlvbnxlbnwxfHx8fDE3NjEzNzExMzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Structural',
      detectedDate: '2025-10-25',
      estimatedCost: '$8,500 - $15,000',
    },
    {
      id: '2',
      propertyId: '1',
      title: 'Active Water Intrusion - Master Bedroom Ceiling',
      description: 'Brown water staining covering 18 sq ft of ceiling drywall with discoloration gradient indicating ongoing moisture penetration. Pattern suggests source from compromised roof flashing. Moisture readings show 28% water content (normal: <15%).|High probability of concealed mold growth. Immediate actions: (1) Professional roof inspection, (2) Mold testing and air quality assessment, (3) Water damage restoration after leak repair.',
      concernLevel: 8,
      imageUrl: 'https://images.unsplash.com/photo-1737739973200-61c2ae4d1272?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMGRhbWFnZSUyMGNlaWxpbmd8ZW58MXx8fHwxNzYxMzcxMTM4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Water Damage',
      detectedDate: '2025-10-25',
      estimatedCost: '$3,200 - $5,800',
    },
    {
      id: '3',
      propertyId: '1',
      title: 'Compromised Window Seal - Energy Efficiency Loss',
      description: 'Failed seal in double-pane living room window (4\'x6\' unit). Condensation between glass panes indicates argon gas escape and moisture entry. R-value reduced from 3.2 to 1.8 (44% loss).|Annual energy cost impact: $180-$240 in additional heating/cooling expenses. Replacement recommended within 6-12 months to prevent efficiency degradation and wood frame rot.',
      concernLevel: 4,
      imageUrl: 'https://images.unsplash.com/photo-1643461394487-7e2856b215b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicm9rZW4lMjB3aW5kb3d8ZW58MXx8fHwxNzYxMzcxMTM4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Windows',
      detectedDate: '2025-10-25',
      estimatedCost: '$450 - $800',
    },
    {
      id: '4',
      propertyId: '1',
      title: 'Critical Roof Deterioration - Weather Vulnerability',
      description: 'Drone imagery identified 14 missing asphalt shingles and 23 damaged/curled shingles across south-facing roof section (220 sq ft). Granule loss exceeds 40% with underlayment exposure in 3 locations creating immediate water infiltration risk.|Roof age: 22-25 years (typical lifespan: 20-25 years). Emergency patch repair needed immediately, followed by full replacement within current season.',
      concernLevel: 7,
      imageUrl: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb29mJTIwZGFtYWdlfGVufDF8fHx8MTc2MTM3MTEzOHww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Roofing',
      detectedDate: '2025-10-25',
      estimatedCost: '$12,000 - $18,500',
    },
    {
      id: '5',
      propertyId: '1',
      title: 'Outdated Electrical Panel - Safety Code Concerns',
      description: '100-amp main panel (circa 2002) with Federal Pacific Electric breakers (known for failure-to-trip issues). Panel shows 6 unlabeled circuits, bus bar corrosion, and overheating evidence on breaker #7. System at 82% capacity.|Code compliance issues: Missing AFCI protection on bedrooms, insufficient GFCI in wet areas, no surge protection. Insurance companies increasingly deny claims on FPE panels.',
      concernLevel: 6,
      imageUrl: 'https://images.unsplash.com/photo-1576446468729-7674e99608f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2FsJTIwd2lyaW5nfGVufDF8fHx8MTc2MTM3MTEzOXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Electrical',
      detectedDate: '2025-10-25',
      estimatedCost: '$2,500 - $4,500',
    },
    {
      id: '6',
      propertyId: '1',
      title: 'Toxic Mold Growth - Health Hazard Detected',
      description: 'Stachybotrys chartarum (black mold) colony covering 4 sq ft around shower enclosure and ceiling vent. Colony age: 6-9 months. Root cause: inadequate ventilation (35 CFM vs. required 50 CFM) and moisture retention in grout.|Health risks: respiratory irritation, allergic reactions, mycotoxin exposure. Requires professional EPA-compliant abatement, material replacement, ventilation upgrade, and post-remediation testing.',
      concernLevel: 7,
      imageUrl: 'https://images.unsplash.com/photo-1708895240122-418c6902685e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2xkJTIwd2FsbHxlbnwxfHx8fDE3NjEzNzExMzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Mold/Moisture',
      detectedDate: '2025-10-25',
      estimatedCost: '$1,800 - $3,200',
    },
    {
      id: '7',
      propertyId: '1',
      title: 'HVAC System End-of-Life - Replacement Planning Required',
      description: 'Central AC/heating system manufactured 2007 (current age: 18 years). Compressor at 68% efficiency resulting in 32% energy waste. Heat exchanger shows micro-cracking with CO risk. Uses prohibited R-22 refrigerant.|Industry lifespan: 15-20 years. Currently operational but failure risk increases exponentially after year 18. Modern system would save $85-$120/month in energy costs.',
      concernLevel: 5,
      imageUrl: 'https://images.unsplash.com/photo-1576446468729-7674e99608f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2FsJTIwd2lyaW5nfGVufDF8fHx8MTc2MTM3MTEzOXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'HVAC',
      detectedDate: '2025-10-25',
      estimatedCost: '$6,500 - $12,000',
    },
    {
      id: '8',
      propertyId: '1',
      title: 'Gutter System Failure - Foundation Risk Factor',
      description: '65% gutter blockage with improper pitch causing pooling in 3 sections. Downspouts discharge within 2 feet of foundation (required: 6 feet). Two detached segments allow direct water flow against foundation wall.|Combined effect: 400+ gallons per rainfall directed at foundation, contributing to hydrostatic pressure and exacerbating foundation crack. Immediate correction needed.',
      concernLevel: 5,
      imageUrl: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb29mJTIwZGFtYWdlfGVufDF8fHx8MTc2MTM3MTEzOHww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Exterior',
      detectedDate: '2025-10-25',
      estimatedCost: '$800 - $1,500',
    },
  ],
};

const categoryIcons: Record<string, any> = {
  'Structural': Hammer,
  'Water Damage': Droplet,
  'Windows': Wind,
  'Roofing': AlertTriangle,
  'Electrical': Zap,
  'Mold/Moisture': Bug,
  'HVAC': Thermometer,
  'Exterior': Wind,
};

export function PropertyDetail({ property, onBack }: PropertyDetailProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedIssueType, setSelectedIssueType] = useState<string>('all');
  const [propertyDetails, setPropertyDetails] = useState<PropertyWithIssues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        const response = await apiService.getPropertyDetails(property.id);
        
        if (response.success && response.data) {
          setPropertyDetails(response.data);
        } else {
          setError(response.error || 'Failed to fetch property details');
        }
      } catch (err) {
        setError('Network error occurred');
        console.error('Error fetching property details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [property.id]);

  // Convert API issues to component format
  const convertApiIssueToComponent = (apiIssue: ApiIssue): Issue => ({
    id: apiIssue.id,
    propertyId: apiIssue.propertyId,
    title: apiIssue.title,
    description: apiIssue.description,
    concernLevel: apiIssue.concernLevel,
    imageUrl: apiIssue.imageUrl ? 
      (apiIssue.imageUrl.startsWith('/ml_training/') ? 
        `http://localhost:8000${apiIssue.imageUrl}` : 
        `http://localhost:8000${apiIssue.imageUrl}`) : '',
    category: apiIssue.category,
    detectedDate: apiIssue.detectedDate,
    estimatedCost: `$${apiIssue.estimatedCostLow.toLocaleString()} - $${apiIssue.estimatedCostHigh.toLocaleString()}`,
  });

  const issues = propertyDetails?.issues?.map(convertApiIssueToComponent) || [];

  const criticalCount = issues.filter(i => i.concernLevel >= 8).length;
  const highCount = issues.filter(i => i.concernLevel >= 6 && i.concernLevel < 8).length;
  const moderateCount = issues.filter(i => i.concernLevel >= 3 && i.concernLevel < 6).length;

  const totalRepairCost = issues.reduce((sum, issue) => {
    const costRange = issue.estimatedCost.replace(/[\$,]/g, '').split(' - ');
    const avgCost = (parseFloat(costRange[0]) + parseFloat(costRange[1])) / 2;
    return sum + avgCost;
  }, 0);

  const getFilteredIssues = () => {
    let filtered = issues;
    
    // Filter by severity (activeTab)
    if (activeTab === 'critical') filtered = filtered.filter(i => i.concernLevel >= 8);
    else if (activeTab === 'high') filtered = filtered.filter(i => i.concernLevel >= 6 && i.concernLevel < 8);
    else if (activeTab === 'moderate') filtered = filtered.filter(i => i.concernLevel >= 3 && i.concernLevel < 6);
    
    // Filter by issue type (title)
    if (selectedIssueType !== 'all') {
      filtered = filtered.filter(i => i.title === selectedIssueType);
    }
    
    return filtered;
  };

  // Get unique issue types (titles) from issues
  const availableIssueTypes = Array.from(new Set(issues.map(i => i.title))).sort();

  const sortedIssues = [...getFilteredIssues()].sort((a, b) => b.concernLevel - a.concernLevel);

  const getConcernColor = (level: number) => {
    if (level >= 8) return 'from-red-600 to-red-700';
    if (level >= 6) return 'from-orange-500 to-orange-600';
    if (level >= 4) return 'from-yellow-500 to-yellow-600';
    return 'from-green-500 to-green-600';
  };

  const getConcernLabel = (level: number) => {
    if (level >= 8) return 'Critical';
    if (level >= 6) return 'High';
    if (level >= 4) return 'Moderate';
    return 'Low';
  };

  const getConcernBadgeColor = (level: number) => {
    if (level >= 8) return 'bg-red-100 text-red-700 border-red-200';
    if (level >= 6) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (level >= 4) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-600 text-white';
    if (grade.startsWith('B')) return 'bg-blue-600 text-white';
    if (grade.startsWith('C')) return 'bg-yellow-600 text-white';
    if (grade.startsWith('D')) return 'bg-orange-600 text-white';
    return 'bg-red-600 text-white';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    doc.setFillColor(30, 58, 138); // blue-900
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('Real(i)ty.AI', 20, 20);
    
    doc.setFontSize(12);
    doc.text('Property Inspection Report', 20, 28);

    yPosition = 50;
    doc.setTextColor(0, 0, 0);
    
    // Property Info
    doc.setFontSize(18);
    doc.text('Property Information', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.text(`Address: ${property.address}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Location: ${property.city}, ${property.state} ${property.zipCode}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Property Grade: ${property.grade}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Estimated Value: ${formatPrice(property.estimatedPrice || 0)}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Inspection Date: ${property.tourDate ? new Date(property.tourDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }) : 'TBD'}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Report Generated: ${new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })}`, 20, yPosition);
    
    yPosition += 15;
    
    // Summary Stats
    doc.setFontSize(16);
    doc.text('Inspection Summary', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.text(`Total Issues Detected: ${issues.length}`, 20, yPosition);
    yPosition += 7;
    doc.setTextColor(220, 38, 38); // red-600
    doc.text(`Critical Issues: ${criticalCount}`, 20, yPosition);
    yPosition += 7;
    doc.setTextColor(234, 88, 12); // orange-600
    doc.text(`High Priority Issues: ${highCount}`, 20, yPosition);
    yPosition += 7;
    doc.setTextColor(202, 138, 4); // yellow-600
    doc.text(`Moderate Issues: ${moderateCount}`, 20, yPosition);
    yPosition += 7;
    doc.setTextColor(0, 0, 0);
    doc.text(`Estimated Total Repair Cost: ${formatPrice(totalRepairCost || 0)}`, 20, yPosition);
    yPosition += 15;
    
    // Issues Details
    doc.setFontSize(16);
    doc.text('Detailed Issue Report', 20, yPosition);
    yPosition += 10;
    
    const sortedForPDF = [...issues].sort((a, b) => b.concernLevel - a.concernLevel);
    
    sortedForPDF.forEach((issue, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Issue number and title
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${issue.title}`, 20, yPosition);
      yPosition += 7;
      
      // Category, Concern Level, and Cost
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Category: ${issue.category} | Concern: ${issue.concernLevel}/10 (${getConcernLabel(issue.concernLevel)}) | Cost: ${issue.estimatedCost}`, 20, yPosition);
      yPosition += 7;
      
      // Description - wrap text
      const fullDescription = issue.description.replace(/\|/g, ' ');
      const splitDescription = doc.splitTextToSize(fullDescription, pageWidth - 40);
      doc.setFontSize(9);
      splitDescription.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 5;
      });
      
      yPosition += 8;
      
      // Add a separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;
    });
    
    // Footer on last page
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
      doc.text('Generated by Real(i)ty.AI', 20, pageHeight - 10);
    }
    
    // Save the PDF
    doc.save(`RealityAI-Report-${property.address.replace(/\s+/g, '-')}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h3 className="text-gray-900 mb-2">Error Loading Property</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={onBack} className="bg-blue-600 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-blue-50/30 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Button>
            
            <Button
              onClick={generatePDF}
              className="bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 shadow-md"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF Report
            </Button>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <ImageWithFallback
                src={property.imageUrl}
                alt={property.address}
                className="w-24 h-24 rounded-xl object-cover shadow-lg flex-shrink-0"
              />
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-gray-900 text-2xl">{property.address}</h1>
                  <Badge className={`${getGradeColor(property.grade)} shadow-md px-3 py-1`}>
                    <Award className="w-4 h-4 mr-1" />
                    Grade {property.grade}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{property.city}, {property.state} {property.zipCode}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {property.tourDate ? new Date(property.tourDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      }) : 'TBD'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
                    <div className="text-slate-500 text-xs mb-0.5">List Price</div>
                    <div className="text-slate-900 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatPrice(property.listPrice)}</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                    <div className="text-blue-700 text-xs mb-0.5">Our Estimate</div>
                    <div className="text-blue-900 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatPrice(property.ourEstimate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {issues.length === 0 ? (
          <Card className="p-12 text-center shadow-lg">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 mb-2">No Issues Detected</h3>
            <p className="text-gray-600">This property inspection is still in progress or no issues were found.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card className="p-6 text-center bg-white shadow-md border-2">
                <div className="text-gray-600 text-sm mb-2">Total Issues</div>
                <div className="text-gray-900 text-xl">{issues.length}</div>
              </Card>
              
              <Card className="p-6 text-center bg-red-50 shadow-md border-2 border-red-200">
                <div className="text-red-700 text-sm mb-2 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Critical
                </div>
                <div className="text-red-900 text-xl">{criticalCount}</div>
              </Card>
              
              <Card className="p-6 text-center bg-orange-50 shadow-md border-2 border-orange-200">
                <div className="text-orange-700 text-sm mb-2 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  High Priority
                </div>
                <div className="text-orange-900 text-xl">{highCount}</div>
              </Card>
              
              <Card className="p-6 text-center bg-yellow-50 shadow-md border-2 border-yellow-200">
                <div className="text-yellow-700 text-sm mb-2 flex items-center justify-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Moderate
                </div>
                <div className="text-yellow-900 text-xl">{moderateCount}</div>
              </Card>

              <Card className="p-6 text-center bg-blue-50 shadow-md border-2 border-blue-200">
                <div className="text-blue-700 text-sm mb-2 flex items-center justify-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Est. Repairs
                </div>
                <div className="text-blue-900 text-xl">{formatPrice(totalRepairCost)}</div>
              </Card>
            </div>

            {/* Issue Type Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Issue Type
              </label>
              <select
                value={selectedIssueType}
                onChange={(e) => setSelectedIssueType(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">All Issue Types ({issues.length})</option>
                {availableIssueTypes.map(issueType => {
                  const count = issues.filter(i => i.title === issueType).length;
                  return (
                    <option key={issueType} value={issueType}>
                      {issueType} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Tabs for Filtering */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-auto">
                <TabsTrigger value="all" className="py-3">
                  All Issues ({getFilteredIssues().length})
                </TabsTrigger>
                <TabsTrigger value="critical" className="py-3">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Critical ({issues.filter(i => i.concernLevel >= 8 && (selectedIssueType === 'all' || i.title === selectedIssueType)).length})
                </TabsTrigger>
                <TabsTrigger value="high" className="py-3">
                  High ({issues.filter(i => i.concernLevel >= 6 && i.concernLevel < 8 && (selectedIssueType === 'all' || i.title === selectedIssueType)).length})
                </TabsTrigger>
                <TabsTrigger value="moderate" className="py-3">
                  Moderate ({issues.filter(i => i.concernLevel >= 3 && i.concernLevel < 6 && (selectedIssueType === 'all' || i.title === selectedIssueType)).length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6 space-y-6">
                {sortedIssues.length === 0 ? (
                  <Card className="p-12 text-center">
                    <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-gray-900 mb-2">No Issues in This Category</h3>
                    <p className="text-gray-600">Try selecting a different filter.</p>
                  </Card>
                ) : (
                  sortedIssues.map((issue) => {
                    const CategoryIcon = categoryIcons[issue.category] || AlertTriangle;
                    const descriptionParts = issue.description.split('|');
                    return (
                      <Card key={issue.id} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                        <div className="md:flex">
                          <div className="md:w-1/3 relative">
                            <ImageWithFallback
                              src={issue.imageUrl}
                              alt={issue.title}
                              className="w-full h-64 md:h-full object-cover"
                            />
                            <Badge className={`absolute top-4 right-4 ${getConcernBadgeColor(issue.concernLevel)} border flex items-center gap-1.5 shadow-lg`}>
                              <CategoryIcon className="w-3.5 h-3.5" />
                              {issue.category}
                            </Badge>
                          </div>
                          <div className="md:w-2/3 p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-gray-900 mb-3 text-lg">{issue.title}</h3>
                                <div className="space-y-3">
                                  {descriptionParts.map((part, idx) => (
                                    <p key={idx} className="text-gray-600 text-sm leading-relaxed">
                                      {part.trim()}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-700">Estimated Repair Cost</span>
                                <span className="text-gray-900 px-3 py-1 bg-gray-100 rounded-full text-sm">
                                  {issue.estimatedCost}
                                </span>
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-gray-700">Concern Level</span>
                                  <span className={`${getConcernBadgeColor(issue.concernLevel)} px-3 py-1 rounded-full text-sm border`}>
                                    {getConcernLabel(issue.concernLevel)} ({issue.concernLevel}/10)
                                  </span>
                                </div>
                                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full bg-gradient-to-r ${getConcernColor(issue.concernLevel)} transition-all duration-500 shadow-sm`}
                                    style={{ width: `${issue.concernLevel * 10}%` }}
                                  ></div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                  Detected: {new Date(issue.detectedDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}