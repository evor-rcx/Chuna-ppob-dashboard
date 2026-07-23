import re

with open("server.ts", "r") as f:
    content = f.read()

# We need to replace the HTML generation in app.get("/api/nota/:id"
# Let's find the start of let html = `<!DOCTYPE html>
# and the end of res.send(html);

start_marker = "let html = `<!DOCTYPE html>"
end_marker = "res.send(html);"
end_marker_pos = content.find(end_marker)

if start_marker in content and end_marker_pos != -1:
    start_pos = content.find(start_marker)
    
    new_html_logic = """let html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Struk - E4 STORE</title>
    <style>
        body {
            background-color: #f0f2f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .receipt-container {
            background-color: transparent;
            width: 100%;
            max-width: 400px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        img {
            width: 100%;
            height: auto;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        .btn-print {
            background-color: #0ea5e9;
            color: white;
            border: none;
            padding: 12px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: all 0.2s;
        }
        .btn-print:hover {
            background-color: #0284c7;
        }
        
        @media print {
            body {
                background-color: white;
                padding: 0;
            }
            .receipt-container {
                max-width: 100%;
                width: 100%;
            }
            img {
                box-shadow: none;
                border-radius: 0;
                width: 100%;
                max-width: 600px;
            }
            .btn-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <img src="/api/nota/${id}/image" alt="Nota Pembelian" />
        <button class="btn-print" onclick="window.print()">🖨️ Cetak Struk</button>
    </div>
</body>
</html>`;

    """
    
    content = content[:start_pos] + new_html_logic + content[end_marker_pos:]

with open("server.ts", "w") as f:
    f.write(content)
print("done")
