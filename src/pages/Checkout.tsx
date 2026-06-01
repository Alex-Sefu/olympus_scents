import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/utils';
import { usePageTitle } from '../hooks/usePageTitle';
import './Checkout.css';

interface ShippingForm {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  county: string;
}

const EMPTY_SHIPPING: ShippingForm = {
  full_name: '', email: '', phone: '',
  address: '', city: '', postal_code: '', county: '',
};

export default function Checkout() {
  const { user, profile } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  usePageTitle('Finalizare Comandă');

  const [shipping, setShipping] = useState<ShippingForm>({
    ...EMPTY_SHIPPING,
    full_name: profile?.full_name ?? '',
    email: user?.email ?? '',
  });
  const [errors, setErrors]     = useState<Partial<ShippingForm>>({});
  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setShipping(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<ShippingForm> = {};
    if (!shipping.full_name.trim()) e.full_name = 'Câmp obligatoriu';
    if (!shipping.email.trim())     e.email     = 'Câmp obligatoriu';
    if (!shipping.phone.trim())     e.phone     = 'Câmp obligatoriu';
    if (!shipping.address.trim())   e.address   = 'Câmp obligatoriu';
    if (!shipping.city.trim())      e.city      = 'Câmp obligatoriu';
    if (!shipping.postal_code.trim()) e.postal_code = 'Câmp obligatoriu';
    if (!shipping.county.trim())    e.county    = 'Câmp obligatoriu';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || !user) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Verifică stoc pentru fiecare produs
      for (const item of items) {
        const { data: parfum } = await supabase
          .from('parfumuri')
          .select('stoc, nume_parfum')
          .eq('id', item.parfum_id)
          .single();

        if (!parfum || parfum.stoc < item.quantity) {
          setErrorMsg(`Stoc insuficient pentru "${parfum?.nume_parfum ?? 'produs necunoscut'}". Disponibil: ${parfum?.stoc ?? 0}`);
          setLoading(false);
          return;
        }
      }

      // 2. Creează comanda
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id:            user.id,
          status:             'PAID', // simulăm plata — înlocuiește cu PENDING când integrezi Stripe real
          total,
          shipping_name:      shipping.full_name,
          shipping_address:   `${shipping.address}, ${shipping.county}`,
          shipping_city:      shipping.city,
          shipping_postal_code: shipping.postal_code,
          shipping_phone:     shipping.phone,
        })
        .select('id')
        .single();

      if (orderError || !order) throw new Error(orderError?.message ?? 'Eroare creare comandă');

      // 3. Inserează liniile comenzii
      const orderItems = items.map(item => ({
        order_id:    order.id,
        parfum_id:   item.parfum_id,
        parfum_name: item.parfum?.nume_parfum ?? '',
        unit_price:  item.parfum?.pret ?? 0,
        quantity:    item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw new Error(itemsError.message);

      // 4. Scade stocul pentru fiecare produs
      for (const item of items) {
        const { data: parfum } = await supabase
          .from('parfumuri')
          .select('stoc')
          .eq('id', item.parfum_id)
          .single();

        if (parfum) {
          await supabase
            .from('parfumuri')
            .update({ stoc: parfum.stoc - item.quantity })
            .eq('id', item.parfum_id);
        }
      }

      // 5. Golește coșul
      await clearCart();

      // 6. Redirect la confirmare
      navigate(`/order-confirmation/${order.id}`);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'A apărut o eroare. Încearcă din nou.';
      setErrorMsg(message);
      setLoading(false);
    }
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1 className="checkout-title">Finalizare comandă</h1>
        <p className="checkout-subtitle">Completează datele de livrare pentru a plasa comanda.</p>
      </div>

      {errorMsg && <div className="checkout-error">{errorMsg}</div>}

      <div className="checkout-layout">

        {/* Formular livrare */}
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <div className="checkout-card">
            <h2 className="checkout-section-title">Date de livrare</h2>

            <div className="checkout-grid">
              <div className="checkout-field checkout-field--full">
                <label className="checkout-label">Nume complet <span className="checkout-req">*</span></label>
                <input className={`checkout-input ${errors.full_name ? 'checkout-input--err' : ''}`}
                  name="full_name" value={shipping.full_name} onChange={handleChange}
                  placeholder="Ion Popescu" />
                {errors.full_name && <span className="checkout-err-msg">{errors.full_name}</span>}
              </div>

              <div className="checkout-field">
                <label className="checkout-label">Email <span className="checkout-req">*</span></label>
                <input className={`checkout-input ${errors.email ? 'checkout-input--err' : ''}`}
                  name="email" type="email" value={shipping.email} onChange={handleChange}
                  placeholder="ion@exemplu.com" />
                {errors.email && <span className="checkout-err-msg">{errors.email}</span>}
              </div>

              <div className="checkout-field">
                <label className="checkout-label">Telefon <span className="checkout-req">*</span></label>
                <input className={`checkout-input ${errors.phone ? 'checkout-input--err' : ''}`}
                  name="phone" type="tel" value={shipping.phone} onChange={handleChange}
                  placeholder="07xx xxx xxx" />
                {errors.phone && <span className="checkout-err-msg">{errors.phone}</span>}
              </div>

              <div className="checkout-field checkout-field--full">
                <label className="checkout-label">Adresă <span className="checkout-req">*</span></label>
                <input className={`checkout-input ${errors.address ? 'checkout-input--err' : ''}`}
                  name="address" value={shipping.address} onChange={handleChange}
                  placeholder="Str. Exemplu nr. 10, Ap. 5" />
                {errors.address && <span className="checkout-err-msg">{errors.address}</span>}
              </div>

              <div className="checkout-field">
                <label className="checkout-label">Județ <span className="checkout-req">*</span></label>
                <input className={`checkout-input ${errors.county ? 'checkout-input--err' : ''}`}
                  name="county" value={shipping.county} onChange={handleChange}
                  placeholder="Cluj" />
                {errors.county && <span className="checkout-err-msg">{errors.county}</span>}
              </div>

              <div className="checkout-field">
                <label className="checkout-label">Localitate <span className="checkout-req">*</span></label>
                <input className={`checkout-input ${errors.city ? 'checkout-input--err' : ''}`}
                  name="city" value={shipping.city} onChange={handleChange}
                  placeholder="Cluj-Napoca" />
                {errors.city && <span className="checkout-err-msg">{errors.city}</span>}
              </div>

              <div className="checkout-field">
                <label className="checkout-label">Cod poștal <span className="checkout-req">*</span></label>
                <input className={`checkout-input ${errors.postal_code ? 'checkout-input--err' : ''}`}
                  name="postal_code" value={shipping.postal_code} onChange={handleChange}
                  placeholder="400000" />
                {errors.postal_code && <span className="checkout-err-msg">{errors.postal_code}</span>}
              </div>
            </div>
          </div>

          {/* Notă Stripe */}
          <div className="checkout-stripe-note">
            <span className="checkout-stripe-icon">🔒</span>
            <span>
              Plata este procesată în siguranță. Momentan comanda se plasează direct —
              integrarea Stripe poate fi activată ulterior prin Supabase Edge Functions.
            </span>
          </div>

          <div className="checkout-form-footer">
            <button type="button" className="btn-secondary"
              onClick={() => navigate('/cart')}>
              ← Înapoi la coș
            </button>
            <button type="submit" className="btn-primary checkout-submit-btn" disabled={loading}>
              {loading ? 'Se plasează comanda...' : `Plasează comanda • ${formatPrice(total)}`}
            </button>
          </div>
        </form>

        {/* Sumar produse */}
        <div className="checkout-summary">
          <h2 className="checkout-summary-title">Produsele tale</h2>
          {items.map(item => (
            <div key={item.id} className="checkout-summary-item">
              <div className="checkout-summary-img">
                {item.parfum?.image_url
                  ? <img src={item.parfum.image_url} alt={item.parfum.nume_parfum} />
                  : <span>{item.parfum?.brand?.charAt(0)}</span>
                }
              </div>
              <div className="checkout-summary-info">
                <p className="checkout-summary-name">{item.parfum?.nume_parfum}</p>
                <p className="checkout-summary-brand">{item.parfum?.brand} × {item.quantity}</p>
              </div>
              <span className="checkout-summary-price">
                {formatPrice((item.parfum?.pret ?? 0) * item.quantity)}
              </span>
            </div>
          ))}
          <div className="checkout-summary-total">
            <span>Total</span>
            <span className="checkout-total-val">{formatPrice(total)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
