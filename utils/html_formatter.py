def make_html_table(brand_groups) -> str:
    """
    Create brand-specific HTML sections from grouped results.
    
    Args:
        brand_groups: Dictionary with brand names as keys and results as values
        
    Returns:
        str: HTML with separate sections per brand
    """
    def get_gp_color(gp_pct):
        """Get color based on GP percentage."""
        if gp_pct >= 70:
            return "#3CB371"  # Green
        elif gp_pct >= 65:
            return "#FFB84D"  # Orange
        else:
            return "#FF6B6B"  # Red
    
    # Start building HTML
    html = '<div style="font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 20px;">'
    html += '''
    <div style="text-align: center; margin-bottom: 30px; padding: 30px; background: linear-gradient(135deg, #2c3e50, #34495e); border-radius: 12px; color: white; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
        <div style="margin-bottom: 20px;">
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMzgiIGZpbGw9IiNmZjZiMzUiLz4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iOCIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iNTAiIGN5PSIzMCIgcj0iOCIgZmlsbD0id2hpdGUiLz4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIgZmlsbD0iYmxhY2siLz4KPGNpcmNsZSBjeD0iNTAiIGN5PSIzMCIgcj0iNCIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTI1IDU1IEMzMCA1MCA0MCA1MCA0MCA1MCBDNDAgNTAgNTAgNTAgNTUgNTUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik0yMCAyMCBDMjAgMTUgMjUgMTAgMzAgMTAgQzM1IDEwIDQwIDE1IDQwIDIwIiBzdHJva2U9IiNmZjZiMzUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik00MCAyMCBDNDAgMTUgNDUgMTAgNTAgMTAgQzU1IDEwIDYwIDE1IDYwIDIwIiBzdHJva2U9IiNmZjZiMzUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=" alt="Hungry Tum Logo" style="width: 80px; height: 80px; margin-bottom: 15px;">
        </div>
        <h1 style="margin: 0; font-size: 2.8rem; font-weight: 700; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">HUNGRY TUM</h1>
        <p style="margin: 8px 0 0 0; font-size: 1.1rem; opacity: 0.9; font-weight: 300;">Food Cost Analysis by Brand</p>
    </div>
    '''
    
    # Process each brand
    total_items = 0
    all_gp_values = []
    
    for brand_name, brand_data in brand_groups.items():
        if not brand_data:
            continue
            
        df = pd.DataFrame(brand_data)
        total_items += len(df)
        all_gp_values.extend(df["GP %"].tolist())
        
        # Brand header
        html += f'''
        <div style="margin-bottom: 40px; border: 2px solid #e9ecef; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 20px; text-align: center;">
                <h2 style="margin: 0; font-size: 1.8rem; font-weight: 600;">{brand_name}</h2>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">{len(df)} menu items</p>
            </div>
        '''
        
        # Table for this brand
        html += '<table style="width:100%; border-collapse: collapse;">'
        
        # Header row
        html += '<tr style="background: linear-gradient(135deg, #34495e, #2c3e50); color: white; font-weight: 600; font-size: 0.9rem;">'
        for col in df.columns:
            if col != "Brand":  # Skip brand column in display
                html += f'<td style="border: 1px solid #ddd; padding: 12px; text-align: center;">{col}</td>'
        html += '</tr>'
        
        # Data rows
        for i, (_, row) in enumerate(df.iterrows()):
            bg_color = "#fafafa" if i % 2 == 0 else "#ffffff"
            html += f'<tr style="background: {bg_color}; transition: background-color 0.2s;">'
            for col in df.columns:
                if col == "Brand":
                    continue  # Skip brand column
                val = row[col]
                style = "border: 1px solid #ddd; padding: 10px;"
                
                if col == "GP %":
                    color = get_gp_color(val)
                    style += f"text-align: right; color: {color}; font-weight: bold;"
                    val = f"{val}%"
                elif "£" in col:
                    style += "text-align: right; font-family: monospace;"
                    val = f"£{val}"
                else:
                    style += "text-align: left;"
                
                html += f'<td style="{style}">{val}</td>'
            html += "</tr>"
        html += "</table>"
        
        # Brand summary
        brand_avg_gp = df["GP %"].mean() if not df.empty else 0
        brand_high_gp = len(df[df["GP %"] >= 70])
        brand_low_gp = len(df[df["GP %"] < 65])
        
        html += f'''
        <div style="padding: 15px; background: #f8f9fa; border-top: 1px solid #e9ecef;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <strong>Average GP:</strong> {brand_avg_gp:.1f}%
                </div>
                <div style="color: #3CB371;">
                    <strong>High Margin (≥70%):</strong> {brand_high_gp}
                </div>
                <div style="color: #FF6B6B;">
                    <strong>Low Margin (<65%):</strong> {brand_low_gp}
                </div>
            </div>
        </div>
        </div>
        '''
    
    # Overall summary
    overall_avg_gp = sum(all_gp_values) / len(all_gp_values) if all_gp_values else 0
    overall_high_gp = sum(1 for gp in all_gp_values if gp >= 70)
    overall_low_gp = sum(1 for gp in all_gp_values if gp < 65)
    
    html += f"""
    <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 12px; border-left: 4px solid #3498db;">
        <h3 style="color: #2c3e50; margin-bottom: 15px; text-align: center;">📊 Overall Summary</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; text-align: center;">
            <div>
                <div style="font-size: 2rem; font-weight: bold; color: #2c3e50;">{total_items}</div>
                <div style="color: #666;">Total Items</div>
            </div>
            <div>
                <div style="font-size: 2rem; font-weight: bold; color: #2c3e50;">{overall_avg_gp:.1f}%</div>
                <div style="color: #666;">Average GP</div>
            </div>
            <div>
                <div style="font-size: 2rem; font-weight: bold; color: #3CB371;">{overall_high_gp}</div>
                <div style="color: #666;">High Margin Items</div>
            </div>
            <div>
                <div style="font-size: 2rem; font-weight: bold; color: #FF6B6B;">{overall_low_gp}</div>
                <div style="color: #666;">Low Margin Items</div>
            </div>
        </div>
    </div>
    
    <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 8px;">
        <p style="margin: 0; font-style: italic; color: #666; text-align: center;">
            Generated by Hungry Tum | Food Cost Generator
        </p>
    </div>
    </div>
    """
    
    return html
