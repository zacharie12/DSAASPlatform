import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, CheckCircle, Package, DollarSign, TrendingUp, Upload } from 'lucide-react';
import { ModelProject } from './ModelsPage';
import ResultsDashboard from './ResultsDashboard';
import PredictionInterface from './PredictionInterface';

interface ModelDetailPageProps {
  model: ModelProject;
  onBack: () => void;
  onUpdateModel: (modelId: string, updates: Partial<ModelProject>) => void;
}

const ModelDetailPage: React.FC<ModelDetailPageProps> = ({ model, onBack, onUpdateModel }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'predictions'>('overview');

  const getModelIcon = (type: ModelProject['type']) => {
    switch (type) {
      case 'inventory':
        return Package;
      case 'price':
        return DollarSign;
      case 'product':
        return TrendingUp;
      default:
        return Package;
    }
  };

  const getModelColor = (type: ModelProject['type']) => {
    switch (type) {
      case 'inventory':
        return 'bg-blue-500';
      case 'price':
        return 'bg-green-500';
      case 'product':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: ModelProject['status']) => {
    switch (status) {
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ModelProject['status']) => {
    switch (status) {
      case 'in-progress':
        return Clock;
      case 'completed':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const getStatusText = (status: ModelProject['status']) => {
    switch (status) {
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const getModelDescription = (type: ModelProject['type']) => {
    switch (type) {
      case 'inventory':
        return 'Optimize stock levels to reduce costs while maintaining service levels';
      case 'price':
        return 'AI-powered pricing strategies to maximize revenue and competitiveness';
      case 'product':
        return 'Personalized product recommendations to increase customer engagement';
      default:
        return 'AI model optimization';
    }
  };

  const Icon = getModelIcon(model.type);
  const StatusIcon = getStatusIcon(model.status);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'results', label: 'Results' },
    { id: 'predictions', label: 'Predictions' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Models</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${getModelColor(model.type)} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{model.name}</h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Created {model.createdAt}</span>
                    </div>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span>{getStatusText(model.status)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Model Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Model Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model Name</label>
                  <p className="text-gray-900">{model.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span>{getStatusText(model.status)}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Source</label>
                  <p className="text-gray-900">{model.csvFileName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                  <p className="text-gray-900">{model.createdAt}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-gray-900">{getModelDescription(model.type)}</p>
                </div>
              </div>
            </div>

            {/* Status Message */}
            {model.status === 'in-progress' && !model.hasResults && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <div>
                    <h3 className="text-lg font-medium text-blue-900">Your model is being prepared!</h3>
                    <p className="text-blue-700 mt-1">
                      Our AI team is working on training your model. Results will appear soon in the Results and Predictions tabs.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {model.hasResults && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <h3 className="text-lg font-medium text-green-900">Model Ready!</h3>
                    <p className="text-green-700 mt-1">
                      Your AI model has been trained successfully. Check the Results and Predictions tabs to explore the outcomes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'results' && (
          <div>
            {model.hasResults ? (
              <ResultsDashboard />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Results Coming Soon</h3>
                <p className="text-gray-500">
                  Your model is being prepared! Results will appear here once training is complete.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'predictions' && (
          <div>
            {model.hasResults ? (
              <PredictionInterface />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Predictions Not Ready</h3>
                <p className="text-gray-500">
                  Prediction interface will be available once your model training is complete.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelDetailPage;