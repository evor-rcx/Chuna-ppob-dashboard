import re

with open('/app/applet/server.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Fix Prepaid Catch block
prepaid_catch = r'''        } catch (e: any) {
            transactions.unshift({
                id: pay_ref_id,
                memberId: member.id,
                type: "prepaid",
                product: product.product_name,
                sku: product.buyer_sku_code,
                target: targetNo,
                price: total,
                modal: 0,
                cuan: 0,
                status: "Gagal",
                method: method,
                date: new Date().toISOString()
            });
            if (transactions.length > 50) transactions.pop();
            db.transactions = transactions;
            writeDB(db);
            
            if (!isOwnerSelf && method === 'saldo') {
                member.balance += total;
                db.members = members;
                writeDB(db);
            }
                
            await ctx.reply(`⏳ Transaksi Sedang Diproses (Network Error)\n\nPesananmu sedang dikonfirmasi oleh sistem pusat meski terjadi gangguan koneksi.\nMohon tunggu update otomatis dari Chuna atau hubungi Admin.\n\nPesan Error: ${e.message}`);
        }'''

prepaid_catch_new = r'''        } catch (e: any) {
            transactions.unshift({
                id: pay_ref_id,
                memberId: member.id,
                type: "prepaid",
                product: product.product_name,
                sku: product.buyer_sku_code,
                target: targetNo,
                price: total,
                modal: 0,
                cuan: 0,
                status: "Pending",
                method: method,
                date: new Date().toISOString()
            });
            if (transactions.length > 50) transactions.pop();
            db.transactions = transactions;
            writeDB(db);
            
            await ctx.reply(`⏳ Transaksi Sedang Diproses (Network Error)\n\nPesananmu sedang dikonfirmasi oleh sistem pusat meski terjadi gangguan koneksi.\nMohon tunggu update otomatis dari Chuna atau hubungi Admin.\n\nPesan Error: ${e.message}`);
        }'''
text = text.replace(prepaid_catch, prepaid_catch_new)


# 2. Fix Pasca Catch block
pasca_catch = r'''        } catch (e: any) {
            transactions.unshift({
                id: pay_ref_id,
                memberId: member.id,
                type: "pasca",
                product: stateData.product.product_name,
                sku: stateData.product.buyer_sku_code,
                target: customerNo,
                price: total,
                modal: 0,
                cuan: 0,
                status: "Gagal",
                method: method,
                date: new Date().toISOString()
            });
            if (transactions.length > 50) transactions.pop();
            db.transactions = transactions;
            writeDB(db);
            
            if (!isOwnerSelf && method === 'saldo') {
                member.balance += total;
                db.members = members;
                writeDB(db);
            }
            await ctx.reply(`⏳ Transaksi Sedang Diproses (Network Error)\n\nPesananmu sedang dikonfirmasi oleh sistem pusat meski terjadi gangguan koneksi.\nMohon tunggu update otomatis dari Chuna atau hubungi Admin.\n\nPesan Error: ${e.message}`);
        }'''

pasca_catch_new = r'''        } catch (e: any) {
            transactions.unshift({
                id: pay_ref_id,
                memberId: member.id,
                type: "pasca",
                product: stateData.product.product_name,
                sku: stateData.product.buyer_sku_code,
                target: customerNo,
                price: total,
                modal: 0,
                cuan: 0,
                status: "Pending",
                method: method,
                date: new Date().toISOString()
            });
            if (transactions.length > 50) transactions.pop();
            db.transactions = transactions;
            writeDB(db);
            
            await ctx.reply(`⏳ Transaksi Sedang Diproses (Network Error)\n\nPesananmu sedang dikonfirmasi oleh sistem pusat meski terjadi gangguan koneksi.\nMohon tunggu update otomatis dari Chuna atau hubungi Admin.\n\nPesan Error: ${e.message}`);
        }'''
text = text.replace(pasca_catch, pasca_catch_new)

with open('/app/applet/server.ts', 'w', encoding='utf-8') as f:
    f.write(text)

print("Network error logic fixed.")
