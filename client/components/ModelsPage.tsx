import React from 'react';
import { Calendar, Eye, Clock, CheckCircle, AlertCircle, Package, DollarSign, TrendingUp } from 'lucide-react';

export interface ModelProject {
  id: string;
  name: string;
  type: 'inventory' | 'price' | 'product';
  status: 'in-progress' | 'completed';
  createdAt: string;
  csvFileName: string;
  hasResults: boolean;
}

interface ModelsPageProps {
  models: ModelProject[];
  onViewModel: (modelId: string) => void;
}

const ModelsPage: React.FC<ModelsPageProps> = ({ models, onViewModel }) => {
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
        return AlertCircle;
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Models
          </h1>
          <p className="text-gray-600">
            Track your AI model training progress and view results
          </p>
        </div>

        {/* Models Grid */}
        {models.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => {
              const Icon = getModelIcon(model.type);
              const StatusIcon = getStatusIcon(model.status);
              
              return (
                <div key={model.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 ${getModelColor(model.type)} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {model.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {model.csvFileName}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(model.status)}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span>{getStatusText(model.status)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Created {model.createdAt}</span>
                    </div>
                    
                    <button
                      onClick={() => onViewModel(model.id)}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Model</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No models yet</h3>
            <p className="text-gray-500 mb-6">
              Start by uploading data and choosing an optimization in the AI Assistant
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelsPage;