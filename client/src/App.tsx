import React from 'react';
import { useState } from 'react';
import LoginPage from "./components/LoginPage";
import Navigation from "./components/Navigation";
import ClientDashboard from "./components/ClientDashboard";
import ModelsPage from "./components/ModelsPage";
import ModelDetailPage from "./components/ModelDetailPage";
import ChatbotPage from "./components/ChatbotPage";
import ResultsDashboard from "./components/ResultsDashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [currentPage, setCurrentPage] = useState<'home' | 'models' | 'model-detail'>('home');
  const [models, setModels] = useState<ModelProject[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [chatbotData, setChatbotData] = useState<any>(null);
  const [createdModelTypes, setCreatedModelTypes] = useState<Set<string>>(new Set());

  const handleLogin = (user: string) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setCurrentPage('home');
    setModels([]);
    setSelectedModelId(null);
    setChatbotData(null);
    setCreatedModelTypes(new Set());
  };

  const handleCreateModel = (type: 'inventory' | 'price' | 'product', csvData: any) => {
    // Check if this model type already exists
    if (createdModelTypes.has(type)) {
      return { success: false, message: "This model is already in progress and will appear in the Models section." };
    }

    const modelNames = {
      inventory: 'Inventory Optimization',
      price: 'Price Recommendation',
      product: 'Product Recommendation'
    };

    const newModel: ModelProject = {
      id: Date.now().toString(),
      name: modelNames[type],
      type,
      status: 'in-progress',
      createdAt: 'Just now',
      csvFileName: csvData.fileName,
      hasResults: false
    };

    setModels(prev => [newModel, ...prev]);
    setCreatedModelTypes(prev => new Set([...prev, type]));
    setChatbotData(csvData);
    
    return { success: true, message: null };
  };

  const handleViewModel = (modelId: string) => {
    setSelectedModelId(modelId);
    setCurrentPage('model-detail');
  };

  const handleBackToModels = () => {
    setCurrentPage('models');
    setSelectedModelId(null);
  };

  const handleUpdateModel = (modelId: string, updates: Partial<ModelProject>) => {
    setModels(prev => prev.map(model => 
      model.id === modelId ? { ...model, ...updates } : model
    ));
  };

  const handleNavigate = (page: 'home' | 'models') => {
    setCurrentPage(page);
    if (page !== 'models') {
      setSelectedModelId(null);
    }
  };

  const selectedModel = models.find(m => m.id === selectedModelId);

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        currentPage={currentPage === 'model-detail' ? 'models' : currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        username={username}
      >
        {currentPage === 'home' && (
          <ChatbotPage 
            onCreateModel={handleCreateModel} 
            persistedData={chatbotData} 
            createdModelTypes={createdModelTypes}
          />
        )}
        
        {currentPage === 'models' && (
          <ModelsPage models={models} onViewModel={handleViewModel} />
        )}
        
        {currentPage === 'model-detail' && selectedModel && (
          <ModelDetailPage
            model={selectedModel}
            onBack={handleBackToModels}
            onUpdateModel={handleUpdateModel}
          />
        )}
      </Navigation>
    </div>
  );
}

export default App;
