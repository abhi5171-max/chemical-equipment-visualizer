
# Chemical Equipment Parameter Visualizer

A hybrid Web + Desktop system with a shared secure Django API.

## 🔐 Security Features
- **JWT Authentication**: Secure stateless authentication using `simplejwt`.
- **Protected Routes**: React router guards for dashboard access.
- **Guest Access**: Zero-commitment visualization mode with temporary sessions.
- **Data Integrity**: Automated CSV validation for required chemical parameters.

## Setup Instructions

## Visualizing the Application

### 1. Web Version (React)
The web interface features interactive **Chart.js** dashboards with Radar, Bar, and Multi-axis Line charts.
- **Run**: `npm install`
- **Run**: `npm run dev`

### 2. Desktop Version (PyQt5)
The desktop application is a high-performance native tool using **Matplotlib** for scientific-grade plotting.
- **Appearance**: Dark-themed Carbon UI with sidebar navigation.
- **Run Locally**:
  ```bash
  # Install Desktop Prerequisites
  pip install PyQt5 matplotlib pandas requests
  
  # Run the application
  python desktop/main.py
  ```
- **Visuals**: Scientific subplots including Scatter Correlation, Distribution Bar Charts, and Real-time Throughput trends.

## Technical Architecture
- **Backend**: Django REST Framework + Pandas + ReportLab.
- **Analytics**: Real-time summary statistics calculated per upload.
- **Persistence**: SQLite keeps the 5 most recent production snapshots.

## Database Schema
- `Dataset`: Stores file metadata and summary averages.
- `Equipment`: Stores specific unit parameters (Flow, Pressure, Temp).

## File Schema
| Column | Description | Unit |
|---|---|---|
| Equipment Name | Unique identifier | - |
| Equipment Type | Category (e.g., Reactor) | - |
| Flowrate | Volumetric Throughput | m3/h |
| Pressure | Gauge Pressure | bar |
| Temperature | Process Temperature | K |


## 📋 Default Credentials
| User Type | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` |
| **Guest** | `guest` | `guest123` |

## 📁 Dataset Requirements
The CSV must contain exactly these headers:
`Equipment Name, Type, Flowrate, Pressure, Temperature`
=======
# chemical-equipment-visualizer
Hybrid Web + Desktop application for visualizing and analyzing chemical equipment parameters. Built using Django REST API + Pandas backend, React + Chart.js web frontend, and PyQt5 + Matplotlib desktop frontend. Supports CSV upload, summary analytics, charts, dataset history (last 5 uploads), PDF report generation, and basic authentication.
>>>>>>> 5a6bc82a474c1d677c0578140ddfc0532dcdb621
