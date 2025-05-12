import { useState, useEffect } from 'react';
import { 
  PayPalScriptProvider, 
  PayPalButtons,
  usePayPalScriptReducer
} from '@paypal/react-paypal-js';
import type {
  CreateOrderActions,
  CreateOrderData,
  OnApproveActions,
  OnApproveData
} from '@paypal/paypal-js/types/components/buttons';
import { 
  fetchAccountData, 
  submitPayment, 
  getPayPalClientId
} from '../services/paymentApi';
import type { 
  AccountData, 
  PaymentRequest, 
  PaymentResponse 
} from '../services/paymentApi';

interface PaymentFormProps {
  onSuccess: (data: PaymentResponse) => void;
  onError: (error: Error) => void;
}

const PaymentForm = ({ onSuccess, onError }: PaymentFormProps) => {
  const [{ isPending }] = usePayPalScriptReducer();
  const [amount, setAmount] = useState<number>(10);
  const [description, setDescription] = useState<string>('Payment for services');

  const handleCreateOrder = (_data: CreateOrderData, actions: CreateOrderActions) => {
    return actions.order.create({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            value: amount.toString(),
            currency_code: 'USD'
          },
          description: description
        },
      ],
    });
  };

  const handleApprove = async (_data: OnApproveData, actions: OnApproveActions) => {
    try {
      // Get PayPal order details
      if (!actions.order) {
        throw new Error('PayPal order actions not available');
      }
      
      const orderDetails = await actions.order.capture();
      console.log('PayPal order captured:', orderDetails);
      
      // Submit to our mock API
      const paymentRequest: PaymentRequest = {
        amount: amount,
        currency: 'USD',
        description: description
      };
      
      const response = await submitPayment(paymentRequest);
      onSuccess(response);
    } catch (error) {
      console.error('Payment error:', error);
      onError(error instanceof Error ? error : new Error('Unknown payment error'));
    }
  };

  return (
    <div className="payment-form">
      <div className="form-group">
        <label htmlFor="amount">Amount (USD):</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min="1"
          step="0.01"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description:</label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      
      {isPending ? (
        <div className="loading">Loading PayPal buttons...</div>
      ) : (
        <PayPalButtons
          style={{ layout: "vertical" }}
          createOrder={handleCreateOrder}
          onApprove={handleApprove}
          onError={(err) => onError(err instanceof Error ? err : new Error(String(err)))}
        />
      )}
    </div>
  );
};

const PayPalPayment = () => {
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAccountData = async () => {
      try {
        const data = await fetchAccountData();
        setAccountData(data);
      } catch (err) {
        setError('Failed to load account data');
        console.error('Error fetching account data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccountData();
  }, []);

  const handlePaymentSuccess = (response: PaymentResponse) => {
    setPaymentResult(response);
  };

  const handlePaymentError = (err: Error) => {
    setError(`Payment failed: ${err.message || 'Unknown error'}`);
    console.error('Payment error:', err);
  };

  return (
    <div className="paypal-payment-container">
      <h2>PayPal Payment Integration</h2>
      
      {isLoading ? (
        <div className="loading">Loading account data...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="account-info">
            <h3>Account Information</h3>
            {accountData && (
              <div>
                <p><strong>Name:</strong> {accountData.name}</p>
                <p><strong>Balance:</strong> {accountData.balance} {accountData.currency}</p>
              </div>
            )}
          </div>
          
          <div className="payment-section">
            <h3>Make a Payment</h3>
            <PayPalScriptProvider options={{ 
              clientId: getPayPalClientId(),
              currency: "USD"
            }}>
              <PaymentForm 
                onSuccess={handlePaymentSuccess} 
                onError={handlePaymentError} 
              />
            </PayPalScriptProvider>
          </div>
          
          {paymentResult && (
            <div className={`payment-result ${paymentResult.success ? 'success' : 'failure'}`}>
              <h3>Payment Result</h3>
              <p><strong>Status:</strong> {paymentResult.status}</p>
              <p><strong>Transaction ID:</strong> {paymentResult.transactionId}</p>
              <p><strong>Amount:</strong> {paymentResult.amount} {paymentResult.currency}</p>
              <p><strong>Timestamp:</strong> {new Date(paymentResult.timestamp).toLocaleString()}</p>
              {paymentResult.message && <p><strong>Message:</strong> {paymentResult.message}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PayPalPayment; 