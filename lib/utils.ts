import { CartItem, OrderType } from '../types';
import { STORE_CONFIG } from './constants';

export function formatCurrency(amount: number): string {
  if (amount === null || amount === undefined || isNaN(amount) || amount < 0) {
    return `${STORE_CONFIG.currencySymbol}0`;
  }
  return `${STORE_CONFIG.currencySymbol}${Number(amount).toLocaleString('en-IN')}`;
}

export function buildWhatsAppMessage(params: {
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  tableNumber?: string;
  deliveryAddress?: string;
  notes?: string;
  items: CartItem[];
  total: number;
}): string {
  const {
    customerName,
    customerPhone,
    orderType,
    tableNumber,
    deliveryAddress,
    notes,
    items,
    total,
  } = params;

  let msg = `*${STORE_CONFIG.name.toUpperCase()} – NEW ORDER*\n\n`;
  msg += `*Customer:* ${customerName}\n`;
  msg += `*Mobile:* ${customerPhone}\n`;
  msg += `*Order Type:* ${orderType}\n`;

  if (orderType === 'Dine-in' && tableNumber) {
    msg += `*Table:* ${tableNumber}\n`;
  }
  if (orderType === 'Home Delivery' && deliveryAddress) {
    msg += `*Address:* ${deliveryAddress}\n`;
  }

  msg += `\n*ITEMS*\n`;
  items.forEach((item, index) => {
    const sizeStr = item.size ? ` (${item.size})` : '';
    const lineTotal = formatCurrency(item.price * item.qty);
    msg += `${index + 1}. ${item.name}${sizeStr} × ${item.qty} = ${lineTotal}\n`;
  });

  msg += `\n*TOTAL: ${formatCurrency(total)}*\n`;

  if (notes && notes.trim()) {
    msg += `\n*Notes:* ${notes.trim()}\n`;
  }

  return msg;
}

export function getWhatsAppUrl(phone: string, text: string): string {
  const sanitizedPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(text)}`;
}

/** Strips HTML tags from a string to prevent XSS in stored/displayed text */
export function stripHtmlTags(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}
