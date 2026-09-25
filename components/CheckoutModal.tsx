'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { OrderType } from '../types';
import { STORE_CONFIG } from '../lib/constants';
import { buildWhatsAppMessage, getWhatsAppUrl, stripHtmlTags } from '../lib/utils';
import { submitOrder } from '../lib/api';
import { X, MessageSquareShare, Loader2 } from 'lucide-react';

export function CheckoutModal() {
  const {
    items,
    totalAmount,
    isCheckoutOpen,
    closeCheckout,
    clearCart,
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('Dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isSubmittingRef = useRef(false); // MED-4: Ref-based double-submit guard

  // MED-10: Prevent background scrolling when modal is open
  useEffect(() => {
    if (isCheckoutOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCheckoutOpen]);

  // MED-9: Handle Escape key to close modal
  useEffect(() => {
    if (!isCheckoutOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCheckout();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isCheckoutOpen, closeCheckout]);

  if (!isCheckoutOpen) return null;

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setTableNumber('');
    setDeliveryAddress('');
    setNotes('');
    setOrderType('Dine-in');
    setErrorMessage('');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // MED-4: Prevent double submission
    if (isSubmittingRef.current) return;

    const trimmedName = stripHtmlTags(customerName.trim()); // MED-2: Strip HTML tags
    const trimmedPhone = customerPhone.trim();
    const trimmedTable = tableNumber.trim();
    const trimmedAddress = deliveryAddress.trim();

    // MED-2: Name validation — min 2 characters, no pure numbers/specials
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Please enter your name (at least 2 characters).');
      return;
    }

    // MED-1: Phone validation — exactly 10 digits only
    const phoneDigitsOnly = trimmedPhone.replace(/[^0-9]/g, '');
    if (!phoneDigitsOnly || phoneDigitsOnly.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number (digits only).');
      return;
    }

    // V-8: Table number validation for dine-in
    if (orderType === 'Dine-in') {
      if (!trimmedTable || !/^[1-9]\d{0,2}$/.test(trimmedTable)) {
        setErrorMessage('Please enter a valid table number (1-999).');
        return;
      }
    }

    // V-9: Address min length for delivery
    if (orderType === 'Home Delivery') {
      if (!trimmedAddress || trimmedAddress.length < 10) {
        setErrorMessage('Please enter your full delivery address (at least 10 characters).');
        return;
      }
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      // 1. Build WhatsApp formatted message
      const whatsappMsg = buildWhatsAppMessage({
        customerName: trimmedName,
        customerPhone: phoneDigitsOnly,
        orderType,
        tableNumber: trimmedTable,
        deliveryAddress: trimmedAddress,
        notes: notes.trim(),
        items,
        total: totalAmount,
      });

      // 2. Persist order to MongoDB backend via NestJS API
      const orderPayload = {
        customerName: trimmedName,
        customerPhone: phoneDigitsOnly,
        orderType,
        tableNumber: orderType === 'Dine-in' ? trimmedTable : undefined,
        deliveryAddress: orderType === 'Home Delivery' ? trimmedAddress : undefined,
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          key: i.key,
          id: i.id,
          name: i.name,
          size: i.size,
          price: i.price,
          qty: i.qty,
          subtotal: i.price * i.qty,
        })),
        totalAmount,
        whatsappMessage: whatsappMsg,
      };

      await submitOrder(orderPayload);

      // 3. Open WhatsApp link in new tab
      const waUrl = getWhatsAppUrl(STORE_CONFIG.whatsappNumber, whatsappMsg);
      window.open(waUrl, '_blank');

      // 4. Reset & Clear Cart — only on SUCCESS (CRIT-5 fix)
      clearCart();
      resetForm(); // MED-6: Reset form fields
      closeCheckout();
    } catch (err: any) {
      // CRIT-5 FIX: Show error to user instead of silently proceeding
      console.error('Order process error:', err);
      const isTimeout = err?.name === 'AbortError';
      if (isTimeout) {
        setErrorMessage('Request timed out. Please check your connection and try again.');
      } else {
        setErrorMessage(
          'Could not save order to our system. Please try again or contact us directly.'
        );
      }
      // Cart is NOT cleared — user can retry
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeCheckout();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Order details"
    >
      <div className="relative flex h-full w-full sm:max-w-[500px] flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e6ece4] px-4 sm:px-5 py-3 sm:py-4 shrink-0">
          <h2 className="text-xl font-bold text-[#17251c]">Order Details</h2>
          <button
            onClick={closeCheckout}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef3ed] text-lg font-bold text-[#37503f] hover:bg-[#e1e9df] transition-colors cursor-pointer"
            aria-label="Close order details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto p-4 sm:p-5 safe-bottom" noValidate>
          {errorMessage && (
            <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200" role="alert">
              {errorMessage}
            </div>
          )}

          {/* Customer Name */}
          <div className="mb-3.5">
            <label htmlFor="checkout-name" className="block text-xs font-bold text-[#17251c] mb-1.5">
              Customer name
            </label>
            <input
              id="checkout-name"
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name"
              minLength={2}
              className="w-full rounded-2xl border border-black/[0.08] bg-white p-3.5 text-sm text-[#1A1A2E] placeholder:text-[#A0A0AB] focus:border-[#F4651A] focus:outline-none focus:ring-2 focus:ring-[#F4651A]/20 transition-all"
            />
          </div>

          {/* Mobile Number */}
          <div className="mb-3.5">
            <label htmlFor="checkout-phone" className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
              Mobile number
            </label>
            <input
              id="checkout-phone"
              type="tel"
              inputMode="numeric"
              required
              value={customerPhone}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (val.length <= 10) setCustomerPhone(val);
              }}
              placeholder="10-digit mobile number"
              maxLength={10}
              pattern="[0-9]{10}"
              className="w-full rounded-2xl border border-black/[0.08] bg-white p-3.5 text-sm text-[#1A1A2E] placeholder:text-[#A0A0AB] focus:border-[#F4651A] focus:outline-none focus:ring-2 focus:ring-[#F4651A]/20 transition-all"
            />
          </div>

          {/* Order Type */}
          <div className="mb-3.5">
            <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
              Order type
            </label>
            <div className="grid grid-cols-1 min-[360px]:grid-cols-3 gap-2">
              {(['Dine-in', 'Takeaway', 'Home Delivery'] as OrderType[]).map((type) => {
                const checked = orderType === type;
                return (
                  <label
                    key={type}
                    className={`flex items-center justify-center gap-1.5 rounded-2xl border p-2.5 text-xs font-bold cursor-pointer transition-all ${
                      checked
                        ? 'border-[#F4651A] bg-[#FFF5EF] text-[#F4651A] shadow-xs'
                        : 'border-black/[0.06] bg-white text-[#1A1A2E] hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="orderType"
                      value={type}
                      checked={checked}
                      onChange={() => setOrderType(type)}
                      className="accent-[#F4651A]"
                    />
                    <span>{type}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Dine-in Table Number */}
          {orderType === 'Dine-in' && (
            <div className="mb-3.5">
              <label htmlFor="checkout-table" className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
                Table number
              </label>
              <input
                id="checkout-table"
                type="text"
                inputMode="numeric"
                required
                value={tableNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  if (val.length <= 3) setTableNumber(val);
                }}
                placeholder="e.g. 4"
                maxLength={3}
                className="w-full rounded-2xl border border-black/[0.08] bg-white p-3.5 text-sm text-[#1A1A2E] placeholder:text-[#A0A0AB] focus:border-[#F4651A] focus:outline-none focus:ring-2 focus:ring-[#F4651A]/20 transition-all"
              />
            </div>
          )}

          {/* Home Delivery Address */}
          {orderType === 'Home Delivery' && (
            <div className="mb-3.5">
              <label htmlFor="checkout-address" className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
                Delivery address
              </label>
              <textarea
                id="checkout-address"
                rows={3}
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Full delivery address (house #, street, landmark)"
                minLength={10}
                className="w-full rounded-2xl border border-black/[0.08] bg-white p-3.5 text-sm text-[#1A1A2E] placeholder:text-[#A0A0AB] focus:border-[#F4651A] focus:outline-none focus:ring-2 focus:ring-[#F4651A]/20 transition-all"
              />
            </div>
          )}

          {/* Special Instructions */}
          <div className="mb-5">
            <label htmlFor="checkout-notes" className="block text-xs font-bold text-[#1A1A2E] mb-1.5">
              Special instructions
            </label>
            <textarea
              id="checkout-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Less spicy, no onion, extra oregano, etc."
              maxLength={500}
              className="w-full rounded-2xl border border-black/[0.08] bg-white p-3.5 text-sm text-[#1A1A2E] placeholder:text-[#A0A0AB] focus:border-[#F4651A] focus:outline-none focus:ring-2 focus:ring-[#F4651A]/20 transition-all"
            />
            <p className="mt-1 text-right text-[10px] text-[#8E8E93]">{notes.length}/500</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F4651A] py-3.5 text-center text-sm sm:text-base font-black text-white shadow-[0_6px_20px_rgba(244,101,26,0.35)] hover:bg-[#E05A15] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing Order...</span>
              </>
            ) : (
              <>
                <MessageSquareShare className="h-5 w-5" />
                <span>📲 Send Order on WhatsApp</span>
              </>
            )}
          </button>

          <p className="mt-3 text-center text-[11px] font-medium text-[#8E8E93]">
            Your order will be safely saved in database and opened in WhatsApp. Please press Send there to confirm.
          </p>
        </form>
      </div>
    </div>
  );
}
