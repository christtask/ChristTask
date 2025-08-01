import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentPage from './PaymentPage';

const stripePromise = loadStripe('pk_live_51RZvWwFEfjI8S6GYRjyPtWWfSZ0iQEAEQ3oMfKSsjtBP5h47m7G2HvnpKEyXYJNZ9WyvCVcl1TJTSRNQMvaQju6d00YaYe3dhu', {
  apiVersion: '2023-10-16',
  stripeAccount: undefined,
});

const PaymentPageWrapper = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentPage />
    </Elements>
  );
};

export default PaymentPageWrapper; 