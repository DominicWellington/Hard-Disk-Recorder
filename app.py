import os
from flask import Flask, request, redirect, url_for, render_template, flash, session, send_file
from pymongo import MongoClient
from io import BytesIO
from datetime import datetime
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from dotenv import load_dotenv
import certifi

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key-here')

# Connect to MongoDB Atlas with SSL certificate
mongo_uri = os.environ.get('MONGODB_URI')
if not mongo_uri:
    raise ValueError("MONGODB_URI environment variable is not set. Please check your .env file.")

client = MongoClient(mongo_uri, tlsCAFile=certifi.where())
db = client["Harddisk"]
users_collection = db["Logindata"]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/signup', methods=['POST'])
def signup():
    username = request.form.get('username')
    email = request.form.get('email')
    password = request.form.get('password')
    
    # Check if user already exists
    if users_collection.find_one({'username': username}):
        flash('Username already exists', 'error')
        return redirect(url_for('index'))
    
    if users_collection.find_one({'email': email}):
        flash('Email already exists', 'error')
        return redirect(url_for('index'))
    
    # Create user
    users_collection.insert_one({
        'username': username,
        'email': email,
        'password': password
    })
    
    flash('Registration successful! Please login.', 'success')
    return redirect(url_for('index'))

@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')
    
    # Find user
    user = users_collection.find_one({'username': username})
    
    if not user:
        flash('Invalid username or password', 'error')
        return redirect(url_for('index'))
    
    # Check password
    if user['password'] == password:
        session['username'] = username
        flash(f'Welcome {username}!', 'success')
        return redirect(url_for('dashboard'))
    else:
        flash('Invalid username or password', 'error')
        return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    if 'username' not in session:
        return redirect(url_for('index'))
    
    # Get all reports from database
    reports_collection = db["Reports"]
    reports = list(reports_collection.find().sort('_id', -1))  # Get all reports, newest first
    
    # Count branches from the predefined dropdown list (updated with all branches)
    branches = [
        "ACCRA CENTRAL", "ABBOSEY OKAI", "ABEAKA LAPAZ", "ABOABO", "ADENTA", 
        "ADUM", "AIRPORT CITY", "AFFUL NKWANTA", "ATONSU", "CANTONMENT", 
        "CAPE COAST", "EAST LEGON", "GICEL ESTATE", "HAATSO", "KUMASI", "MADINA",
        "MAKOLA", "METHODIST UNIVERSITY", "NUNGUA", "ODORKOR", "OKAISHI", 
        "RING ROAD CENTRAL", "SANTASI", "SPINTEX", "SUAME MAAKRO", "SUNYANI", 
        "TAIFA", "TAKORADI HARBOUR", "TAMALE", "TAKORADI MARKET", "TECHIMAN", 
        "TEMA COMMUNITY 1", "TEMA FISHING HARBOUR", "TESANO", "UCC ANNEX", 
        "UNIVERSITY OF GHANA", "VALLEY VIEW", "WEIJA"
    ]
    branch_count = len(branches)
    
    return render_template('dashboard.html', 
                         username=session['username'], 
                         reports=reports,
                         branch_count=branch_count)

@app.route('/report')
def report():
    if 'username' not in session:
        return redirect(url_for('index'))
    return render_template('report.html', username=session['username'])

@app.route('/submit-report', methods=['POST'])
def submit_report():
    if 'username' not in session:
        return redirect(url_for('index'))
    
    branch = request.form.get('branch')
    start_date = request.form.get('start_date')
    end_date = request.form.get('end_date')
    drive1 = request.form.get('drive1')
    drive2 = request.form.get('drive2')
    previous_branch = request.form.get('previous_branch')
    previous_data_from = request.form.get('previous_data_from')
    previous_data_to = request.form.get('previous_data_to')
    
    # Save report to database
    reports_collection = db["Reports"]
    reports_collection.insert_one({
        'username': session['username'],
        'branch': branch,
        'start_date': start_date,
        'end_date': end_date,
        'drive1': drive1,
        'drive2': drive2,
        'previous_branch': previous_branch,
        'previous_data_from': previous_data_from,
        'previous_data_to': previous_data_to
    })
    
    flash('Report submitted successfully!', 'success')
    return redirect(url_for('dashboard'))

@app.route('/edit-report/<report_id>')
def edit_report(report_id):
    if 'username' not in session:
        return redirect(url_for('index'))
    
    from bson import ObjectId
    try:
        # Get the specific report
        reports_collection = db["Reports"]
        report = reports_collection.find_one({'_id': ObjectId(report_id)})
        
        if not report:
            flash('Report not found', 'error')
            return redirect(url_for('dashboard'))
        
        # Check if user owns this report or is admin (for now, let anyone edit)
        # if report['username'] != session['username']:
        #     flash('You can only edit your own reports', 'error')
        #     return redirect(url_for('dashboard'))
        
        return render_template('edit_report.html', username=session['username'], report=report)
    
    except Exception as e:
        flash('Invalid report ID', 'error')
        return redirect(url_for('dashboard'))

@app.route('/update-report/<report_id>', methods=['POST'])
def update_report(report_id):
    if 'username' not in session:
        return redirect(url_for('index'))
    
    from bson import ObjectId
    try:
        branch = request.form.get('branch')
        start_date = request.form.get('start_date')
        end_date = request.form.get('end_date')
        drive1 = request.form.get('drive1')
        drive2 = request.form.get('drive2')
        previous_branch = request.form.get('previous_branch')
        previous_data_from = request.form.get('previous_data_from')
        previous_data_to = request.form.get('previous_data_to')
        
        # Update report in database
        reports_collection = db["Reports"]
        result = reports_collection.update_one(
            {'_id': ObjectId(report_id)},
            {'$set': {
                'branch': branch,
                'start_date': start_date,
                'end_date': end_date,
                'drive1': drive1,
                'drive2': drive2,
                'previous_branch': previous_branch,
                'previous_data_from': previous_data_from,
                'previous_data_to': previous_data_to,
                'updated_at': datetime.now().isoformat()
            }}
        )
        
        if result.modified_count > 0:
            flash('Report updated successfully!', 'success')
        else:
            flash('No changes were made to the report', 'info')
        
        return redirect(url_for('dashboard'))
    
    except Exception as e:
        flash('Error updating report', 'error')
        return redirect(url_for('dashboard'))

@app.route('/logout')
def logout():
    session.pop('username', None)
    flash('You have been logged out', 'success')
    return redirect(url_for('index'))
def export_excel():
    if 'username' not in session:
        return redirect(url_for('index'))
    
    # Get all reports
    reports_collection = db["Reports"]
    reports = list(reports_collection.find({}, {'_id': 0}))
    
    if not reports:
        flash('No reports to export', 'error')
        return redirect(url_for('dashboard'))
    
    # Create DataFrame
    df = pd.DataFrame(reports)
    
    # Reorder columns
    column_order = ['username', 'branch', 'start_date', 'end_date', 'drive1', 'drive2', 
                    'previous_branch', 'previous_data_from', 'previous_data_to']
    df = df[column_order]
    
    # Rename columns for better readability
    df.columns = ['User', 'Branch', 'Start Date', 'End Date', 'Drive 1', 'Drive 2', 
                  'Previous Branch', 'Previous HDD From', 'Previous HDD To']
    
    # Create Excel file in memory
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Reports')
        
        # Auto-adjust column widths
        worksheet = writer.sheets['Reports']
        for idx, col in enumerate(df.columns):
            max_length = max(df[col].astype(str).apply(len).max(), len(col)) + 2
            worksheet.column_dimensions[chr(65 + idx)].width = max_length
    
    output.seek(0)
    
    # Generate filename with timestamp
    filename = f'reports_{datetime.now().strftime("%Y%m%d_%H%M%S")}.xlsx'
    
    return send_file(output, 
                     mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                     as_attachment=True,
                     download_name=filename)

@app.route('/export/pdf')
def export_pdf():
    if 'username' not in session:
        return redirect(url_for('index'))
    
    # Get all reports
    reports_collection = db["Reports"]
    reports = list(reports_collection.find({}, {'_id': 0}))
    
    if not reports:
        flash('No reports to export', 'error')
        return redirect(url_for('dashboard'))
    
    # Create PDF in memory
    output = BytesIO()
    doc = SimpleDocTemplate(output, pagesize=landscape(letter))
    elements = []
    
    # Add title
    styles = getSampleStyleSheet()
    title = Paragraph("<b>Hard Disk Reports</b>", styles['Title'])
    elements.append(title)
    elements.append(Spacer(1, 20))
    
    # Prepare table data
    data = [['User', 'Branch', 'Start Date', 'End Date', 'Drive 1', 'Drive 2', 
             'Previous Branch', 'HDD From', 'HDD To']]
    
    for report in reports:
        data.append([
            report.get('username', ''),
            report.get('branch', ''),
            report.get('start_date', ''),
            report.get('end_date', ''),
            report.get('drive1', ''),
            report.get('drive2', ''),
            report.get('previous_branch', ''),
            report.get('previous_data_from', ''),
            report.get('previous_data_to', '')
        ])
    
    # Create table
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
    ]))
    
    elements.append(table)
    doc.build(elements)
    
    output.seek(0)
    
    # Generate filename with timestamp
    filename = f'reports_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf'
    
    return send_file(output,
                     mimetype='application/pdf',
                     as_attachment=True,
                     download_name=filename)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
