sed -i 's/product: product.product_name,/product: product.product_name,\n                        sku: product.buyer_sku_code,/g' server.ts
sed -i 's/product: stateData.product.product_name,/product: stateData.product.product_name,\n                        sku: stateData.product.buyer_sku_code,/g' server.ts
sed -i 's/app.get("\/api\/transactions", (req, res) => {/app.get("\/api\/transactions", (req, res) => {/g' server.ts
