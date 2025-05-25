# React File Upload Application Structure

```mermaid
graph TD
    A[App Component] --> B[State Management]
    A --> C[UI Components]
    A --> D[Event Handlers]

    B --> B1[selectedFile: File | null]
    B --> B2[fileUrl: string | null]

    C --> C1[Header]
    C --> C2[Form]
    C2 --> C2a[File Input]
    C2 --> C2b[Selected File Display]
    C2 --> C2c[Submit Button]

    D --> D1[handleFileChange]
    D --> D2[handleSubmit]
    D --> D3[handleDownload]

    D1 --> |Updates| B1
    D1 --> |Creates| B2
    D2 --> |API Call| E[Backend API]
    D3 --> |Opens| B2
```

## Component Structure

```
App
├── State
│   ├── selectedFile (File | null)
│   └── fileUrl (string | null)
│
├── Event Handlers
│   ├── handleFileChange
│   │   └── Updates selectedFile and creates fileUrl
│   ├── handleSubmit
│   │   └── Handles form submission and API call
│   └── handleDownload
│       └── Opens file URL in new tab
│
└── UI Components
    ├── Header
    │   └── Title
    └── Form
        ├── File Input
        ├── Selected File Display (Clickable)
        └── Submit Button
```

## Data Flow

1. **File Selection**
   - User selects file → `handleFileChange` triggered
   - Updates `selectedFile` state
   - Creates and stores `fileUrl` for download

2. **File Upload**
   - User clicks Submit → `handleSubmit` triggered
   - Creates FormData with selected file
   - Sends POST request to API
   - Shows success/error message

3. **File Download**
   - User clicks file name → `handleDownload` triggered
   - Opens file URL in new tab

## Styling Structure

```
App.css
├── App (Container)
├── App-header
├── file-upload-container
├── file-input
├── submit-button
└── selected-file
    └── Hover effects
``` 