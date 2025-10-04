'use client';

import { useState, useEffect } from 'react';
import { Calculator, RefreshCw, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';

interface MenuSummary {
  MenuItem: string;
  Cost: number;
  Price: number;
  'GP£': number;
  'GP%': number;
}

interface ApiResponse {
  success: boolean;
  data?: MenuSummary[];
  spreadsheetId?: string;
  publicUrl?: string;
  message?: string;
  error?: string;
}

export default function FoodCostPage() {
  const [menuData, setMenuData] = useState<MenuSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/ingest');
      const result: ApiResponse = await response.json();

      if (result.success && result.data) {
        setMenuData(result.data);
        setSpreadsheetUrl(result.publicUrl || null);
        setSuccess(result.message || 'Data loaded successfully');
        console.log('✅ Data loaded:', result.data);
      } else {
        setError(result.error || 'Failed to load data');
      }
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const initializeSpreadsheet = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'initialize' }),
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        setSpreadsheetUrl(result.publicUrl || null);
        setSuccess('Spreadsheet initialized successfully! Now fetching data...');
        // Fetch data after initialization
        setTimeout(() => fetchData(), 1000);
      } else {
        setError(result.error || 'Failed to initialize spreadsheet');
      }
    } catch (err) {
      setError('Network error: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getGPColor = (gpPercent: number) => {
    if (gpPercent >= 65) return 'text-green-600 bg-green-50';
    if (gpPercent >= 55) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getGPStatus = (gpPercent: number) => {
    if (gpPercent >= 65) return 'Excellent';
    if (gpPercent >= 55) return 'Good';
    return 'Needs Attention';
  };

  const getGPIcon = (gpPercent: number) => {
    if (gpPercent >= 65) return '🟢';
    if (gpPercent >= 55) return '🟡';
    return '🔴';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Calculator className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Wing Shack Food Cost Calculator</h1>
          </div>
          <p className="text-lg text-gray-600">
            Live GP calculations with Google Sheets integration
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Calculating...' : 'Recalculate GP'}
          </button>

          <button
            onClick={initializeSpreadsheet}
            disabled={loading}
            className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Calculator className="h-5 w-5 mr-2" />
            Initialize New Sheet
          </button>

          {spreadsheetUrl && (
            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              View Google Sheet
            </a>
          )}
        </div>

        {/* Menu Items Table */}
        {menuData.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Menu Items GP Analysis ({menuData.length} items)
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Menu Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Food Cost (£)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Selling Price (£)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GP £
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      GP %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {menuData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.MenuItem}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        £{item.Cost.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        £{item.Price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        £{item['GP£'].toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGPColor(item['GP%'])}`}>
                          {item['GP%'].toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="flex items-center">
                          <span className="mr-1">{getGPIcon(item['GP%'])}</span>
                          {getGPStatus(item['GP%'])}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Stats */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {menuData.length}
                  </div>
                  <div className="text-sm text-gray-500">Total Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {menuData.filter(item => item['GP%'] >= 65).length}
                  </div>
                  <div className="text-sm text-gray-500">Excellent GP (≥65%)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {menuData.filter(item => item['GP%'] >= 55 && item['GP%'] < 65).length}
                  </div>
                  <div className="text-sm text-gray-500">Good GP (55-65%)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {menuData.filter(item => item['GP%'] < 55).length}
                  </div>
                  <div className="text-sm text-gray-500">Needs Attention (<55%)</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-500 mb-4">
              Click "Initialize New Sheet" to create a Google Sheet with sample data, or "Recalculate GP" to load existing data.
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
          <div className="space-y-2 text-blue-800">
            <p>1. <strong>Initialize New Sheet:</strong> Creates a new Google Sheet with sample Wing Shack data</p>
            <p>2. <strong>Recalculate GP:</strong> Updates calculations from the current Google Sheet</p>
            <p>3. <strong>View Google Sheet:</strong> Opens the connected spreadsheet for editing</p>
            <p>4. <strong>Color Coding:</strong> Green (≥65%), Amber (55-65%), Red (<55%)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
