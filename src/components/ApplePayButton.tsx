import React, { useEffect, useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Apple } from 'lucide-react';

interface ApplePayButtonProps {
  onPaymentSuccess: (paymentMethod: any) => void;
  onPaymentError: (error: string) => void;
  amount: number;
  currency: string;
  plan: string;
  email: string;
  disabled?: boolean;
}

export const ApplePayButton: React.FC<ApplePayButtonProps> = ({
  onPaymentSuccess,
  onPaymentError,
  amount,
  currency,
  plan,
  email,
  disabled = false
}) => {
  const stripe = useStripe();
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if Apple Pay is available
    if (stripe) {
      stripe.paymentRequest({
        country: 'GB',
        currency: currency.toLowerCase(),
        total: {
          label: `ChristTask ${plan} subscription`,
          amount: Math.round(amount * 100), // Convert to cents
        },
        requestPayerName: true,
        requestPayerEmail: true,
      }).then((paymentRequest) => {
        paymentRequest.on('paymentmethod', async (event) => {
          setIsLoading(true);
          try {
            onPaymentSuccess(event.paymentMethod);
          } catch (error) {
            onPaymentError(error instanceof Error ? error.message : 'Payment failed');
          } finally {
            setIsLoading(false);
          }
        });

        paymentRequest.on('cancel', () => {
          onPaymentError('Payment was cancelled');
        });

        paymentRequest.canMakePayment().then((result) => {
          setIsApplePayAvailable(result?.applePay === 'supported');
        });
      });
    }
  }, [stripe, amount, currency, plan, email, onPaymentSuccess, onPaymentError]);

  if (!isApplePayAvailable) {
    return null; // Don't show button if Apple Pay is not available
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800 flex items-center justify-center gap-2 h-12"
      disabled={disabled || isLoading}
      onClick={() => {
        if (stripe) {
          stripe.paymentRequest({
            country: 'GB',
            currency: currency.toLowerCase(),
            total: {
              label: `ChristTask ${plan} subscription`,
              amount: Math.round(amount * 100),
            },
            requestPayerName: true,
            requestPayerEmail: true,
          }).then((paymentRequest) => {
            paymentRequest.show();
          });
        }
      }}
    >
      <Apple className="w-5 h-5" />
      {isLoading ? 'Processing...' : 'Pay with Apple Pay'}
    </Button>
  );
}; 