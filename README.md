<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>פלטפורמת הזמנת דוגמאות</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 10px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(45deg, #2E7D7D, #1B5858);
            color: white;
            padding: 20px;
            text-align: center;
        }

        .header h1 {
            font-size: 3rem;
            margin-bottom: 15px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .header h2 {
            font-size: 1.8rem;
            margin-bottom: 10px;
        }

        .header p {
            font-size: 1rem;
            opacity: 0.9;
        }

        .main-content {
            padding: 20px;
        }

        .form-section {
            background: #f8f9ff;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid #e1e8ff;
        }

        .header-form {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
        }

        .form-group {
            display: flex;
            flex-direction: column;
        }

        .form-group label {
            font-weight: bold;
            margin-bottom: 8px;
            color: #2E7D7D;
            font-size: 1rem;
        }

        .form-group input,
        .form-group select {
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
            background: white;
        }

        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: #2E7D7D;
            box-shadow: 0 0 0 3px rgba(46, 125, 125, 0.1);
            transform: translateY(-1px);
        }

        .products-section {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin: 25px 0;
            border: 2px solid #2E7D7D;
        }

        .products-title {
            font-size: 1.5rem;
            color: #2E7D7D;
            margin-bottom: 20px;
            text-align: center;
            font-weight: bold;
        }

        .products-table {
            width: 100%;
            border-collapse: collapse;
            overflow-x: auto;
            display: block;
            white-space: nowrap;
        }

        .products-table thead,
        .products-table tbody {
            display: table;
            width: 100%;
            table-layout: fixed;
        }

        .products-table tbody {
            display: block;
            max-height: 500px;
            overflow-y: auto;
        }

        .products-table tbody tr {
            display: table;
            width: 100%;
            table-layout: fixed;
        }

        .products-table th,
        .products-table td {
            padding: 10px;
            text-align: center;
            border: 1px solid #ddd;
            vertical-align: middle;
        }

        .products-table th {
            background: linear-gradient(45deg, #2E7D7D, #1B5858);
            color: white;
            font-weight: bold;
            position: sticky;
            top: 0;
            z-index: 10;
        }

        .products-table th:first-child { width: 8%; }
        .products-table th:nth-child(2) { width: 15%; }
        .products-table th:nth-child(3) { width: 35%; }
        .products-table th:nth-child(4) { width: 12%; }
        .products-table th:nth-child(5) { width: 30%; }

        .products-table td:first-child { width: 8%; }
        .products-table td:nth-child(2) { width: 15%; }
        .products-table td:nth-child(3) { width: 35%; }
        .products-table td:nth-child(4) { width: 12%; }
        .products-table td:nth-child(5) { width: 30%; }

        .products-table tbody tr:nth-child(even) {
            background: #f8f9ff;
        }

        .products-table tbody tr:hover {
            background: #e8f4f8;
            transform: scale(1.02);
            transition: all 0.2s ease;
        }

        .product-input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }

        .product-input:focus {
            border-color: #2E7D7D;
            box-shadow: 0 0 5px rgba(46, 125, 125, 0.3);
            outline: none;
        }

        .product-select {
            width: 100%;
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 0.9rem;
            background: white;
            cursor: pointer;
        }

        .product-select:focus {
            border-color: #2E7D7D;
            box-shadow: 0 0 5px rgba(46, 125, 125, 0.3);
            outline: none;
        }

        .row-number {
            font-weight: bold;
            color: #2E7D7D;
            background: #f0f8ff !important;
        }

        .btn {
            padding: 12px 20px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: bold;
            margin: 5px;
        }

        .btn-primary {
            background: linear-gradient(45deg, #2E7D7D, #1B5858);
            color: white;
            box-shadow: 0 4px 15px rgba(46, 125, 125, 0.4);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(46, 125, 125, 0.6);
        }

        .btn-success {
            background: linear-gradient(45deg, #28a745, #20963c);
            color: white;
        }

        .btn-success:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
        }

        .btn-secondary {
            background: linear-gradient(45deg, #6c757d, #5a6268);
            color: white;
        }

        .btn-secondary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(108, 117, 125, 0.4);
        }

        .actions {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            justify-content: center;
            margin: 25px 0;
        }

        .output-section {
            background: #f0f8ff;
            border-radius: 10px;
            padding: 20px;
            margin-top: 25px;
            border: 2px dashed #2E7D7D;
        }

        .output-text {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            white-space: pre-wrap;
            font-family: 'Arial', sans-serif;
            font-size: 0.9rem;
            max-height: 400px;
            overflow-y: auto;
            margin: 15px 0;
            direction: rtl;
            text-align: right;
            line-height: 1.6;
        }

        .validation-error {
            border-color: #dc3545 !important;
            box-shadow: 0 0 5px rgba(220, 53, 69, 0.3) !important;
        }

        .validation-message {
            background: #f8d7da;
            color: #721c24;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            border: 1px solid #f5c6cb;
        }

        @media (max-width: 1200px) {
            .products-table {
                font-size: 0.8rem;
            }
            
            .product-input,
            .product-select {
                padding: 6px;
                font-size: 0.8rem;
            }
        }

        @media (max-width: 768px) {
            .header-form {
                grid-template-columns: 1fr;
            }
            
            .actions {
                flex-direction: column;
            }
            
            .btn {
                width: 100%;
            }

            .products-table {
                font-size: 0.7rem;
            }
        }

        .fade-in {
            animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏢 לחמא</h1>
            <h2>פלטפורמת הזמנת דוגמאות</h2>
            <p>מערכת מתקדמת לניהול והזמנת דוגמאות עם טבלת מוצרים מפורטת</p>
        </div>

        <div class="main-content">
            <form id="orderForm">
                <div class="form-section">
                    <h2 style="color: #2E7D7D; margin-bottom: 20px;">פרטי ההזמנה הכלליים</h2>
                    <div class="header-form">
                        <div class="form-group">
                            <label for="clientName">שם הלקוח *</label>
                            <input type="text" id="clientName" placeholder="הזן שם הלקוח" required>
                        </div>

                        <div class="form-group">
                            <label for="ordererName">שם המזמין *</label>
                            <input type="text" id="ordererName" placeholder="הזן שם המזמין" required>
                        </div>

                        <div class="form-group">
                            <label for="pickupDate">תאריך איסוף מתוכנן *</label>
                            <input type="date" id="pickupDate" required>
                        </div>

                        <div class="form-group">
                            <label for="pickupTime">שעה מבוקשת *</label>
                            <select id="pickupTime" required>
                                <option value="">בחר שעה</option>
                                <option value="05:00">05:00</option>
                                <option value="05:30">05:30</option>
                                <option value="06:00">06:00</option>
                                <option value="06:30">06:30</option>
                                <option value="07:00">07:00</option>
                                <option value="07:30">07:30</option>
                                <option value="08:00">08:00</option>
                                <option value="08:30">08:30</option>
                                <option value="09:00">09:00</option>
                                <option value="09:30">09:30</option>
                                <option value="10:00">10:00</option>
                                <option value="10:30">10:30</option>
                                <option value="11:00">11:00</option>
                                <option value="11:30">11:30</option>
                                <option value="12:00">12:00</option>
                                <option value="12:30">12:30</option>
                                <option value="13:00">13:00</option>
                                <option value="13:30">13:30</option>
                                <option value="14:00">14:00</option>
                                <option value="14:30">14:30</option>
                                <option value="15:00">15:00</option>
                                <option value="15:30">15:30</option>
                                <option value="16:00">16:00</option>
                                <option value="16:30">16:30</option>
                                <option value="17:00">17:00</option>
                                <option value="17:30">17:30</option>
                                <option value="18:00">18:00</option>
                                <option value="18:30">18:30</option>
                                <option value="19:00">19:00</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="products-section">
                    <div class="products-title">פרטי המוצרים להזמנה</div>
                    <div style="overflow-x: auto;">
                        <table class="products-table">
                            <thead>
                                <tr>
                                    <th>מס'</th>
                                    <th>מק"ט</th>
                                    <th>שם המוצר</th>
                                    <th>כמות</th>
                                    <th>מצב המוצר</th>
                                </tr>
                            </thead>
                            <tbody id="productsTableBody">
                                <!-- שורות יתווספו כאן דינמית -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="actions">
                    <button type="button" class="btn btn-primary" onclick="generateOutput()">הצג פלט נתונים</button>
                    <button type="button" class="btn btn-success" onclick="exportData()">ייצוא לקובץ</button>
                    <button type="button" class="btn btn-secondary" onclick="emailData()">שלח במייל</button>
                    <button type="button" class="btn btn-secondary" onclick="clearForm()">נקה טופס</button>
                </div>
            </form>

            <div id="outputSection" class="output-section" style="display: none;">
                <h2 style="color: #2E7D7D;">פלט נתונים</h2>
                <div id="outputDisplay" class="output-text"></div>
            </div>
        </div>
    </div>

    <script>
        // יצירת אפשרויות מצב המוצר
        const productStates = [
            { value: "", text: "בחר מצב" },
            { value: "אפוי", text: "אפוי" },
            { value: "קפוא", text: "קפוא" },
            { value: "טרי", text: "טרי" },
            { value: "מיובש", text: "מיובש" },
            { value: "מותסס", text: "מותסס" },
            { value: "מבושל", text: "מבושל" },
            { value: "גלם", text: "גלם" },
            { value: "חצי מוכן", text: "חצי מוכן" }
        ];

        // אתחול הטבלה
        function initializeProductsTable() {
            const tbody = document.getElementById('productsTableBody');
            tbody.innerHTML = '';
            
            for (let i = 1; i <= 16; i++) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="row-number">${i}</td>
                    <td>
                        <input type="text" class="product-input" id="sku_${i}" placeholder="מק"ט מוצר">
                    </td>
                    <td>
                        <input type="text" class="product-input" id="productName_${i}" placeholder="שם המוצר">
                    </td>
                    <td>
                        <input type="number" class="product-input" id="quantity_${i}" placeholder="כמות" min="0" step="0.1">
                    </td>
                    <td>
                        <select class="product-select" id="state_${i}">
                            ${productStates.map(state => 
                                `<option value="${state.value}">${state.text}</option>`
                            ).join('')}
                        </select>
                    </td>
                `;
                tbody.appendChild(row);
            }
        }

        // איסוף נתוני המוצרים
        function collectProductsData() {
            const products = [];
            for (let i = 1; i <= 16; i++) {
                const sku = document.getElementById(`sku_${i}`).value.trim();
                const productName = document.getElementById(`productName_${i}`).value.trim();
                const quantity = document.getElementById(`quantity_${i}`).value.trim();
                const state = document.getElementById(`state_${i}`).value;
                
                if (sku || productName || quantity || state) {
                    products.push({
                        number: i,
                        sku: sku,
                        productName: productName,
                        quantity: quantity,
                        state: state
                    });
                }
            }
            return products;
        }

        // ולידציה
        function validateForm() {
            const requiredFields = [
                { id: 'clientName', name: 'שם הלקוח' },
                { id: 'pickupDate', name: 'תאריך איסוף מתוכנן' },
                { id: 'pickupTime', name: 'שעה מבוקשת' },
                { id: 'ordererName', name: 'שם המזמין' }
            ];

            let isValid = true;
            let errors = [];

            // בדיקת שדות חובה
            requiredFields.forEach(field => {
                const element = document.getElementById(field.id);
                const value = element.value.trim();
                
                if (!value) {
                    element.classList.add('validation-error');
                    errors.push(`שדה "${field.name}" הוא חובה`);
                    isValid = false;
                } else {
                    element.classList.remove('validation-error');
                }
            });

            // בדיקת תאריכים
            const pickupDate = new Date(document.getElementById('pickupDate').value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (pickupDate && pickupDate < today) {
                document.getElementById('pickupDate').classList.add('validation-error');
                errors.push('תאריך איסוף מתוכנן חייב להיות היום או תאריך עתידי');
                isValid = false;
            }

            // בדיקת מוצרים
            const products = collectProductsData();
            if (products.length === 0) {
                errors.push('יש להזין לפחות מוצר אחד');
                isValid = false;
            }

            // הצגת שגיאות
            const existingError = document.querySelector('.validation-message');
            if (existingError) {
                existingError.remove();
            }

            if (!isValid) {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'validation-message';
                errorDiv.innerHTML = `
                    <strong>שגיאות בטופס:</strong><br>
                    ${errors.map(error => `• ${error}`).join('<br>')}
                `;
                document.querySelector('.form-section').appendChild(errorDiv);
            }

            return isValid;
        }

        // יצירת פלט מעוצב
        function generateFormattedOutput() {
            const clientName = document.getElementById('clientName').value;
            const pickupDate = document.getElementById('pickupDate').value;
            const pickupTime = document.getElementById('pickupTime').value;
            const ordererName = document.getElementById('ordererName').value;
            const products = collectProductsData();

            const formattedPickupDate = new Date(pickupDate).toLocaleDateString('he-IL');

            let output = `
לחמא - הזמנת דוגמאות
____________________________________

פרטי ההזמנה:
שם הלקוח: ${clientName}
תאריך איסוף מתוכנן: ${formattedPickupDate}
שעה מבוקשת: ${pickupTime}
שם המזמין: ${ordererName}
זמן יצירת ההזמנה: ${new Date().toLocaleString('he-IL')}

פרטי המוצרים:
____________________________________
`;

            if (products.length > 0) {
                output += `\nמס׳    מק״ט              שם המוצר                     כמות    מצב המוצר\n`;
                output += `____________________________________________________________________\n`;
                
                products.forEach(product => {
                    const num = product.number.toString().padEnd(6, ' ');
                    const sku = (product.sku || 'לא צוין').padEnd(18, ' ');
                    const name = (product.productName || 'לא צוין').padEnd(28, ' ');
                    const qty = (product.quantity || 'לא צוין').padEnd(8, ' ');
                    const state = product.state || 'לא צוין';
                    
                    output += `${num}${sku}${name}${qty}${state}\n`;
                });
            } else {
                output += `\nלא הוזנו מוצרים.\n`;
            }

            output += `\n____________________________________
סיכום ההזמנה:
סה״כ מוצרים: ${products.length}
מוצרים עם כמות: ${products.filter(p => p.quantity).length}
מוצרים עם מצב מוגדר: ${products.filter(p => p.state).length}

תודה על ההזמנה!
____________________________________`;

            return output;
        }

        // הצגת פלט
        function generateOutput() {
            if (!validateForm()) {
                return;
            }

            const output = generateFormattedOutput();
            const outputSection = document.getElementById('outputSection');
            const outputDisplay = document.getElementById('outputDisplay');
            
            outputDisplay.textContent = output;
            outputSection.style.display = 'block';
            outputSection.classList.add('fade-in');
            outputSection.scrollIntoView({ behavior: 'smooth' });
        }

        // ייצוא לקובץ
        function exportData() {
            if (!validateForm()) {
                return;
            }

            const data = generateFormattedOutput();
            const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            const clientName = document.getElementById('clientName').value;
            const pickupDate = document.getElementById('pickupDate').value;
            const fileName = `הזמנת_דוגמאות_${clientName}_${pickupDate}.txt`;
            
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            // הצגת הודעת הצלחה
            const successDiv = document.createElement('div');
            successDiv.style.cssText = `
                position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
                background: #28a745; color: white; padding: 15px 25px;
                border-radius: 8px; z-index: 1000; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            `;
            successDiv.textContent = 'הקובץ יוצא בהצלחה!';
            document.body.appendChild(successDiv);
            
            setTimeout(() => {
                document.body.removeChild(successDiv);
            }, 3000);
        }

        // שליחה במייל
        function emailData() {
            if (!validateForm()) {
                return;
            }

            const clientName = document.getElementById('clientName').value;
            const pickupDate = document.getElementById('pickupDate').value;
            const subject = `הזמנת דוגמאות - ${clientName} - ${new Date(pickupDate).toLocaleDateString('he-IL')}`;
            const body = generateFormattedOutput();
            
            const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            if (mailtoLink.length > 2000) {
                alert('הנתונים ארוכים מדי לשליחה ישירה במייל. אנא השתמש בפונקציית הייצוא לקובץ.');
                return;
            }
            
            window.location.href = mailtoLink;
        }

        // ניקוי טופס
        function clearForm() {
            if (confirm('האם אתה בטוח שברצונך לנקות את כל הטופס?')) {
                document.getElementById('orderForm').reset();
                document.getElementById('outputSection').style.display = 'none';
                
                // הסרת שגיאות ולידציה
                document.querySelectorAll('.validation-error').forEach(el => {
                    el.classList.remove('validation-error');
                });
                
                const errorMsg = document.querySelector('.validation-message');
                if (errorMsg) {
                    errorMsg.remove();
                }
                
                // פוקוס על השדה הראשון
                document.getElementById('clientName').focus();
            }
        }

        // אתחול האפליקציה
        document.addEventListener('DOMContentLoaded', function() {
            initializeProductsTable();
            document.getElementById('clientName').focus();
        });

        // הסרת שגיאות ולידציה בעת הקלדה
        document.addEventListener('input', function(e) {
            if (e.target.classList.contains('validation-error')) {
                e.target.classList.remove('validation-error');
            }
        });
    </script>
</body>
</html>
