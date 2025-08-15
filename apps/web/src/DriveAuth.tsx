import React, { useState, useCallback } from 'react';

// Google Drive API configuration
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

interface DriveAuthProps {
  onAuthChange?: (isAuthenticated: boolean) => void;
}

interface DriveFile {
  id?: string;
  name: string;
  content: string;
  mimeType?: string;
}

export const DriveAuth: React.FC<DriveAuthProps> = ({ onAuthChange }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Initialize Google API
  const initializeGapi = useCallback(async () => {
    try {
      // Note: This requires GOOGLE_CLIENT_ID to be set in environment variables
      // For now, we'll show a placeholder that requires manual configuration
      const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';
      
      if (CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
        setError('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment.');
        return;
      }

      await new Promise<void>((resolve) => {
        (window as any).gapi.load('auth2', resolve);
      });

      await (window as any).gapi.auth2.init({
        client_id: CLIENT_ID,
        scope: SCOPES
      });

      const authInstance = (window as any).gapi.auth2.getAuthInstance();
      const isSignedIn = authInstance.isSignedIn.get();
      
      setIsAuthenticated(isSignedIn);
      setIsInitialized(true);
      onAuthChange?.(isSignedIn);
      
    } catch (err) {
      console.error('Error initializing Google API:', err);
      setError('Failed to initialize Google Drive API');
    }
  }, [onAuthChange]);

  // Sign in to Google Drive
  const signIn = useCallback(async () => {
    try {
      if (!isInitialized) {
        await initializeGapi();
      }

      const authInstance = (window as any).gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      setIsAuthenticated(true);
      setError(null);
      onAuthChange?.(true);
      
      console.log('Signed in as:', user.getBasicProfile().getName());
    } catch (err) {
      console.error('Error signing in:', err);
      setError('Failed to sign in to Google Drive');
    }
  }, [isInitialized, initializeGapi, onAuthChange]);

  // Sign out from Google Drive
  const signOut = useCallback(async () => {
    try {
      const authInstance = (window as any).gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      
      setIsAuthenticated(false);
      onAuthChange?.(false);
      setError(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out');
    }
  }, [onAuthChange]);

  // Upload file to Google Drive
  const uploadToDriveInternal = useCallback(async (file: DriveFile) => {
    if (!isAuthenticated) {
      setError('Please sign in to Google Drive first');
      return null;
    }

    setIsUploading(true);
    setUploadStatus('Uploading to Google Drive...');
    setError(null);

    try {
      // Load the Drive API
      await new Promise<void>((resolve) => {
        (window as any).gapi.load('client', resolve);
      });

      await (window as any).gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
      });

      // Create file metadata
      const fileMetadata = {
        name: file.name,
        parents: ['appDataFolder'] // Store in app data folder for privacy
      };

      // Convert content to blob
      const blob = new Blob([file.content], { type: file.mimeType || 'text/plain' });
      
      // Create form data for multipart upload
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      form.append('file', blob);

      const accessToken = (window as any).gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
      
      // Upload using fetch API for better control
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: form
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      setUploadStatus(`File uploaded successfully! File ID: ${result.id}`);
      
      console.log('File uploaded successfully:', result);
      return result;
      
    } catch (err) {
      console.error('Error uploading to Drive:', err);
      setError('Failed to upload file to Google Drive');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [isAuthenticated]);

  // Test function to upload a sample report
  const testUpload = useCallback(async () => {
    const testReport = {
      name: `finance-report-test-${new Date().toISOString().slice(0, 19)}.json`,
      content: JSON.stringify({
        reportType: 'test',
        generatedAt: new Date().toISOString(),
        data: {
          totalTransactions: 150,
          totalAmount: 25000,
          categories: {
            'Food & Dining': 5000,
            'Transportation': 3000,
            'Shopping': 7000,
            'Bills & Utilities': 4000,
            'Entertainment': 2000,
            'Healthcare': 1500,
            'Other': 2500
          }
        }
      }, null, 2),
      mimeType: 'application/json'
    };

    await uploadToDriveInternal(testReport);
  }, [uploadToDriveInternal]);

  // Initialize on component mount
  React.useEffect(() => {
    // Load Google API script if not already loaded
    if (typeof (window as any).gapi === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => initializeGapi();
      document.body.appendChild(script);
    } else {
      initializeGapi();
    }
  }, [initializeGapi]);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Google Drive Integration</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {uploadStatus && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="text-sm">{uploadStatus}</p>
        </div>
      )}

      <div className="space-y-4">
        {!isAuthenticated ? (
          <div>
            <p className="text-gray-600 mb-3 text-sm">
              Connect your Google Drive to backup and sync your financial reports.
            </p>
            <button
              onClick={signIn}
              disabled={!isInitialized}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
            >
              {isInitialized ? 'Sign in to Google Drive' : 'Initializing...'}
            </button>
          </div>
        ) : (
          <div>
            <p className="text-green-600 mb-3 text-sm font-medium">
              ✓ Connected to Google Drive
            </p>
            
            <div className="space-y-3">
              <button
                onClick={testUpload}
                disabled={isUploading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
              >
                {isUploading ? 'Uploading...' : 'Test Upload Report'}
              </button>
              
              <button
                onClick={signOut}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-xs text-gray-500">
        This component handles Google Drive OAuth authentication and file upload for backup functionality.
      </div>
    </div>
  );
};

export default DriveAuth;

// Export utility functions for use in other components
export { uploadToDriveInternal as uploadFileToDrive };

// Type exports
export type { DriveFile, DriveAuthProps };
