import React from 'react';
import { Elements } from "@stripe/react-stripe-js";
import PaymentPage from './PaymentPage';
import { stripePromise } from '../lib/stripe';

const PaymentPageWrapper = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentPage />
    </Elements>
  );
};

export default PaymentPageWrapper; 