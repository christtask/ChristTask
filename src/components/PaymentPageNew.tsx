import React, { useState, useRef } from "react";
import {
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useNavigate } from "react-router-dom";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PLANS = [
  {
    id: "weekly",
    label: "Weekly",
    price: 4.5,
    priceLabel: "£4.50",
    benefits: [
      "Access to all features",
      "Weekly billing",
      "Cancel anytime",
      "Priority support"
    ]
  },
  {
    id: "monthly",
    label: "Monthly",
    price: 11.99,
    priceLabel: "£11.99",
    benefits: [
      "Access to all features",
      "Monthly billing",
      "Cancel anytime",
      "Best value!"
    ]
  }
];

const PaymentPageNewInner = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("weekly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Ref for scrolling to payment form
  const formRef = useRef(null) as { current: HTMLFormElement | null };

  // Features for the styled box
  const features = [
    'Unlimited use of all tools',
    'AI-powered answers',
    'Private community access',
    'Priority support',
    'No hidden fees',
  ];

  // Scroll to payment form
  const handleScrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  async function handleSubmit(event: any) {
    event.preventDefault();
    setLoading(true);
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setShowSuccess(false);

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet.");
      setLoading(false);
      setIsProcessing(false);
      return;
    }

    try {
      // Get card details from Stripe Elements
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError("Card Element not found");
        setLoading(false);
        setIsProcessing(false);
        return;
      }

      // Create payment method from card details
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement as any,
      });

      if (paymentMethodError) {
        setError(paymentMethodError.message || "Failed to create payment method");
        setLoading(false);
        setIsProcessing(false);
        return;
      }

      // Call backend to create Subscription with selected plan & coupon
      const res = await fetch("https://christtask-backend.onrender.com/create-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          plan: selectedPlan,
          paymentMethodId: paymentMethod.id,
        }),
    });

    const data = await res.json();

    if (res.status !== 200) {
        const errorMessage = data.error || "Failed to create subscription";
        setError(errorMessage);
        console.error("Backend error:", data);
      setLoading(false);
        setIsProcessing(false);
      return;
    }

      // After successful API call
      setIsProcessing(false);
      setShowSuccess(true);
      
      // If we get here, the subscription was created successfully
      setSuccess(
        `🎉 Subscription successful! Plan: ${PLANS.find(p => p.id === selectedPlan)?.label}. Your subscription is now active.`
      );
      
      // Clear the form
      setCouponCode("");
      cardElement.clear();
      
      // Immediately redirect to chatbot
      navigate('/chatbot');
      return;
      
    } catch (err) {
      console.error("Payment error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsProcessing(false);
      
      // Auto-clear error after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    }

    setLoading(false);
    setIsProcessing(false);
  }

  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl" style={{ background: '#1a1a1a', padding: '24px 56px', minWidth: 480, maxWidth: 600, width: '100%', margin: '40px auto', color: '#fff' }}>
      {/* EXCLUSIVE Badge */}
      <div className="absolute top-0 right-0 mt-4 mr-4 px-4 py-1 rounded-full text-xs font-semibold" style={{ background: '#18181b', color: '#8B5CF6', letterSpacing: '0.08em' }}>EXCLUSIVE</div>
      {/* Toggle */}
      <div className="flex justify-center items-center mb-[30px] gap-4 w-full">
        <span className={`font-medium text-base transition-colors duration-200 ${selectedPlan === 'weekly' ? 'text-[#8B5CF6]' : 'text-[#888888]'}`}>Weekly</span>
        <button
          className="relative w-16 h-9 rounded-full transition-colors duration-200 focus:outline-none"
          style={{ background: '#0a0a0a', border: '1px solid #222' }}
          onClick={() => setSelectedPlan(selectedPlan === 'weekly' ? 'monthly' : 'weekly')}
          aria-label="Toggle plan"
          type="button"
        >
          <span
            className={`absolute top-1 left-1 w-7 h-7 rounded-full shadow-md transform transition-transform duration-200 ${selectedPlan === 'monthly' ? 'translate-x-7' : ''}`}
            style={{ background: '#8B5CF6' }}
          />
        </button>
        <span className={`font-medium text-base transition-colors duration-200 ${selectedPlan === 'monthly' ? 'text-[#8B5CF6]' : 'text-[#888888]'}`}>Monthly</span>
      </div>
      {/* Payment Form */}
      <form onSubmit={handleSubmit} ref={formRef} className="w-full">
        <div style={{ display: "flex", gap: 32, justifyContent: "center", marginBottom: 36, flexWrap: "wrap" }}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              style={{
                flex: "1 1 220px",
                minWidth: 220,
                maxWidth: 260,
                cursor: loading ? "not-allowed" : "pointer",
                border: selectedPlan === plan.id ? "3px solid #8B5CF6" : "2px solid #23272F",
                borderRadius: 14,
                padding: 28,
                background: selectedPlan === plan.id ? "#23272F" : "#22242b",
                boxShadow: selectedPlan === plan.id ? "0 4px 24px #8B5CF644" : "0 2px 8px #0002",
                transition: "all 0.2s",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
              }}
            >
          <input
                type="radio"
                name="plan"
                value={plan.id}
                checked={selectedPlan === plan.id}
                onChange={() => setSelectedPlan(plan.id)}
            disabled={loading}
                style={{ position: "absolute", top: 18, right: 18 }}
              />
              <div style={{ fontSize: 38, fontWeight: 900, color: selectedPlan === plan.id ? "#8B5CF6" : "#fff", marginBottom: 8, letterSpacing: 1 }}>{plan.priceLabel}</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 18, letterSpacing: 0.5 }}>{plan.label}</div>
              <div style={{ flexGrow: 1 }} />
              <ul style={{ paddingLeft: 0, margin: 0, color: "#fff", fontSize: 15, listStyle: "none", width: "100%", marginTop: 18 }}>
                {plan.benefits.map((benefit, i) => (
                  <li key={i} style={{ marginBottom: 8, display: "flex", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, marginRight: 8, color: "#fff" }}>✔</span> {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ fontWeight: 600, color: "#fff" }}>
          Coupon Code (optional):
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            disabled={loading}
              style={{ width: "100%", marginTop: 6, marginBottom: 0, padding: 12, borderRadius: 8, border: "2px solid #23272F", fontSize: 16, background: "#23272F", color: "#fff" }}
          />
        </label>
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={{ fontWeight: 600, color: "#fff" }}>
          Card Details:
          <div
            style={{
                border: "2px solid #23272F",
                padding: 14,
                borderRadius: 8,
                marginTop: 6,
                background: "#23272F"
            }}
          >
            <CardElement options={{ hidePostalCode: true }} />
          </div>
        </label>
        </div>

        <button
          type="submit"
          disabled={!stripe || loading || isProcessing}
          className="w-full py-3 rounded-full bg-[#8B5CF6] text-white font-bold text-lg shadow-lg hover:bg-purple-700 transition-all duration-300 mt-4"
          style={{ letterSpacing: 1, fontWeight: 900, fontSize: 20, cursor: (loading || isProcessing) ? 'not-allowed' : 'pointer' }}
        >
          {loading || isProcessing ? "Processing..." : `Subscribe to ${PLANS.find(p => p.id === selectedPlan)?.label}`}
        </button>
      </form>

      {error && (
        <div style={{ 
          color: "#ff5252", 
          marginTop: 22, 
          textAlign: "center", 
          fontWeight: 700,
          padding: "12px",
          background: "#ff525211",
          borderRadius: "8px",
          border: "1px solid #ff525233"
        }}>
          ❌ {error}
        </div>
      )}
      {success && showSuccess && (
        <div style={{ 
          color: "#00e676", 
          marginTop: 22, 
          textAlign: "center", 
          fontWeight: 700,
          padding: "16px",
          background: "#00e67611",
          borderRadius: "8px",
          border: "1px solid #00e67633"
        }}>
          <div style={{ marginBottom: "12px" }}>{success}</div>
          <button
            onClick={() => navigate('/success')}
            style={{
              background: "linear-gradient(90deg, #00e676 0%, #00c853 100%)",
              color: "#fff",
              padding: "8px 16px",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Start Chat Now →
          </button>
        </div>
      )}
    </div>
  );
};

export default function PaymentPageNew() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentPageNewInner />
    </Elements>
  );
}
