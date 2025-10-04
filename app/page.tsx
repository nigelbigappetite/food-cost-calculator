export default function Home() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
            Wing Shack Food Cost Calculator
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            Upload your ingredients and menu data to calculate live GP analysis
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <div style={{ background: '#3b82f6', color: 'white', width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '1rem' }}>1</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Download Templates</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Get the correct CSV format for your data</p>
            <button 
              onClick={() => {
                const csvContent = [
                  ['Name', 'Purchase Price', 'Quantity', 'Unit'],
                  ['Cheese', '25.00', '45', 'slices'],
                  ['Flour', '3.50', '5', 'kg'],
                  ['Chicken Breast', '12.00', '2', 'kg'],
                  ['Tomato Sauce', '2.50', '1', 'liter'],
                  ['Olive Oil', '8.00', '1', 'liter']
                ].map(row => row.join(',')).join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'ingredients-template.csv';
                a.click();
                window.URL.revokeObjectURL(url);
              }}
              style={{ background: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', marginRight: '0.5rem' }}
            >
              Ingredients Template
            </button>
            <button 
              onClick={() => {
                const csvContent = [
                  ['Name', 'Selling Price', 'Category', 'Cheese (slices)', 'Qty', 'Flour (kg)', 'Qty'],
                  ['Margherita Pizza', '12.00', 'main', 'Cheese', '3', 'Flour', '0.3'],
                  ['Chicken Pizza', '15.00', 'main', 'Cheese', '3', 'Flour', '0.3'],
                  ['Chicken Wings', '8.50', 'main', 'Cheese', '0', 'Flour', '0']
                ].map(row => row.join(',')).join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'menu-template.csv';
                a.click();
                window.URL.revokeObjectURL(url);
              }}
              style={{ background: '#10b981', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              Menu Template
            </button>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <div style={{ background: '#3b82f6', color: 'white', width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '1rem' }}>2</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Upload Your Data</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Upload your ingredients and menu items as CSV files</p>
            <div style={{ border: '2px dashed #d1d5db', borderRadius: '0.5rem', padding: '2rem', textAlign: 'center', background: '#f9fafb' }}>
              <p>📁 Drag & drop your CSV files here</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>or click to browse</p>
              <input type="file" accept=".csv" multiple style={{ marginTop: '1rem', width: '100%' }} />
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <div style={{ background: '#3b82f6', color: 'white', width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '1rem' }}>3</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Calculate GP</h3>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Get instant gross profit analysis</p>
            <button 
              style={{ background: '#3b82f6', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' }}
            >
              Calculate Food Costs
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
              Sample Analysis - Wing Shack Menu
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              This shows how your uploaded data will be analyzed
            </p>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Menu Item
                </th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Food Cost (£)
                </th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Selling Price (£)
                </th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  GP £
                </th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  GP %
                </th>
                <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                  Wagyu Cheese Smash
                </td>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6b7280' }}>
                  £3.45
                </td>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6b7280' }}>
                  £11.50
                </td>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6b7280' }}>
                  £8.05
                </td>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.125rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500', color: '#059669', backgroundColor: '#d1fae5' }}>
                    70.0%
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6b7280' }}>
                  🟢 Excellent
                </td>
              </tr>
              <tr style={{ borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                  Smokey Buffalo Chicken Smash
                </td>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6b7280' }}>
                  £2.89
                </td>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6b7280' }}>
                  £10.50
                </td>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6b7280' }}>
                  £7.61
                </td>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.125rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500', color: '#059669', backgroundColor: '#d1fae5' }}>
                    72.5%
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6b7280' }}>
                  🟢 Excellent
                </td>
              </tr>
              <tr style={{ borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                  Vegan Smash
                </td>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6b7280' }}>
                  £3.90
                </td>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6b7280' }}>
                  £9.50
                </td>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6b7280' }}>
                  £5.60
                </td>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.125rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500', color: '#d97706', backgroundColor: '#fef3c7' }}>
                    58.9%
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6b7280' }}>
                  🟡 Good
                </td>
              </tr>
              <tr style={{ borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                  Fries
                </td>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6b7280' }}>
                  £2.00
                </td>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6b7280' }}>
                  £3.00
                </td>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6b7280' }}>
                  £1.00
                </td>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.125rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500', color: '#dc2626', backgroundColor: '#fee2e2' }}>
                    33.3%
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6b7280' }}>
                  🔴 Needs Attention
                </td>
              </tr>
            </tbody>
          </table>

          <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>4</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Items</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>2</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Excellent GP (≥65%)</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706' }}>1</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Good GP (55-65%)</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>1</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Needs Attention (<55%)</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '0.5rem', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e40af', marginBottom: '0.75rem' }}>
            How This Calculator Works
          </h3>
          <div style={{ color: '#1e40af' }}>
            <p><strong>📊 Ingredient Cost Calculation:</strong> Takes your bulk purchase price ÷ quantity = cost per unit</p>
            <p><strong>🍔 Menu Item Analysis:</strong> Multiplies ingredient costs by quantities used in each dish</p>
            <p><strong>💰 GP Calculation:</strong> Selling Price - Total Food Cost = Gross Profit</p>
            <p><strong>📈 Performance Tracking:</strong> Color-coded status helps identify profitable vs. unprofitable items</p>
            <p><strong>📋 CSV Upload:</strong> Easy data entry using downloadable templates</p>
            <p><strong>🔄 Real-time Updates:</strong> Instant calculations as you upload new data</p>
          </div>
        </div>
      </div>
    </div>
  );
}