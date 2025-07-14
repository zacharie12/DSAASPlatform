import React, { useState } from 'react';
import { ArrowLeft, Calendar, Settings, Database, BarChart3, Brain, Upload, FileText, Image } from 'lucide-react';
import CSVUploader from './CSVUploader';
import ResultsDashboard from './ResultsDashboard';
import PredictionInterface from './PredictionInterface';
import { Project } from './ProjectList';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack, onUpdateProject }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'results' | 'predictions'>('overview');
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning':
        return 'bg-gray-100 text-gray-800';
      case 'data-uploaded':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'model-ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'planning':
        return 'Planning';
      case 'data-uploaded':
        return 'Data Uploaded';
      case 'in-progress':
        return 'In Progress';
      case 'model-ready':
        return 'Model Ready';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const handleStatusChange = (newStatus: Project['status']) => {
    onUpdateProject(project.id, { status: newStatus, lastUpdated: new Date().toLocaleDateString() });
    setIsEditingStatus(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'data', label: 'Data Upload', icon: Database },
    { id: 'results', label: 'Model Results', icon: BarChart3 },
    { id: 'predictions', label: 'Predictions', icon: Brain },
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
                <span>Back to Projects</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Updated {project.lastUpdated}</span>
                  </div>
                  <div className="relative">
                    {isEditingStatus ? (
                      <select
                        value={project.status}
                        onChange={(e) => handleStatusChange(e.target.value as Project['status'])}
                        onBlur={() => setIsEditingStatus(false)}
                        className="text-xs font-medium border border-gray-300 rounded-full px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      >
                        <option value="planning">Planning</option>
                        <option value="data-uploaded">Data Uploaded</option>
                        <option value="in-progress">In Progress</option>
                        <option value="model-ready">Model Ready</option>
                        <option value="completed">Completed</option>
                      </select>
                    ) : (
                      <button
                        onClick={() => setIsEditingStatus(true)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)} hover:opacity-80 transition-opacity`}
                      >
                        {getStatusText(project.status)}
                      </button>
                    )}
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
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Project Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                  <p className="text-gray-900">{project.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-gray-900">{project.description}</p>
                </div>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    project.dataUploaded ? 'bg-green-100' : 'bg-gray-200'
                  }`}>
                    <Database className={`w-6 h-6 ${project.dataUploaded ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Data Upload</h3>
                    <p className={`text-sm ${project.dataUploaded ? 'text-green-600' : 'text-gray-500'}`}>
                      {project.dataUploaded ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    project.modelResults ? 'bg-green-100' : 'bg-gray-200'
                  }`}>
                    <BarChart3 className={`w-6 h-6 ${project.modelResults ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Model Training</h3>
                    <p className={`text-sm ${project.modelResults ? 'text-green-600' : 'text-gray-500'}`}>
                      {project.modelResults ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    project.predictions ? 'bg-green-100' : 'bg-gray-200'
                  }`}>
                    <Brain className={`w-6 h-6 ${project.predictions ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Predictions</h3>
                    <p className={`text-sm ${project.predictions ? 'text-green-600' : 'text-gray-500'}`}>
                      {project.predictions ? 'Available' : 'Not Ready'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div>
            <CSVUploader />
          </div>
        )}

        {activeTab === 'results' && (
          <div>
            <ResultsDashboard />
          </div>
        )}

        {activeTab === 'predictions' && (
          <div>
            <PredictionInterface />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;