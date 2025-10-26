import { useState } from 'react';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { PropertyDetail } from './components/PropertyDetail';

export type Property = {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  tourDate: string;
  issueCount: number;
  criticalIssues: number;
  imageUrl: string;
  grade: string;
  estimatedPrice: number;
  listPrice: number;
  ourEstimate: number;
};

export type Issue = {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  concernLevel: number; // 1-10, where 10 is most critical
  imageUrl: string;
  category: string;
  detectedDate: string;
  estimatedCost: string;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
  };

  const handleBackToList = () => {
    setSelectedProperty(null);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  if (selectedProperty) {
    return (
      <PropertyDetail 
        property={selectedProperty} 
        onBack={handleBackToList}
      />
    );
  }

  return <Dashboard onSelectProperty={handleSelectProperty} />;
}

export default App;