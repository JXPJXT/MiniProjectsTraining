/**
 * DL OCR Comparison System - Frontend JavaScript
 * Handles file upload, API communication, and results display
 */

class DLOCRApp {
    constructor() {
        this.fileInput = document.getElementById('fileInput');
        this.uploadArea = document.getElementById('uploadArea');
        this.processBtn = document.getElementById('processBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.gtToggle = document.getElementById('gtToggle');
        this.gtFields = document.getElementById('gtFields');
        this.selectedFile = null;

        this.init();
    }

    init() {
        this.setupNavbar();
        this.setupUploadArea();
        this.setupGroundTruth();
        this.setupProcessButton();
        this.setupHistoryRefresh();
        this.loadHistory();
        this.loadStats();
    }

    setupNavbar() {
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Show target view
                const viewId = btn.getAttribute('data-view');
                document.querySelectorAll('.view-section').forEach(view => {
                    view.classList.remove('active');
                });
                document.getElementById(`${viewId}-view`).classList.add('active');

                // Refresh data if history view
                if (viewId === 'history') {
                    this.loadHistory();
                }
            });
        });
    }

    setupUploadArea() {
        const area = this.uploadArea;

        // Click to upload
        area.addEventListener('click', () => this.fileInput.click());

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Drag and drop
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.add('dragover');
        });

        area.addEventListener('dragleave', () => {
            area.classList.remove('dragover');
        });

        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this.handleFileSelect(e.dataTransfer.files[0]);
            }
        });
    }

    handleFileSelect(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showError('Please select an image file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            this.showError('File size exceeds 5MB limit');
            return;
        }

        this.selectedFile = file;
        this.uploadArea.classList.add('has-file');
        this.uploadArea.querySelector('.upload-text').innerHTML =
            `Selected: <strong>${file.name}</strong>`;
        this.processBtn.disabled = false;
    }

    setupGroundTruth() {
        this.gtToggle.addEventListener('change', () => {
            this.gtFields.style.display = this.gtToggle.checked ? 'block' : 'none';
        });
    }

    setupProcessButton() {
        this.processBtn.addEventListener('click', () => this.processImage());
    }

    setupHistoryRefresh() {
        document.getElementById('refreshHistory').addEventListener('click', () => {
            this.loadHistory();
        });
    }

    getGroundTruth() {
        if (!this.gtToggle.checked) return null;

        const gt = {
            name: document.getElementById('gtName').value.trim(),
            date_of_birth: document.getElementById('gtDob').value.trim(),
            license_number: document.getElementById('gtLicense').value.trim(),
            issued_by: document.getElementById('gtIssuedBy').value.trim(),
            date_of_issue: document.getElementById('gtDoi').value.trim(),
            date_of_expiry: document.getElementById('gtDoe').value.trim(),
            blood_group: document.getElementById('gtBlood').value.trim(),
            vehicle_class: document.getElementById('gtVehicle').value.trim()
        };

        // Only return if at least one field has value
        const hasValues = Object.values(gt).some(v => v.length > 0);
        return hasValues ? gt : null;
    }

    async processImage() {
        if (!this.selectedFile) return;

        // Show loading state
        this.processBtn.classList.add('loading');
        this.processBtn.disabled = true;
        this.resultsSection.style.display = 'block';
        document.getElementById('processingIndicator').classList.add('active');

        // Scroll to results
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });

        try {
            const formData = new FormData();
            formData.append('file', this.selectedFile);
            formData.append('use_vlm', 'true');

            const groundTruth = this.getGroundTruth();
            if (groundTruth) {
                formData.append('ground_truth', JSON.stringify(groundTruth));
            }

            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Upload failed');
            }

            const result = await response.json();
            this.displayResults(result);
            this.loadStats(); // Update stats

        } catch (error) {
            this.showError(error.message);
        } finally {
            this.processBtn.classList.remove('loading');
            this.processBtn.disabled = false;
            document.getElementById('processingIndicator').classList.remove('active');
        }
    }

    displayResults(result) {
        // Show image preview
        const previewImg = document.getElementById('previewImg');
        previewImg.src = `data:image/jpeg;base64,${result.image_base64}`;
        document.getElementById('imagePreview').style.display = 'block';

        // Display accuracy bars
        const acc1 = result.accuracy?.approach1?.accuracy_percent || 0;
        const acc2 = result.accuracy?.approach2?.accuracy_percent || 0;

        document.getElementById('acc1Bar').style.width = `${acc1}%`;
        document.getElementById('acc1Value').textContent = `${acc1.toFixed(1)}%`;
        document.getElementById('acc2Bar').style.width = `${acc2}%`;
        document.getElementById('acc2Value').textContent = `${acc2.toFixed(1)}%`;

        // Winner badge
        const winner = result.accuracy?.comparison?.winner || 'No comparison';
        document.getElementById('winnerText').textContent = `Winner: ${winner}`;
        document.getElementById('accuracySection').style.display = 'block';

        // Populate approach tables
        this.populateTable('approach1Table', result.approach1.fields);
        this.populateTable('approach2Table', result.approach2.fields);

        // Processing info
        document.getElementById('processingTime').textContent =
            `${result.processing_time_ms}ms`;
        document.getElementById('resultId').textContent = `#${result.result_id}`;
    }

    populateTable(tableId, fields) {
        const tbody = document.querySelector(`#${tableId} tbody`);
        tbody.innerHTML = '';

        const fieldLabels = {
            name: 'Name',
            date_of_birth: 'Date of Birth',
            license_number: 'License Number',
            issued_by: 'Issued By',
            date_of_issue: 'Date of Issue',
            date_of_expiry: 'Date of Expiry',
            address: 'Address',
            blood_group: 'Blood Group',
            vehicle_class: 'Vehicle Class'
        };

        for (const [key, label] of Object.entries(fieldLabels)) {
            const value = fields[key] || '-';
            const row = document.createElement('tr');
            row.innerHTML = `<td>${label}</td><td>${this.escapeHtml(value)}</td>`;
            tbody.appendChild(row);
        }
    }

    async loadHistory() {
        try {
            // Fetch 50 results
            const response = await fetch('/results?limit=50');
            const data = await response.json();

            const historyList = document.getElementById('historyList');

            if (!data.results || data.results.length === 0) {
                historyList.innerHTML = '<p class="empty-history">No results found.</p>';
                return;
            }

            historyList.innerHTML = data.results.map(item => {
                const timestamp = new Date(item.timestamp).toLocaleString();
                const acc1 = item.approach1_accuracy?.toFixed(1) || '0';
                const acc2 = item.approach2_accuracy?.toFixed(1) || '0';

                return `
                    <div class="history-item">
                        <div class="history-header">
                            <div class="history-info">
                                <span class="history-name">${this.escapeHtml(item.image_name)}</span>
                                <span class="history-time">${timestamp}</span>
                            </div>
                        </div>
                        <div class="history-accuracy">
                            <span><span class="acc-dot a1"></span>A1: ${acc1}%</span>
                            <span><span class="acc-dot a2"></span>A2: ${acc2}%</span>
                        </div>
                        <div class="history-actions">
                            <button class="delete-btn" onclick="window.app.deleteResult(${item.id})">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

        } catch (error) {
            console.error('Failed to load history:', error);
        }
    }

    async deleteResult(id) {
        if (!confirm('Are you sure you want to delete this result?')) return;

        try {
            const response = await fetch(`/results/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Refresh list
                this.loadHistory();
                this.loadStats();
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            this.showError('Could not delete result');
        }
    }

    async loadStats() {
        try {
            const response = await fetch('/stats');
            const data = await response.json();

            if (data.statistics) {
                document.getElementById('totalProcessed').textContent =
                    data.statistics.total_processed;
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    showError(message) {
        alert(`Error: ${message}`);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DLOCRApp();
});
