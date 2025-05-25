import React, { useState } from 'react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [parsedResult, setParsedResult] = useState<Record<string, any> | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      // Create URL for the selected file
      const fileUrl = URL.createObjectURL(file);
      setDocumentUrl(fileUrl);
      // Clear previous parsed result and form values
      setParsedResult(null);
      setFormValues({});
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('Attempting to send file:', selectedFile.name);
      
      const response = await fetch('http://localhost:8080/parse-document', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors'
      }).catch(error => {
        console.error('Network error details:', {
          message: error.message,
          cause: error.cause,
          type: error.type,
          name: error.name
        });
        throw error;
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Success:', data);
      const parsedData = data.parsed_result || {};
      setParsedResult(parsedData);
      // Initialize form values with the parsed result
      const initialValues: Record<string, string> = {};
      Object.keys(parsedData).forEach(key => {
        initialValues[key] = parsedData[key]?.toString() || '';
      });
      setFormValues(initialValues);
      alert('Document parsed successfully!');
    } catch (error: any) {
      console.error('Detailed error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      alert(`Error parsing document: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = async () => {
    if (!parsedResult) {
      alert('No parsed fields to finalize!');
      return;
    }

    setIsFinalizing(true);
    try {
      const response = await fetch('http://localhost:8080/finalize-parsed-fields', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formValues),
        mode: 'cors'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Finalization success:', data);
      alert('Fields finalized successfully!');
    } catch (error: any) {
      console.error('Finalization error:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      });
      alert(`Error finalizing fields: ${error.message}`);
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>File Upload</h1>
        <form onSubmit={handleSubmit}>
          <div className="file-upload-container">
            <input
              type="file"
              onChange={handleFileChange}
              className="file-input"
              accept=".pdf,.doc,.docx,.png,.csv"
            />
            {selectedFile && (
              <p className="selected-file">
                Selected file: {selectedFile.name}
              </p>
            )}
          </div>
          <button 
            type="submit" 
            className="parse-button"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Parse'}
          </button>
        </form>

        {documentUrl && (
          <div className="document-viewer">
            <h2>Document Preview</h2>
            {selectedFile?.type.startsWith('image/') ? (
              <img
                src={documentUrl}
                alt="Document Preview"
                className="document-image"
              />
            ) : (
              <iframe
                src={documentUrl}
                title="Document Preview"
                className="document-frame"
              />
            )}
          </div>
        )}

        {parsedResult && (
          <div className="parsed-fields">
            <h2>Parsed Fields</h2>
            <div className="fields-container">
              {Object.keys(parsedResult).map((key) => (
                <div key={key} className="field-group">
                  <label htmlFor={key} className="field-label">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                  </label>
                  <input
                    type="text"
                    id={key}
                    value={formValues[key] || ''}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    className="field-input"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleFinalize}
              className="finalize-button"
              disabled={isFinalizing}
            >
              {isFinalizing ? 'Finalizing...' : 'Finalize'}
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
