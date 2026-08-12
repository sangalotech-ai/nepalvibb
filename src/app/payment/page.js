"use client";

import { useState, useEffect, useCallback, Suspense } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Shield, Lock, CheckCircle, Mountain,
  Clock, Users, Calendar, ArrowLeft, CreditCard, Info,
  ChevronRight, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

function PaymentContent() {
  const searchParams = useSearchParams();
  const tripId = searchParams.get('tripId');
  const initialAmount = searchParams.get('amount') || '1800';

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('idle'); 
  const [transaction, setTransaction] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paypal'); 
  
  const [bookingDetails, setBookingDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: '',
    groupSize: '1'
  });

  useEffect(() => {
    const fetchTrip = async () => {
      if (!tripId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/chat?id=${tripId}`);
        const data = await res.json();
        if (data) {
          setTrip(data);
          // Format dates to YYYY-MM-DD for input[type="date"]
          const formatDate = (dateStr) => {
            if (!dateStr) return '';
            try {
              const d = new Date(dateStr);
              return d.toISOString().split('T')[0];
            } catch (e) {
              return '';
            }
          };

          setBookingDetails(prev => ({
            ...prev,
            firstName: data.name?.split(' ')[0] || '',
            lastName: data.name?.split(' ').slice(1).join(' ') || '',
            email: data.email || '',
            phone: data.phone || '',
            // Handle both legacy and new field names for auto-fill
            startDate: formatDate(data.startDate || data.departure_date),
            endDate: formatDate(data.endDate || data.return_date),
            groupSize: data.adults?.toString() || data.group || '1'
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [tripId]);

  const totalAmount = parseFloat(trip?.price || initialAmount);
  const currency = "NOK";

  const isFormValid = bookingDetails.firstName && bookingDetails.lastName && bookingDetails.email && bookingDetails.startDate && bookingDetails.endDate;

  const createOrder = useCallback((data, actions) => {
    if (!isFormValid) {
      setErrorMsg('Vennligst fyll ut alle feltene (navn, e-post og datoer) før du betaler.');
      setStatus('error');
      return Promise.reject(new Error('Missing fields'));
    }
    setStatus('processing');
    return actions.order.create({
      purchase_units: [
        {
          description: trip?.trip_title || trip?.destination || "Skreddersydd eventyr",
          amount: {
            currency_code: currency,
            value: totalAmount.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: "NEPALVIBB",
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW'
      },
    }).catch(err => {
      setStatus('error');
      setErrorMsg('Kunne ikke opprette betaling. Vennligst prøv igjen.');
      throw err;
    });
  }, [totalAmount, trip, currency, isFormValid]);

  const onApprove = useCallback((data, actions) => {
    setStatus('processing');
    return actions.order.capture().then((details) => {
      setTransaction({
        transactionId: details.id,
        payerName: details.payer.name.given_name + ' ' + (details.payer.name.surname || ''),
        payerEmail: details.payer.email_address,
        amount: details.purchase_units[0].amount.value,
        currency: details.purchase_units[0].amount.currency_code,
        status: details.status,
        tripId
      });
      setStatus('success');
    }).catch(err => {
      setStatus('error');
      setErrorMsg('Betalingen ble ikke fullført. Vennligst kontakt kundeservice.');
    });
  }, [tripId]);

  const onError = useCallback((err) => {
    setStatus('error');
    setErrorMsg('Det oppsto en feil med betalingsleverandøren. Vennligst prøv igjen.');
    console.error('Payment Error:', err);
  }, []);

  const onCancel = useCallback(() => {
    setStatus('idle');
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  if (status === 'success' && transaction) {
    return <SuccessScreen transaction={transaction} />;
  }

  return (
    <PayPalScriptProvider options={{
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb",
      currency: currency,
      intent: 'capture',
    }}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 py-4 px-6 sticky top-0 z-[60]">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-xl font-black tracking-tighter">
              <span className="text-primary">NEPAL</span><span className="text-orange-500">VIBB</span>
            </Link>
            <div className="flex items-center space-x-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>Sikker betaling</span>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-12">

            <div className="lg:w-[60%] space-y-8">
              <div>
                <Link href="/plan-your-trip" className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors mb-6">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Tilbake til planlegging
                </Link>
                <h1 className="text-3xl font-black text-primary uppercase tracking-tighter mb-2">Fullfør din bestilling</h1>
                <p className="text-gray-400 font-medium">Vennligst bekreft detaljene nedenfor for å sikre din reise.</p>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Steg 1: Reiseinformasjon</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Fornavn</label>
                    <input 
                      type="text" 
                      placeholder="Fornavn"
                      value={bookingDetails.firstName}
                      onChange={e => { setErrorMsg(''); setBookingDetails({ ...bookingDetails, firstName: e.target.value }); }}
                      className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl px-6 py-4 text-sm font-bold focus:border-primary focus:bg-white outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Etternavn</label>
                    <input 
                      type="text" 
                      placeholder="Etternavn"
                      value={bookingDetails.lastName}
                      onChange={e => { setErrorMsg(''); setBookingDetails({ ...bookingDetails, lastName: e.target.value }); }}
                      className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl px-6 py-4 text-sm font-bold focus:border-primary focus:bg-white outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">E-post</label>
                    <input 
                      type="email" 
                      placeholder="ola@nordmann.no"
                      value={bookingDetails.email}
                      onChange={e => { setErrorMsg(''); setBookingDetails({ ...bookingDetails, email: e.target.value }); }}
                      className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl px-6 py-4 text-sm font-bold focus:border-primary focus:bg-white outline-none transition-all" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Antall personer</label>
                    <input 
                      type="number" 
                      min="1"
                      value={bookingDetails.groupSize}
                      onChange={e => setBookingDetails({ ...bookingDetails, groupSize: e.target.value })}
                      className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl px-6 py-4 text-sm font-bold focus:border-primary focus:bg-white outline-none transition-all" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Departure date</label>
                    <div className="relative">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input 
                        type="date" 
                        value={bookingDetails.startDate}
                        onChange={e => { setErrorMsg(''); setBookingDetails({ ...bookingDetails, startDate: e.target.value }); }}
                        className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl px-14 py-4 text-sm font-bold focus:border-primary focus:bg-white outline-none transition-all" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Return date</label>
                    <div className="relative">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input 
                        type="date" 
                        value={bookingDetails.endDate}
                        min={bookingDetails.startDate}
                        onChange={e => { setErrorMsg(''); setBookingDetails({ ...bookingDetails, endDate: e.target.value }); }}
                        className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-2xl px-14 py-4 text-sm font-bold focus:border-primary focus:bg-white outline-none transition-all" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Steg 2: Betalingsmetode</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setPaymentMethod('paypal')}
                    type="button"
                    className={cn(
                      "p-6 rounded-3xl border-2 transition-all flex flex-col items-center space-y-3 relative overflow-hidden group",
                      paymentMethod === 'paypal' ? "border-primary bg-emerald-50/40 shadow-md" : "border-gray-100 bg-white hover:border-gray-200"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="h-7 w-auto" viewBox="0 0 124 33" fill="none">
                        <path d="M46.211 6.749h-6.839a.95.95 0 00-.939.802l-2.766 17.537a.57.57 0 00.564.658h3.265c.475 0 .882-.35.955-.819l.781-4.954a.95.95 0 01.939-.802h2.247c4.606 0 7.247-2.235 7.944-6.66.326-2.072-.05-3.619-1.077-4.633-1.096-1.082-2.92-1.63-5.074-1.63z" fill="#003087"/>
                        <path d="M47.16 11.968c-.4.257-2.607.257-2.607.257h-1.391l.86-5.452h1.455c1.472 0 2.378.361 2.651.986.262.598.05 1.543-.968 4.209z" fill="#003087"/>
                        <path d="M68.868 6.749h-3.265a.95.95 0 00-.939.802l-.128.813h-.177c-.571-.853-1.89-1.182-3.255-1.182-3.053 0-5.65 2.311-6.155 5.518-.258 1.637.108 3.197.981 4.175.795.892 1.944 1.258 3.238 1.258 2.327 0 3.633-1.464 3.633-1.464l-.128.813a.57.57 0 00.564.658h2.951c.475 0 .882-.35.955-.819l2.766-17.537a.57.57 0 00-.564-.658zm-4.301 7.151c-.266 1.656-1.564 2.822-3.15 2.822-.843 0-1.503-.277-1.862-.781-.358-.505-.445-1.228-.246-2.037.266-1.656 1.572-2.822 3.15-2.822.828 0 1.488.277 1.854.781.366.505.453 1.228.254 2.037z" fill="#003087"/>
                        <path d="M84.444 6.749h-3.265a.95.95 0 00-.939.802l-.781 4.954h-2.247c-.475 0-.882.35-.955.819l-.361 2.29a.57.57 0 00.564.658h2.247l-.781 4.954a.57.57 0 00.564.658h3.265a.95.95 0 00.939-.802l.781-4.954h2.247c3.053 0 5.65-2.311 6.155-5.518.258-1.637-.108-3.197-.981-4.175-.795-.892-1.944-1.258-3.238-1.258zm-1.077 4.954c-.266 1.656-1.564 2.822-3.15 2.822h-1.455l.504-3.197h1.455c.828 0 1.488.277 1.854.781.366.505.453 1.228.254 2.037z" fill="#003087"/>
                        <path d="M12.911 0H3.666A1.855 1.855 0 001.83 1.566L.007 13.125a1.113 1.113 0 001.101 1.285h3.693c.928 0 1.724-.684 1.867-1.6L7.9 4.96a.742.742 0 01.734-.627h3.766c3.606 0 6.425 1.464 5.378 6.033-.475 2.072-2.124 4.093-4.981 4.093h-2.45a1.113 1.113 0 00-1.101.942l-1.042 6.608a.742.742 0 00.734.858h3.047c.928 0 1.724-.684 1.867-1.6l.872-5.534a1.855 1.855 0 011.835-1.566h.749c5.155 0 9.176-2.094 10.394-7.44C31.066 1.696 25.109 0 12.911 0z" fill="#003087"/>
                        <path d="M14.931 7.227h-3.766a.742.742 0 00-.734.627l-1.232 7.848a1.113 1.113 0 01-1.101.942H4.405l-1.042 6.608a.742.742 0 00.734.858h3.047c.928 0 1.724-.684 1.867-1.6l.872-5.534a1.855 1.855 0 011.835-1.566h.749c5.155 0 9.176-2.094 10.394-7.44.757-3.327-.991-5.743-7.93-5.743z" fill="#0079C1"/>
                      </svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">PayPal / Rask Sjekk</span>
                    <div className="flex items-center space-x-1.5 pt-1">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[8px] font-black uppercase tracking-wider">PayPal Express</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => setPaymentMethod('stripe')}
                    type="button"
                    className={cn(
                      "p-6 rounded-3xl border-2 transition-all flex flex-col items-center space-y-3 relative overflow-hidden group",
                      paymentMethod === 'stripe' ? "border-primary bg-emerald-50/40 shadow-md" : "border-gray-100 bg-white hover:border-gray-200"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                       <CreditCard className="w-6 h-6 text-primary" />
                       <span className="font-black text-sm text-primary uppercase tracking-tight">Betalingskort</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Kreditt- / Debetkort</span>
                    <div className="flex items-center space-x-1.5 pt-1">
                      <span className="px-1.5 py-0.5 bg-blue-900 text-white rounded text-[8px] font-black italic tracking-tighter">VISA</span>
                      <span className="px-1.5 py-0.5 bg-red-600 text-white rounded text-[8px] font-black italic tracking-tighter">MC</span>
                      <span className="px-1.5 py-0.5 bg-blue-500 text-white rounded text-[8px] font-black tracking-tighter">AMEX</span>
                      <span className="px-1.5 py-0.5 bg-gray-900 text-white rounded text-[8px] font-black tracking-tighter">APPLE</span>
                    </div>
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-50">
                  {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center shadow-sm">
                      <AlertCircle className="w-4 h-4 mr-2" /> {errorMsg}
                    </div>
                  )}

                  {!isFormValid && (
                    <div className="mb-8 p-6 bg-orange-50 border border-orange-100 rounded-3xl space-y-2">
                      <div className="flex items-center space-x-2 text-orange-600">
                        <Info className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Informasjon mangler</span>
                      </div>
                      <p className="text-[11px] text-orange-500 font-medium italic">Vennligst fyll ut navn, e-post og reisedatoer ovenfor for å aktivere betalingsknappene.</p>
                    </div>
                  )}

                  {paymentMethod === 'paypal' ? (
                      <div className={cn("space-y-4 transition-opacity", !isFormValid ? "opacity-50 pointer-events-none" : "opacity-100")}>
                        <PayPalButtons
                          style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 55 }}
                          disabled={!isFormValid}
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={onError}
                          onCancel={onCancel}
                        />
                      </div>
                  ) : (
                    <Elements stripe={stripePromise}>
                      <StripeForm 
                        amount={totalAmount} 
                        tripId={tripId} 
                        details={bookingDetails} 
                        onSuccess={(tx) => { setTransaction(tx); setStatus('success'); }} 
                        onError={(msg) => { setErrorMsg(msg); setStatus('error'); }}
                        disabled={!isFormValid}
                      />
                    </Elements>
                  )}
                </div>
              </div>
            </div>

            <aside className="lg:w-[40%]">
              <div className="sticky top-32 space-y-6">
                <div className="bg-white rounded-[3rem] border border-gray-100 overflow-hidden shadow-sm p-1">
                  <div className="relative h-48 rounded-[2.5rem] overflow-hidden m-2">
                    <img 
                      src={trip?.trip_image || "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80"} 
                      className="w-full h-full object-cover" 
                      alt="" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent flex items-end p-8">
                      <div>
                        <p className="text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{trip?.destination || 'Nepal'}</p>
                        <h3 className="text-white font-black text-xl uppercase tracking-tighter leading-tight">
                          {trip?.trip_title || trip?.destination || "Himalaya-reise"}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Varighet</p>
                        <div className="flex items-center space-x-2 text-primary font-bold text-sm">
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span>{trip?.duration || '10'} Dager</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Reisende</p>
                        <div className="flex items-center space-x-2 text-primary font-bold text-sm">
                          <Users className="w-4 h-4 text-orange-500" />
                          <span>{bookingDetails.groupSize} Personer</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-50 space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 font-medium italic">Grunnpris</span>
                        <span className="font-black text-primary">NOK {totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 font-medium italic">Bestillingsgebyr</span>
                        <span className="font-bold text-emerald-500 uppercase">Gratis</span>
                      </div>
                      <div className="pt-4 border-t-2 border-dashed border-gray-100 flex items-center justify-between">
                        <span className="text-3xl font-black text-primary tracking-tighter">NOK {totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 space-y-3">
                      <div className="flex items-center space-x-3 text-primary">
                        <Shield className="w-5 h-5 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Nepalvibb-beskyttelse</span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic">
                        Din betaling er beskyttet. Full refusjon ved avbestilling 30 dager før avreise.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}

function StripeForm({ amount, tripId, details, onSuccess, onError, disabled }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || disabled) return;

    setProcessing(true);
    try {
      const res = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, tripId, details }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Intent creation failed');
      
      const { clientSecret } = data;

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { 
            name: `${details.firstName} ${details.lastName}`, 
            email: details.email 
          },
        },
      });

      if (error) {
        onError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tripId, paymentIntentId: paymentIntent.id }),
        });

        onSuccess({
          transactionId: paymentIntent.id,
          payerName: `${details.firstName} ${details.lastName}`,
          payerEmail: details.email,
          amount: amount,
          currency: 'NOK',
          status: 'COMPLETED',
          tripId
        });
      }
    } catch (err) {
      onError(err.message || "Tilkobling til Stripe mislyktes.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border-2 border-gray-100 rounded-2xl bg-gray-50/50">
        <CardElement options={{
          style: {
            base: { fontSize: '16px', color: '#1a3a3a', '::placeholder': { color: '#9ca3af' } },
          },
        }} />
      </div>
      <button
        type="submit"
        disabled={processing || !stripe || disabled}
        className={cn(
          "w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center space-x-3 shadow-xl",
          (processing || disabled) ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-primary text-white hover:bg-emerald-900"
        )}
      >
        {processing ? (
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Shield className="w-4 h-4" />
            <span>Betal nå med kort</span>
          </>
        )}
      </button>
    </form>
  );
}

function SuccessScreen({ transaction }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white border-b border-gray-100 py-6 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter italic text-primary">NEPALVIBB</Link>
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50/50">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full text-center space-y-10"
        >
          <div className="space-y-4">
            <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl rotate-12 mb-6">
               <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-primary uppercase tracking-tighter italic">Bestilling bekreftet!</h1>
            <p className="text-gray-500 font-medium italic">Takk, {transaction.payerName.split(' ')[0]}. Ditt eventyr starter nå! 🙏</p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl text-left grid grid-cols-2 gap-6">
            <div className="col-span-2 flex items-center justify-between border-b border-gray-50 pb-4">
               <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Transaksjonsinfo</span>
               <span className="text-[10px] font-black uppercase px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">Suksess</span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Transaksjons-ID</p>
              <p className="text-xs font-black text-primary">{transaction.transactionId?.slice(0, 15)}...</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Totalbetalt</p>
              <p className="text-xs font-black text-primary">{transaction.currency} {transaction.amount}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link 
              href={`/plan-your-trip/chat/${transaction.tripId}`} 
              className="flex-1 bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-emerald-900 transition-all flex items-center justify-center"
            >
              Melding til spesialist <ChevronRight className="ml-2 w-4 h-4" />
            </Link>
            <Link 
              href="/dashboard" 
              className="flex-1 border-2 border-gray-100 text-primary py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:border-primary transition-all"
            >
              Min oversikt
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>}>
      <PaymentContent />
    </Suspense>
  );
}
