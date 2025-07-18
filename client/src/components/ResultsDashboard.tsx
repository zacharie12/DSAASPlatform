import React, { useState, useCallback } from 'react';
import { Upload, BarChart3, Image, FileText, AlertCircle, CheckCircle, Calendar, File } from 'lucide-react';

interface MetricData {
  [key: string]: string | number;
}

interface UploadedResult {
  type: 'metrics' | 'image';
  fileName: string;
  uploadTime: string;
  data?: MetricData[];
  imageUrl?: string;
  fileSize: number;
}

interface FileValidation {
  isValid: boolean;
  error?: string;
}

const ResultsDashboard: React.FC = () => {
  const [uploadedResults, setUploadedResults] = useState<UploadedResult[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): FileValidation => {
    const allowedTypes = [
      'application/json',
      'text/csv',
      'image/png',
      'image/jpeg',
      'image/jpg'
    ];
    
    const allowedExtensions = ['.json', '.csv', '.png', '.jpg', '.jpeg'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return { 
        isValid: false, 
        error: 'Please upload JSON, CSV, PNG, or JPG files only.' 
      };
    }

    // Check file size (50MB limit for images, 10MB for data files)
    const maxSize = file.type.startsWith('image/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const limit = file.type.startsWith('image/') ? '50MB' : '10MB';
      return { 
        isValid: false, 
        error: `File size must be less than ${limit}.` 
      };
    }

    return { isValid: true };
  };

  const parseCSV = (csvText: string): MetricData[] => {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
      const row: MetricData = {};
      headers.forEach((header, index) => {
        const value = values[index] || '';
        // Try to parse as number, otherwise keep as string
        row[header] = isNaN(Number(value)) ? value : Number(value);
      });
      return row;
    });

    return rows;
  };

  const parseJSON = (jsonText: string): MetricData[] => {
    const parsed = JSON.parse(jsonText);
    
    // Handle different JSON structures
    if (Array.isArray(parsed)) {
      return parsed;
    } else if (typeof parsed === 'object') {
      // Convert single object to array format
      return [parsed];
    } else {
      throw new Error('JSON must be an object or array of objects');
    }
  };

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setIsUploading(true);

    const validation = validateFile(file);
    if (!validation.isValid) {
      setError(validation.error!);
      setIsUploading(false);
      return;
    }

    try {
      const uploadTime = new Date().toLocaleString();
      
      if (file.type.startsWith('image/')) {
        // Handle image files
        const imageUrl = URL.createObjectURL(file);
        const newResult: UploadedResult = {
          type: 'image',
          fileName: file.name,
          uploadTime,
          imageUrl,
          fileSize: file.size
        };
        setUploadedResults(prev => [newResult, ...prev]);
      } else {
        // Handle data files (JSON/CSV)
        const text = await file.text();
        let data: MetricData[];
        
        if (file.type === 'application/json' || file.name.toLowerCase().endsWith('.json')) {
          data = parseJSON(text);
        } else {
          data = parseCSV(text);
        }
        
        const newResult: UploadedResult = {
          type: 'metrics',
          fileName: file.name,
          uploadTime,
          data,
          fileSize: file.size
        };
        setUploadedResults(prev => [newResult, ...prev]);
      }
      
      setError(null);
    } catch (err) {
      setError(`Error processing file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeResult = (index: number) => {
    setUploadedResults(prev => {
      const newResults = [...prev];
      // Clean up image URL if it exists
      if (newResults[index].imageUrl) {
        URL.revokeObjectURL(newResults[index].imageUrl!);
      }
      newResults.splice(index, 1);
      return newResults;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Model Results Dashboard
          </h1>
          <p className="text-gray-600">
            Upload model metrics and visualizations to share with clients
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
              isDragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              accept=".json,.csv,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <BarChart3 className={`w-12 h-12 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isUploading ? 'Processing...' : 'Upload Model Results'}
                </p>
                <p className="text-gray-500">
                  Drop your files here or click to browse
                </p>
              </div>
              
              <div className="text-sm text-gray-400 space-y-1">
                <p><strong>Metrics:</strong> JSON or CSV files (max 10MB)</p>
                <p><strong>Charts:</strong> PNG or JPG images (max 50MB)</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Results Display */}
        {uploadedResults.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Uploaded Results</h2>
            
            {uploadedResults.map((result, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Result Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {result.type === 'image' ? (
                        <Image className="w-5 h-5 text-purple-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-600" />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {result.fileName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{result.uploadTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <File className="w-4 h-4" />
                            <span>{formatFileSize(result.fileSize)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeResult(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <AlertCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Result Content */}
                <div className="p-6">
                  {result.type === 'image' && result.imageUrl ? (
                    <div className="flex justify-center">
                      <img
                        src={result.imageUrl}
                        alt={result.fileName}
                        className="max-w-full h-auto rounded-lg shadow-md"
                        style={{ maxHeight: '600px' }}
                      />
                    </div>
                  ) : result.type === 'metrics' && result.data ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {Object.keys(result.data[0] || {}).map((header) => (
                              <th
                                key={header}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {result.data.map((row, rowIndex) => (
                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              {Object.values(row).map((value, cellIndex) => (
                                <td
                                  key={cellIndex}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                >
                                  {typeof value === 'number' ? value.toLocaleString() : String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {uploadedResults.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results uploaded yet</h3>
            <p className="text-gray-500">Upload your first model results to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDashboard;