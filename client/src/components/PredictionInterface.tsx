import React, { useState, useCallback } from 'react';
import { Upload, Play, FileText, AlertCircle, CheckCircle, Brain, Database } from 'lucide-react';

interface InputData {
  type: 'json' | 'csv';
  data: any[];
  fileName?: string;
}

interface PredictionResult {
  fileName: string;
  uploadTime: string;
  data: any[];
  fileSize: number;
}

interface FileValidation {
  isValid: boolean;
  error?: string;
}

const PredictionInterface: React.FC = () => {
  const [inputData, setInputData] = useState<InputData | null>(null);
  const [textInput, setTextInput] = useState('');
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');

  const validateFile = (file: File): FileValidation => {
    const allowedTypes = ['application/json', 'text/csv'];
    const allowedExtensions = ['.json', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return { 
        isValid: false, 
        error: 'Please upload JSON or CSV files only.' 
      };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { 
        isValid: false, 
        error: 'File size must be less than 5MB.' 
      };
    }

    return { isValid: true };
  };

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        const value = values[index] || '';
        // Try to parse as number, otherwise keep as string
        row[header] = isNaN(Number(value)) || value === '' ? value : Number(value);
      });
      return row;
    });

    return rows;
  };

  const parseJSON = (jsonText: string): any[] => {
    const parsed = JSON.parse(jsonText);
    
    if (Array.isArray(parsed)) {
      return parsed;
    } else if (typeof parsed === 'object') {
      return [parsed];
    } else {
      throw new Error('JSON must be an object or array of objects');
    }
  };

  const handleTextInput = () => {
    setInputError(null);
    
    if (!textInput.trim()) {
      setInputError('Please enter some data');
      return;
    }

    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(textInput);
      const data = Array.isArray(parsed) ? parsed : [parsed];
      
      setInputData({
        type: 'json',
        data
      });
      setInputError(null);
    } catch (jsonError) {
      // If JSON parsing fails, try CSV
      try {
        const data = parseCSV(textInput);
        setInputData({
          type: 'csv',
          data
        });
        setInputError(null);
      } catch (csvError) {
        setInputError('Invalid format. Please enter valid JSON or CSV data.');
      }
    }
  };

  const handleInputFile = useCallback(async (file: File) => {
    setInputError(null);

    const validation = validateFile(file);
    if (!validation.isValid) {
      setInputError(validation.error!);
      return;
    }

    try {
      const text = await file.text();
      let data: any[];
      let type: 'json' | 'csv';
      
      if (file.type === 'application/json' || file.name.toLowerCase().endsWith('.json')) {
        data = parseJSON(text);
        type = 'json';
      } else {
        data = parseCSV(text);
        type = 'csv';
      }
      
      setInputData({
        type,
        data,
        fileName: file.name
      });
      setInputError(null);
    } catch (err) {
      setInputError(`Error processing file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  const handlePredictionFile = useCallback(async (file: File) => {
    setError(null);
    setIsUploading(true);

    const validation = validateFile(file);
    if (!validation.isValid) {
      setError(validation.error!);
      setIsUploading(false);
      return;
    }

    try {
      const text = await file.text();
      let data: any[];
      
      if (file.type === 'application/json' || file.name.toLowerCase().endsWith('.json')) {
        data = parseJSON(text);
      } else {
        data = parseCSV(text);
      }
      
      const uploadTime = new Date().toLocaleString();
      setPredictionResult({
        fileName: file.name,
        uploadTime,
        data,
        fileSize: file.size
      });
      setError(null);
    } catch (err) {
      setError(`Error processing prediction file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handlePredictionFile(files[0]);
    }
  }, [handlePredictionFile]);

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
      if (e.target.id === 'input-file') {
        handleInputFile(files[0]);
      } else {
        handlePredictionFile(files[0]);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearInput = () => {
    setInputData(null);
    setTextInput('');
    setInputError(null);
  };

  const clearPrediction = () => {
    setPredictionResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Model Prediction Interface
          </h1>
          <p className="text-gray-600">
            Input your data and get AI model predictions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Database className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Input Data</h2>
              </div>

              {/* Tab Selection */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'text'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Text Input
                </button>
                <button
                  onClick={() => setActiveTab('file')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'file'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  File Upload
                </button>
              </div>

              {activeTab === 'text' ? (
                <div className="space-y-4">
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder='Enter JSON or CSV data, e.g.:
{"age": 25, "income": 50000}
or
age,income
25,50000'
                    className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                  />
                  <button
                    onClick={handleTextInput}
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    <span>Process Input</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <input
                      id="input-file"
                      type="file"
                      accept=".json,.csv"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Upload JSON or CSV file</p>
                    <p className="text-sm text-gray-400 mt-1">Max 5MB</p>
                  </div>
                </div>
              )}

              {/* Input Error */}
              {inputError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700">{inputError}</p>
                </div>
              )}

              {/* Input Success */}
              {inputData && !inputError && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-green-700 font-medium">Input processed successfully!</p>
                        <p className="text-green-600 text-sm">
                          {inputData.fileName || `${inputData.type.toUpperCase()} data`} - {inputData.data.length} record(s)
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={clearInput}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Input Data Preview */}
              {inputData && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Input Preview</h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(inputData.data[0] || {}).map((header) => (
                            <th
                              key={header}
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inputData.data.slice(0, 5).map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            {Object.values(row).map((value, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                              >
                                {typeof value === 'number' ? value.toLocaleString() : String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {inputData.data.length > 5 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Showing first 5 of {inputData.data.length} records
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Prediction Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Brain className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Prediction Results</h2>
              </div>

              {/* Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  isDragOver
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                
                <div className="space-y-3">
                  <div className="flex justify-center">
                    <Upload className={`w-8 h-8 ${isDragOver ? 'text-purple-500' : 'text-gray-400'}`} />
                  </div>
                  
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {isUploading ? 'Processing...' : 'Upload Prediction Results'}
                    </p>
                    <p className="text-gray-500">
                      Drop your prediction file here or click to browse
                    </p>
                  </div>
                  
                  <div className="text-sm text-gray-400">
                    <p>Supports: JSON or CSV files (max 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Prediction Error */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Prediction Success */}
              {predictionResult && !error && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-purple-700 font-medium">Predictions loaded successfully!</p>
                        <p className="text-purple-600 text-sm">
                          {predictionResult.fileName} ({formatFileSize(predictionResult.fileSize)}) - {predictionResult.uploadTime}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={clearPrediction}
                      className="text-purple-600 hover:text-purple-800 text-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Prediction Results Display */}
            {predictionResult && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Prediction Results
                    </h3>
                    <span className="text-sm text-gray-500">
                      {predictionResult.data.length} predictions
                    </span>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(predictionResult.data[0] || {}).map((header) => (
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
                      {predictionResult.data.map((row, rowIndex) => (
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
              </div>
            )}

            {/* Empty State */}
            {!predictionResult && (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No predictions yet</h3>
                <p className="text-gray-500">Upload your prediction results to see them here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionInterface;