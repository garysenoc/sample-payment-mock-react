// Mock payment API service

// PayPal credentials
const PAYPAL_CLIENT_ID = 'Af5DrGhsONOr7FEkJBndAbtFqqNG-XqE0JDk_YtXg4eirj8nCmTwQ1d_6jYcyXfssAKVtB2ybQrtHJh8';
// const PAYPAL_SECRET = 'EDJj_VY0nHYHEO93C5cZvPEuWIThulwXemU6VLIrahHrB-3shGaKrhvXtoCwit3dR3Q6bHNJ2ECctbE4';

// Types
export interface AccountData {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  message?: string;
}

// Mock API functions
export const fetchAccountData = async (): Promise<AccountData> => {
  console.log('Fetching account data...');
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock account data
  return {
    id: 'acc_12345',
    name: 'John Doe',
    balance: 1250.75,
    currency: 'USD'
  };
};

export const submitPayment = async (payment: PaymentRequest): Promise<PaymentResponse> => {
  console.log('Submitting payment request:', payment);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Simulate successful payment (with 90% success rate)
  const isSuccessful = Math.random() < 0.9;
  
  if (isSuccessful) {
    const response: PaymentResponse = {
      success: true,
      transactionId: `txn_${Math.random().toString(36).substring(2, 10)}`,
      amount: payment.amount,
      currency: payment.currency,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
    
    console.log('Payment successful:', response);
    return response;
  } else {
    const response: PaymentResponse = {
      success: false,
      transactionId: `txn_${Math.random().toString(36).substring(2, 10)}`,
      amount: payment.amount,
      currency: payment.currency,
      timestamp: new Date().toISOString(),
      status: 'failed',
      message: 'Payment processing failed. Please try again.'
    };
    
    console.log('Payment failed:', response);
    return response;
  }
};

// Export PayPal client ID for the component
export const getPayPalClientId = () => PAYPAL_CLIENT_ID; 