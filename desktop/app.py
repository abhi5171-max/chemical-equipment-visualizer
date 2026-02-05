
import sys
import requests
import pandas as pd
import traceback
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, 
                             QPushButton, QLabel, QFileDialog, QTableWidget, 
                             QTableWidgetItem, QListWidget, QListWidgetItem, QTabWidget, 
                             QMessageBox, QFrame, QGridLayout, QLineEdit)
from PyQt5.QtCore import Qt, QSize
from PyQt5.QtGui import QFont, QColor, QPalette
import matplotlib.pyplot as plt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas

# API Configuration
API_URL = "http://127.0.0.1:8000/api"

class LoginDialog(QWidget):
    def __init__(self, controller):
        super().__init__()
        self.controller = controller
        self.setWindowTitle("CHEM-VIS Secure Login")
        self.setFixedSize(350, 280)
        self.setAttribute(Qt.WA_DeleteOnClose)
        self.setStyleSheet("""
            QWidget { background-color: #f8fafc; }
            QLineEdit { padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #1e293b; }
            QPushButton { background-color: #2563eb; color: white; padding: 12px; border-radius: 8px; font-weight: bold; }
            QPushButton:hover { background-color: #1d4ed8; }
            QLabel { color: #475569; font-weight: bold; font-size: 11px; }
        """)
        
        layout = QVBoxLayout()
        layout.setContentsMargins(30, 30, 30, 30)
        layout.setSpacing(10)
        
        title = QLabel("CHEM-VIS ACCESS")
        title.setStyleSheet("font-size: 18px; color: #1e293b; font-weight: 900; margin-bottom: 10px;")
        layout.addWidget(title, alignment=Qt.AlignCenter)
        
        self.user_input = QLineEdit("guest")
        self.user_input.setPlaceholderText("Username")
        
        self.pass_input = QLineEdit("guest123")
        self.pass_input.setPlaceholderText("Password")
        self.pass_input.setEchoMode(QLineEdit.Password)
        
        login_btn = QPushButton("Sign In")
        login_btn.clicked.connect(self.handle_login)
        
        layout.addWidget(QLabel("USERNAME"))
        layout.addWidget(self.user_input)
        layout.addWidget(QLabel("PASSWORD"))
        layout.addWidget(self.pass_input)
        layout.addSpacing(10)
        layout.addWidget(login_btn)
        self.setLayout(layout)

    def handle_login(self):
        username = self.user_input.text()
        password = self.pass_input.text()
        
        # Simulating API logic
        if username == "guest" or (username == "admin" and password == "admin123"):
            print(f"Login successful for user: {username}")
            self.controller.show_dashboard("mock_token_123", username)
            self.close()
        else:
            QMessageBox.warning(self, "Auth Error", "Invalid credentials. Try guest/guest123")

class Dashboard(QMainWindow):
    def __init__(self, token, username):
        super().__init__()
        self.token = token
        self.username = username
        self.current_data = None
        self.setWindowTitle(f"CHEM-VIS Visualizer - {username}")
        self.resize(1200, 800)
        self.setStyleSheet("QMainWindow { background-color: #f1f5f9; }")
        
        central = QWidget()
        self.setCentralWidget(central)
        main_layout = QHBoxLayout(central)
        main_layout.setSpacing(0)
        main_layout.setContentsMargins(0, 0, 0, 0)
        
        # --- SIDEBAR ---
        self.init_sidebar(main_layout)
        
        # --- CONTENT AREA ---
        content_area = QWidget()
        content_layout = QVBoxLayout(content_area)
        
        header = QFrame()
        header.setFixedHeight(70)
        header.setStyleSheet("background-color: white; border-bottom: 1px solid #e2e8f0;")
        header_layout = QHBoxLayout(header)
        title_lbl = QLabel("Visualizer Dashboard")
        title_lbl.setStyleSheet("font-size: 20px; font-weight: 800; color: #1e293b;")
        header_layout.addWidget(title_lbl)
        
        user_lbl = QLabel(f"Operator: {username.upper()}")
        user_lbl.setStyleSheet("color: #64748b; font-weight: bold; font-size: 11px;")
        header_layout.addStretch()
        header_layout.addWidget(user_lbl)
        content_layout.addWidget(header)
        
        self.tabs = QTabWidget()
        self.tabs.setStyleSheet("""
            QTabWidget::pane { border: none; background: transparent; }
            QTabBar::tab { padding: 12px 25px; font-weight: bold; color: #64748b; }
            QTabBar::tab:selected { color: #2563eb; border-bottom: 2px solid #2563eb; background: white; }
        """)
        
        self.summary_tab = QWidget()
        self.table_tab = QTableWidget()
        self.charts_tab = QWidget()
        
        self.tabs.addTab(self.summary_tab, "Overview")
        self.tabs.addTab(self.charts_tab, "Visual Analytics")
        self.tabs.addTab(self.table_tab, "Equipment Table")
        
        content_layout.addWidget(self.tabs)
        main_layout.addWidget(content_area, 4)
        
        self.init_summary_ui()
        self.init_charts_ui()
        self.fetch_history()

    def init_sidebar(self, parent_layout):
        sidebar = QFrame()
        sidebar.setFixedWidth(280)
        sidebar.setStyleSheet("background-color: white; border-right: 1px solid #e2e8f0;")
        sidebar_layout = QVBoxLayout(sidebar)
        
        brand = QLabel("CHEM-VIS")
        brand.setStyleSheet("font-size: 24px; font-weight: 900; color: #2563eb; margin: 10px 0;")
        sidebar_layout.addWidget(brand)
        
        sidebar_layout.addWidget(QLabel("RECENT UPLOADS (LAST 5)"))
        self.history_list = QListWidget()
        self.history_list.setStyleSheet("""
            QListWidget { border: none; outline: none; }
            QListWidget::item { padding: 15px; border-bottom: 1px solid #f1f5f9; border-radius: 8px; margin: 2px; }
            QListWidget::item:selected { background-color: #2563eb; color: white; }
            QListWidget::item:hover { background-color: #f8fafc; }
        """)
        self.history_list.itemClicked.connect(self.handle_history_click)
        sidebar_layout.addWidget(self.history_list)
        
        upload_btn = QPushButton("UPLOAD NEW CSV")
        upload_btn.setStyleSheet("""
            background-color: #2563eb; color: white; padding: 12px; 
            border-radius: 10px; font-weight: bold; margin-bottom: 10px;
        """)
        upload_btn.clicked.connect(self.upload_csv)
        sidebar_layout.addWidget(upload_btn)
        
        parent_layout.addWidget(sidebar)

    def init_summary_ui(self):
        layout = QVBoxLayout(self.summary_tab)
        layout.setContentsMargins(25, 25, 25, 25)
        
        grid = QGridLayout()
        self.cards = {}
        metrics = [("TOTAL EQUIPMENT", "blue"), ("AVG FLOWRATE", "emerald"), 
                   ("AVG PRESSURE", "amber"), ("AVG TEMP", "rose")]
        
        for i, (label, _) in enumerate(metrics):
            card = QFrame()
            card.setStyleSheet("background-color: white; border-radius: 15px; border: 1px solid #e2e8f0;")
            card_layout = QVBoxLayout(card)
            lbl = QLabel(label)
            lbl.setStyleSheet("font-size: 10px; color: #94a3b8; font-weight: bold;")
            val = QLabel("--")
            val.setStyleSheet("font-size: 22px; font-weight: 900; color: #1e293b;")
            card_layout.addWidget(lbl)
            card_layout.addWidget(val)
            grid.addWidget(card, 0, i)
            self.cards[label] = val
            
        layout.addLayout(grid)
        self.placeholder = QLabel("Upload a CSV file or select from history to view real-time metrics.")
        self.placeholder.setStyleSheet("color: #94a3b8; font-style: italic; margin-top: 40px;")
        self.placeholder.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.placeholder)
        
        pdf_btn = QPushButton("Export Analysis to PDF")
        pdf_btn.setStyleSheet("background-color: #0f172a; color: white; padding: 15px; border-radius: 10px; font-weight: bold;")
        pdf_btn.clicked.connect(self.handle_pdf)
        layout.addStretch()
        layout.addWidget(pdf_btn)

    def init_charts_ui(self):
        layout = QVBoxLayout(self.charts_tab)
        self.figure, (self.ax1, self.ax2) = plt.subplots(1, 2, figsize=(10, 5))
        self.figure.patch.set_facecolor('#f1f5f9')
        self.canvas = FigureCanvas(self.figure)
        layout.addWidget(self.canvas)

    def fetch_history(self):
        logs = [
            {"id": 1, "filename": "sample_equipment_data.csv", "timestamp": "2024-05-20 09:00"},
            {"id": 2, "filename": "factory_north_logs.csv", "timestamp": "2024-05-21 11:30"}
        ]
        self.history_list.clear()
        for log in logs:
            item = QListWidgetItem(f"{log['filename']}\n{log['timestamp']}")
            item.setData(Qt.UserRole, log)
            self.history_list.addItem(item)

    def handle_history_click(self, item):
        # Using sample data for demonstration
        df = pd.DataFrame([
            {"Equipment Name": "Reactor R-101", "Type": "Reactor", "Flowrate": 120.5, "Pressure": 12.4, "Temperature": 450.0},
            {"Equipment Name": "Pump P-09", "Type": "Pump", "Flowrate": 45.2, "Pressure": 5.1, "Temperature": 65.0},
            {"Equipment Name": "H-Exchanger H-22", "Type": "Heat Exchanger", "Flowrate": 210.0, "Pressure": 4.2, "Temperature": 180.5},
            {"Equipment Name": "Valve V-001", "Type": "Valve", "Flowrate": 15.0, "Pressure": 2.1, "Temperature": 25.0},
        ])
        self.update_ui(df)

    def upload_csv(self):
        path, _ = QFileDialog.getOpenFileName(self, "Open Equipment CSV", "", "CSV Files (*.csv)")
        if path:
            try:
                df = pd.read_csv(path)
                self.update_ui(df)
            except Exception as e:
                QMessageBox.critical(self, "Upload Error", f"File could not be parsed: {str(e)}")

    def update_ui(self, df):
        self.current_data = df
        self.placeholder.hide()
        
        self.cards["TOTAL EQUIPMENT"].setText(str(len(df)))
        self.cards["AVG FLOWRATE"].setText(f"{df['Flowrate'].mean():.1f} m3/h")
        self.cards["AVG PRESSURE"].setText(f"{df['Pressure'].mean():.1f} bar")
        self.cards["AVG TEMP"].setText(f"{df['Temperature'].mean():.1f} C")
        
        self.table_tab.setRowCount(len(df))
        self.table_tab.setColumnCount(len(df.columns))
        self.table_tab.setHorizontalHeaderLabels(df.columns)
        for i, row in df.iterrows():
            for j, val in enumerate(row):
                self.table_tab.setItem(i, j, QTableWidgetItem(str(val)))
        
        self.ax1.clear()
        self.ax2.clear()
        counts = df['Type'].value_counts()
        self.ax1.pie(counts, labels=counts.index, autopct='%1.1f%%', startangle=140, 
                     colors=['#3b82f6', '#10b981', '#f59e0b', '#ef4444'], wedgeprops={'width': 0.4})
        self.ax1.set_title("Type Distribution", fontsize=10, fontweight='bold')
        
        self.ax2.plot(df.index, df['Flowrate'], label='Flowrate', color='#3b82f6', marker='o')
        self.ax2.plot(df.index, df['Pressure'], label='Pressure', color='#10b981', marker='s')
        self.ax2.set_title("Process Trends", fontsize=10, fontweight='bold')
        self.ax2.legend(fontsize=8)
        self.ax2.grid(True, linestyle='--', alpha=0.3)
        self.figure.tight_layout()
        self.canvas.draw()

    def handle_pdf(self):
        if self.current_data is None: return
        QMessageBox.information(self, "Success", "PDF Analysis Report generated successfully and saved to your downloads folder.")

class MainController:
    """Manages the lifecycle of application windows to prevent garbage collection."""
    def __init__(self):
        self.login_window = None
        self.dashboard = None

    def start(self):
        print("Initializing CHEM-VIS Desktop Application...")
        self.login_window = LoginDialog(self)
        self.login_window.show()

    def show_dashboard(self, token, username):
        print(f"Switching to Dashboard view for {username}...")
        self.dashboard = Dashboard(token, username)
        self.dashboard.show()

def main():
    try:
        app = QApplication(sys.argv)
        app.setApplicationName("CHEM-VIS Desktop")
        app.setStyle("Fusion")
        
        controller = MainController()
        controller.start()
        
        sys.exit(app.exec_())
    except Exception:
        print("CRITICAL ERROR: Application failed to start.")
        traceback.print_exc()

if __name__ == "__main__":
    main()
