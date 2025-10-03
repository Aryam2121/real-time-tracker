
import { useState } from 'react';
import DeliveryTracker from './components/DeliveryTracker';
import DeliveryPartnerDashboard from './components/DeliveryPartnerDashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('customer'); // 'customer' or 'partner'

  return (
    <div className="app">
      <div className="app-switcher">
        <button 
          className={`view-btn ${currentView === 'customer' ? 'active' : ''}`}
          onClick={() => setCurrentView('customer')}
        >
          👤 Customer View
        </button>
        <button 
          className={`view-btn ${currentView === 'partner' ? 'active' : ''}`}
          onClick={() => setCurrentView('partner')}
        >
          🏍️ Delivery Partner
        </button>
      </div>
      
      {currentView === 'customer' ? (
        <DeliveryTracker orderId="12345" />
      ) : (
        <DeliveryPartnerDashboard />
      )}
    </div>
  );
}

export default App;
