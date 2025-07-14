import React, { useState } from 'react';
import { Plus, Calendar, Eye, Search, Filter } from 'lucide-react';

export interface Project {
  id: string;
  name: string;
  status: 'planning' | 'data-uploaded' | 'in-progress' | 'model-ready' | 'completed';
  lastUpdated: string;
  description: string;
  dataUploaded: boolean;
  modelResults: boolean;
  predictions: boolean;
}

interface ProjectListProps {
  projects: Project[];
  onViewProject: (projectId: string) => void;
  onCreateProject: () => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onViewProject, onCreateProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Projects Dashboard
            </h1>
            <p className="text-gray-600">
              Manage and track your AI modeling projects
            </p>
          </div>
          <button
            onClick={onCreateProject}
            className="mt-4 sm:mt-0 flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="data-uploaded">Data Uploaded</option>
                  <option value="in-progress">In Progress</option>
                  <option value="model-ready">Model Ready</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {project.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.description}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Updated {project.lastUpdated}</span>
                  </div>
                  
                  {/* Progress Indicators */}
                  <div className="flex space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${project.dataUploaded ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-600">Data</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${project.modelResults ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-600">Model</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${project.predictions ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-xs text-gray-600">Predictions</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onViewProject(project.id)}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Project</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first AI project to get started'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <button
                onClick={onCreateProject}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Create Project</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;