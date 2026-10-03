import { createCanvas } from '@napi-rs/canvas';

export interface PriceListItem {
  buyer_sku_code?: string;
  product_name: string;
  brand: string;
  price: number;
  category?: string;
}

export interface GeneratePriceListOptions {
  brand: string;
  priceType: 'biasa' | 'vip' | 'owner';
  products: PriceListItem[];
  customTitle?: string;
  customStoreName?: string;
  category?: string;
  page?: number;
  maxPerPage?: number;
}

/**
 * Format and clean product name:
 * Strips brand prefix (e.g. "Free Fire 70 Diamond" -> "70 Diamond")
 * Formats special passes cleanly (e.g. "Level Up Pass", "Membership Mingguan")
 */
function cleanProductName(rawName: string, brand: string): string {
  let name = (rawName || '').trim();
  const bUpper = (brand || '').toUpperCase().trim();
  
  // Remove full brand prefix if present
  if (bUpper && name.toUpperCase().startsWith(bUpper)) {
    name = name.substring(bUpper.length).trim();
  }
  
  // Remove common brand abbreviations
  if (bUpper === 'FREE FIRE' || bUpper.includes('FREE FIRE')) {
    name = name.replace(/^FF\s*[-:]?\s*/i, '').trim();
  } else if (bUpper.includes('MOBILE LEGEND')) {
    name = name.replace(/^(ML|MLBB)\s*[-:]?\s*/i, '').trim();
  } else if (bUpper.includes('PUBG')) {
    name = name.replace(/^PUBG\s*[-:]?\s*/i, '').trim();
  } else if (bUpper.includes('GENSHIN')) {
    name = name.replace(/^GI\s*[-:]?\s*/i, '').trim();
  }

  // Remove leading punctuation like "-", ":", "/"
  name = name.replace(/^[\s\-_:\/]+/, '').trim();

  // If name became empty, fallback to rawName
  if (!name) name = rawName;

  // Clean common extra noise like "(Fast)", "(Instant)" if desired, but keep clean
  name = name.replace(/\s+/g, ' ');

  // Capitalize appropriately
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Sort products logically:
 * 1. Primary sort: Price ascending (lowest to highest)
 * 2. Secondary sort: Numeric value in product name
 */
export function sortPriceListProducts(products: PriceListItem[]): PriceListItem[] {
  return [...products].sort((a, b) => {
    const priceA = Number(a.price) || 0;
    const priceB = Number(b.price) || 0;
    if (priceA !== priceB) return priceA - priceB;

    const matchA = (a.product_name || '').match(/(\d+[\.\d]*)/);
    const matchB = (b.product_name || '').match(/(\d+[\.\d]*)/);
    const numA = matchA ? parseFloat(matchA[0].replace(/\./g, '')) : 0;
    const numB = matchB ? parseFloat(matchB[0].replace(/\./g, '')) : 0;
    return numA - numB;
  });
}

/**
 * Generate a single 1080x1920 poster page matching Image 2 exactly:
 * - 9:16 mobile story aspect ratio (1080 x 1920)
 * - Dark blue/slate canvas with subtle corner ambient circles
 * - Orange pill badge at top: "TOP UP GAME INSTANT" / "PART 1/2"
 * - Huge bold white brand title e.g. "FREE FIRE" with orange underline bar
 * - Golden yellow subtitle: "DAFTAR HARGA TERMURAH" / "MEMBER BIASA" / "MEMBER VIP" / "JUAL OWNER"
 * - Tagline: "Status Normal • Proses Instant • 24 Jam"
 * - Main Card container with "NAMA PRODUK" (left) and "HARGA" (right)
 * - Clean row pills with 🔸 diamond icon, white product name, and gold price
 * - Footer notice: "HARGA SEWAKTU-WAKTU DAPAT BERUBAH"
 * - Bottom orange pill badge: "E4 STORE" with bold blue text
 */
export async function generatePriceListImage(
  options: GeneratePriceListOptions,
  pageIndex: number = 0,
  totalPages: number = 1
): Promise<Buffer> {
  const { brand, priceType, products } = options;
  const sorted = sortPriceListProducts(products);

  const width = 1080;
  const height = 1920;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // --- 1. BACKGROUND GRADIENT ---
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#090E1A');
  bgGrad.addColorStop(0.45, '#0B1322');
  bgGrad.addColorStop(1, '#070C16');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Background ambient circles (matching Image 2)
  // Top-left dark blue-slate circle
  ctx.save();
  const glow1 = ctx.createRadialGradient(160, 160, 40, 160, 160, 420);
  glow1.addColorStop(0, 'rgba(23, 37, 60, 0.45)');
  glow1.addColorStop(1, 'rgba(23, 37, 60, 0)');
  ctx.fillStyle = glow1;
  ctx.beginPath();
  ctx.arc(160, 160, 420, 0, Math.PI * 2);
  ctx.fill();

  // Top-right dark bronze/amber glow
  const glow2 = ctx.createRadialGradient(920, 130, 40, 920, 130, 480);
  glow2.addColorStop(0, 'rgba(64, 38, 18, 0.4)');
  glow2.addColorStop(1, 'rgba(64, 38, 18, 0)');
  ctx.fillStyle = glow2;
  ctx.beginPath();
  ctx.arc(920, 130, 480, 0, Math.PI * 2);
  ctx.fill();

  // Bottom glow
  const glow3 = ctx.createRadialGradient(540, 1860, 40, 540, 1860, 480);
  glow3.addColorStop(0, 'rgba(234, 88, 12, 0.12)');
  glow3.addColorStop(1, 'rgba(234, 88, 12, 0)');
  ctx.fillStyle = glow3;
  ctx.beginPath();
  ctx.arc(540, 1860, 480, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- 2. TOP PILL BADGE ---
  const isGame = (options.category || '').toLowerCase().includes('game') || 
    brand.toUpperCase().includes('FREE FIRE') || 
    brand.toUpperCase().includes('MOBILE LEGEND') ||
    brand.toUpperCase().includes('PUBG') ||
    brand.toUpperCase().includes('GENSHIN') ||
    brand.toUpperCase().includes('ROBLOX') ||
    brand.toUpperCase().includes('VALORANT');

  let badgeText = isGame ? 'TOP UP GAME INSTANT' : 'LAYANAN DIGITAL RESMI';
  if (totalPages > 1) {
    badgeText += ` • PART ${pageIndex + 1}/${totalPages}`;
  }

  ctx.font = 'bold 24px Arial, sans-serif';
  const badgeTextWidth = ctx.measureText(badgeText).width;
  const badgeWidth = Math.max(340, badgeTextWidth + 64);
  const badgeHeight = 52;
  const badgeX = (width - badgeWidth) / 2;
  const badgeY = 64;

  ctx.fillStyle = '#EA580C'; // Vivid orange
  drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 26);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badgeText, width / 2, badgeY + badgeHeight / 2 + 1);

  // --- 3. BRAND TITLE ---
  const displayBrand = brand.toUpperCase().trim();
  ctx.font = 'bold 84px Arial, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(displayBrand, width / 2, 142);

  // Orange underline bar
  const titleMetrics = ctx.measureText(displayBrand);
  const underlineWidth = Math.min(360, Math.max(240, titleMetrics.width * 0.72));
  const underlineHeight = 6;
  const underlineX = (width - underlineWidth) / 2;
  const underlineY = 244;
  ctx.fillStyle = '#EA580C';
  drawRoundedRect(ctx, underlineX, underlineY, underlineWidth, underlineHeight, 3);
  ctx.fill();

  // --- 4. SUBTITLE ---
  let subtitleText = 'DAFTAR HARGA TERMURAH';
  if (priceType === 'biasa') {
    subtitleText = 'DAFTAR HARGA TERMURAH';
  } else if (priceType === 'vip') {
    subtitleText = 'DAFTAR HARGA MEMBER VIP';
  } else if (priceType === 'owner') {
    subtitleText = 'DAFTAR HARGA JUAL OWNER';
  }

  if (totalPages > 1) {
    subtitleText += ` (${pageIndex + 1}/${totalPages})`;
  }

  ctx.font = 'bold 30px Arial, sans-serif';
  ctx.fillStyle = '#FBBF24'; // Yellow gold
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(subtitleText, width / 2, 272);

  // --- 5. STATUS TAGLINE ---
  ctx.font = '500 22px Arial, sans-serif';
  ctx.fillStyle = '#8E9CAE';
  ctx.fillText('Status Normal  •  Proses Instant  •  24 Jam', width / 2, 318);

  // --- 6. MAIN CARD CONTAINER ---
  const cardX = 60;
  const cardY = 368;
  const cardWidth = width - 120; // 960px
  
  // Calculate dynamic row spacing to fill canvas nicely like Image 2
  const numItems = Math.max(1, sorted.length);
  const rowHeight = numItems <= 12 ? Math.min(94, Math.max(76, Math.floor(1140 / numItems))) : 76;
  const itemCardHeight = Math.min(78, rowHeight - 14);
  const cardContentHeight = Math.min(1330, Math.max(500, 100 + (numItems * rowHeight) + 16));

  // Draw Card Container
  ctx.fillStyle = '#0F1828';
  ctx.strokeStyle = '#1A2940';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, cardX, cardY, cardWidth, cardContentHeight, 32);
  ctx.fill();
  ctx.stroke();

  // Card Header: NAMA PRODUK | HARGA
  const headerY = cardY + 38;
  ctx.font = 'bold 22px Arial, sans-serif';
  ctx.fillStyle = '#64748B'; // Muted slate
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('NAMA PRODUK', cardX + 44, headerY);

  ctx.fillStyle = '#FBBF24'; // Yellow gold
  ctx.textAlign = 'right';
  ctx.fillText('HARGA', cardX + cardWidth - 44, headerY);

  // Divider Line
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cardX + 36, cardY + 74);
  ctx.lineTo(cardX + cardWidth - 36, cardY + 74);
  ctx.stroke();

  // --- 7. PRODUCT ITEM ROWS ---
  let currentY = cardY + 96;

  sorted.forEach((p, idx) => {
    const itemCardX = cardX + 22;
    const itemCardWidth = cardWidth - 44;

    // Row pill card background
    ctx.fillStyle = idx % 2 === 0 ? '#142034' : '#111B2C';
    drawRoundedRect(ctx, itemCardX, currentY, itemCardWidth, itemCardHeight, 14);
    ctx.fill();

    // Cleaned product name
    const cleanName = cleanProductName(p.product_name, brand);

    // 🔸 Orange Diamond Icon on the left
    const iconCenterX = itemCardX + 36;
    const iconCenterY = currentY + itemCardHeight / 2;
    const diamondSize = 11;

    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.moveTo(iconCenterX, iconCenterY - diamondSize); // Top
    ctx.lineTo(iconCenterX + diamondSize, iconCenterY); // Right
    ctx.lineTo(iconCenterX, iconCenterY + diamondSize); // Bottom
    ctx.lineTo(iconCenterX - diamondSize, iconCenterY); // Left
    ctx.closePath();
    ctx.fill();

    // Product Name Text
    ctx.font = 'bold 27px Arial, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    // Fit text if name is unusually long
    let nameToDraw = cleanName;
    const maxNameWidth = itemCardWidth - 280;
    if (ctx.measureText(nameToDraw).width > maxNameWidth) {
      while (ctx.measureText(nameToDraw + '...').width > maxNameWidth && nameToDraw.length > 5) {
        nameToDraw = nameToDraw.slice(0, -1);
      }
      nameToDraw += '...';
    }
    ctx.fillText(nameToDraw, iconCenterX + 28, iconCenterY);

    // Price Text: "Rp " in gray, number in bold gold/yellow
    const priceStr = Math.round(Number(p.price)).toLocaleString('id-ID');
    ctx.font = 'bold 31px Arial, sans-serif';
    ctx.fillStyle = '#FBBF24'; // Yellow gold
    ctx.textAlign = 'right';
    ctx.fillText(priceStr, itemCardX + itemCardWidth - 28, iconCenterY);

    const priceNumWidth = ctx.measureText(priceStr).width;
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillStyle = '#8E9CAE';
    ctx.fillText('Rp ', itemCardX + itemCardWidth - 28 - priceNumWidth, iconCenterY);

    currentY += rowHeight;
  });

  // --- 8. FOOTER SECTION ---
  // Notice Text
  const noticeY = Math.min(cardY + cardContentHeight + 36, 1720);
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.fillStyle = '#64748B'; // Muted
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('HARGA SEWAKTU-WAKTU DAPAT BERUBAH', width / 2, noticeY);

  // E4 STORE Orange Pill Badge (matching Image 2)
  const footerBadgeText = options.customStoreName || 'E4 STORE';
  ctx.font = 'bold 38px Arial, sans-serif';
  const fBadgeTextWidth = ctx.measureText(footerBadgeText).width;
  const fBadgeWidth = Math.max(220, fBadgeTextWidth + 88);
  const fBadgeHeight = 68;
  const fBadgeX = (width - fBadgeWidth) / 2;
  const fBadgeY = Math.min(noticeY + 44, 1776);

  ctx.fillStyle = '#EA580C'; // Orange
  drawRoundedRect(ctx, fBadgeX, fBadgeY, fBadgeWidth, fBadgeHeight, 34);
  ctx.fill();

  ctx.fillStyle = '#1E3A8A'; // Deep blue text as in Image 2
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(footerBadgeText, width / 2, fBadgeY + fBadgeHeight / 2 + 1);

  return canvas.toBuffer('image/png');
}

/**
 * Generate multiple poster images when products exceed maxPerPage (default 12 items).
 * Seamlessly fulfills:
 * "Oy kalau produk nya gk cukup atau gk muat buat lagi gambar untuk melanjutkan yg kurang tadi"
 */
export async function generatePriceListImages(
  options: GeneratePriceListOptions,
  maxPerPage: number = 12
): Promise<Buffer[]> {
  const sorted = sortPriceListProducts(options.products);

  // If products fit within one page (up to 13 items comfortably)
  if (sorted.length <= 13) {
    const single = await generatePriceListImage(options, 0, 1);
    return [single];
  }

  // Chunk products into pages of maxPerPage
  const chunks: PriceListItem[][] = [];
  for (let i = 0; i < sorted.length; i += maxPerPage) {
    chunks.push(sorted.slice(i, i + maxPerPage));
  }

  const totalPages = chunks.length;
  const buffers: Buffer[] = [];

  for (let i = 0; i < totalPages; i++) {
    const pageOptions: GeneratePriceListOptions = {
      ...options,
      products: chunks[i]
    };
    const buf = await generatePriceListImage(pageOptions, i, totalPages);
    buffers.push(buf);
  }

  return buffers;
}

/**
 * Utility function to draw a rounded rectangle
 */
function drawRoundedRect(
  ctx: any, 
  x: number, 
  y: number, 
  width: number, 
  height: number, 
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
