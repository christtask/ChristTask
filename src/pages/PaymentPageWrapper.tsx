import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentPage from './PaymentPage';

// Load Stripe with your publishable key
const stripePromise = loadStripe('pk_live_51RZvWwFEfjI8S6GYRjyPtWWfSZ0iQEAEQ3oMfKSsjtBP5h47m7G2HvnpKEyXYJNZ9WyvCVcl1TJTSRNQMvaQju6d00YaYe3dhu');

const PaymentPageWrapper = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentPage />
    </Elements>
  );
};

export default PaymentPageWrapper; 