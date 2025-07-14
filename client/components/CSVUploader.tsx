import React, { useState, useCallback } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface CSVData {
  headers: string[];
  rows: string[][];
  fileName: string;
  fileSize: number;
}

interface FileValidation {
  isValid: boolean;
  error?: string;
}

const CSVUploader: React.FC = () => {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const validateFile = (file: File): FileValidation => {
    // Check file type
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      return { isValid: false, error: 'Please upload a CSV file only.' };
    }

    // Check file size (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size must be less than 10MB.' };
    }

    return { isValid: true };
  };

  const parseCSV = (csvText: string): { headers: string[]; rows: string[][] } => {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
    const rows = lines.slice(1, 11).map(line => 
      line.split(',').map(cell => cell.trim().replace(/"/g, ''))
    );

    return { headers, rows };
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
      const text = await file.text();
      const { headers, rows } = parseCSV(text);
      
      setCsvData({
        headers,
        rows,
        fileName: file.name,
        fileSize: file.size
      });
      setUploadedFile(file);
      setError(null);
    } catch (err) {
      setError('Error parsing CSV file. Please ensure it\'s properly formatted.');
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

  const handleDownload = () => {
    if (!uploadedFile) return;

    const url = URL.createObjectURL(uploadedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = uploadedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CSV Data Upload Platform
          </h1>
          <p className="text-gray-600">
            Upload your CSV files to get started with AI model training
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
              accept=".csv"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className={`w-12 h-12 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isUploading ? 'Processing...' : 'Drop your CSV file here'}
                </p>
                <p className="text-gray-500">
                  or click to browse files
                </p>
              </div>
              
              <div className="text-sm text-gray-400">
                <p>Supports: CSV files only</p>
                <p>Maximum size: 10MB</p>
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

          {/* Success Message */}
          {csvData && !error && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-green-700 font-medium">File uploaded successfully!</p>
                  <p className="text-green-600 text-sm">
                    {csvData.fileName} ({formatFileSize(csvData.fileSize)})
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>

        {/* Data Preview */}
        {csvData && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Data Preview - First 10 Rows
                  </h2>
                </div>
                <div className="text-sm text-gray-500">
                  {csvData.headers.length} columns
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {csvData.headers.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {csvData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {cell || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {csvData.rows.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                No data rows found in the CSV file.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CSVUploader;