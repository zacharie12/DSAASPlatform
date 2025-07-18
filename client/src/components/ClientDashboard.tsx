import React, { useState } from 'react';
import ProjectList, { Project } from './ProjectList';
import ProjectDetail from './ProjectDetail';

const ClientDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Customer Churn Prediction',
      status: 'model-ready',
      lastUpdated: '2 days ago',
      description: 'Predict which customers are likely to churn based on usage patterns and demographics.',
      dataUploaded: true,
      modelResults: true,
      predictions: true,
    },
    {
      id: '2',
      name: 'Sales Forecasting Model',
      status: 'in-progress',
      lastUpdated: '1 week ago',
      description: 'Forecast monthly sales revenue using historical data and market indicators.',
      dataUploaded: true,
      modelResults: false,
      predictions: false,
    },
    {
      id: '3',
      name: 'Product Recommendation Engine',
      status: 'data-uploaded',
      lastUpdated: '3 days ago',
      description: 'Recommend products to customers based on purchase history and preferences.',
      dataUploaded: true,
      modelResults: false,
      predictions: false,
    },
    {
      id: '4',
      name: 'Fraud Detection System',
      status: 'completed',
      lastUpdated: '1 month ago',
      description: 'Detect fraudulent transactions in real-time using machine learning algorithms.',
      dataUploaded: true,
      modelResults: true,
      predictions: true,
    },
    {
      id: '5',
      name: 'Inventory Optimization',
      status: 'planning',
      lastUpdated: '5 days ago',
      description: 'Optimize inventory levels to reduce costs while maintaining service levels.',
      dataUploaded: false,
      modelResults: false,
      predictions: false,
    },
  ]);

  const handleViewProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedProjectId(null);
  };

  const handleCreateProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: `New Project ${projects.length + 1}`,
      status: 'planning',
      lastUpdated: 'Just now',
      description: 'New AI project description',
      dataUploaded: false,
      modelResults: false,
      predictions: false,
    };
    setProjects([newProject, ...projects]);
  };

  const handleUpdateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(projects.map(project => 
      project.id === projectId ? { ...project, ...updates } : project
    ));
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  if (currentView === 'detail' && selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={handleBackToList}
        onUpdateProject={handleUpdateProject}
      />
    );
  }

  return (
    <ProjectList
      projects={projects}
      onViewProject={handleViewProject}
      onCreateProject={handleCreateProject}
    />
  );
};

export default ClientDashboard;