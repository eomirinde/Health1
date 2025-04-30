import { createClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);

// Encryption key for sensitive data
const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY');

// Helper function to decrypt data
const decrypt = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// Helper function to get user ID from token
async function getUserFromToken(req) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  
  // Verify the token
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data.user) {
    return null;
  }
  
  // Get the user profile
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', data.user.id)
    .single();
  
  if (userError || !user) {
    return null;
  }
  
  return user;
}

export async function processPayment(req) {
  try {
    const user = await getUserFromToken(req);
    
    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Unauthorized' 
      }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    const { amount, description, paymentMethodId } = await req.json();
    
    // Validate input
    if (!amount || !description || !paymentMethodId) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Missing required fields' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Get payment method
    const { data: paymentMethod, error: methodError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', paymentMethodId)
      .eq('user_id', user.id)
      .single();
    
    if (methodError || !paymentMethod) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Payment method not found' 
      }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // In a real app, this would call a payment processor API
    // For now, we'll simulate a successful payment
    
    // Record the payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([
        {
          user_id: user.id,
          payment_method_id: paymentMethodId,
          amount,
          description,
          status: 'completed',
          created_at: new Date(),
          updated_at: new Date()
        }
      ])
      .select()
      .single();
    
    if (paymentError) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: paymentError.message 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      paymentId: payment.id,
      status: payment.status,
      message: 'Payment processed successfully'
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Process payment error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error while processing payment' 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

export async function getPaymentHistory(req) {
  try {
    const user = await getUserFromToken(req);
    
    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Unauthorized' 
      }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Get payment history
    const { data: payments, error } = await supabase
      .from('payments')
      .select('id, amount, description, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: error.message 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      payments: payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        description: payment.description,
        status: payment.status,
        date: payment.created_at
      }))
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error while fetching payment history' 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

export async function getPaymentMethods(req) {
  try {
    const user = await getUserFromToken(req);
    
    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Unauthorized' 
      }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Get payment methods
    const { data: methods, error } = await supabase
      .from('payment_methods')
      .select('id, cardholder_name, card_number, expiry_date, card_type')
      .eq('user_id', user.id);
    
    if (error) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: error.message 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      methods: methods.map(method => ({
        id: method.id,
        cardholderName: method.cardholder_name,
        cardNumber: method.card_number, // This should be masked except last 4 digits
        expiryDate: method.expiry_date,
        cardType: method.card_type
      }))
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error while fetching payment methods' 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

export async function addPaymentMethod(req) {
  try {
    const user = await getUserFromToken(req);
    
    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Unauthorized' 
      }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    const { cardholderName, cardNumber, expiryDate, cvv } = await req.json();
    
    // Decrypt sensitive data
    const decryptedCardNumber = decrypt(cardNumber);
    const decryptedCvv = decrypt(cvv);
    const decryptedExpiryDate = decrypt(expiryDate);
    
    if (!decryptedCardNumber || !decryptedCvv || !decryptedExpiryDate) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Invalid card data format' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Validate card data (basic validation)
    const cardNumberClean = decryptedCardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cardNumberClean)) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Invalid card number' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    if (!/^\d{2}\/\d{2}$/.test(decryptedExpiryDate)) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Invalid expiry date format (MM/YY)' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    if (!/^\d{3,4}$/.test(decryptedCvv)) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Invalid CVV' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Determine card type based on first digit
    let cardType = 'unknown';
    const firstDigit = cardNumberClean.charAt(0);
    if (firstDigit === '4') {
      cardType = 'visa';
    } else if (firstDigit === '5') {
      cardType = 'mastercard';
    } else if (firstDigit === '3') {
      cardType = 'amex';
    } else if (firstDigit === '6') {
      cardType = 'discover';
    }
    
    // In a real app, this would validate with a payment processor
    // For now, we'll just store the masked card number
    const maskedCardNumber = `**** **** **** ${cardNumberClean.slice(-4)}`;
    
    // Add payment method
    const { data: method, error } = await supabase
      .from('payment_methods')
      .insert([
        {
          user_id: user.id,
          cardholder_name: cardholderName,
          card_number: maskedCardNumber,
          expiry_date: decryptedExpiryDate,
          card_type: cardType,
          created_at: new Date(),
          updated_at: new Date()
        }
      ])
      .select()
      .single();
    
    if (error) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: error.message 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      id: method.id,
      cardholderName: method.cardholder_name,
      cardNumber: method.card_number,
      expiryDate: method.expiry_date,
      cardType: method.card_type
    }), { 
      status: 201, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error while adding payment method' 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

export async function deletePaymentMethod(req, { params }) {
  try {
    const user = await getUserFromToken(req);
    
    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Unauthorized' 
      }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    const methodId = params.id;
    
    // Delete payment method
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', methodId)
      .eq('user_id', user.id);
    
    if (error) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: error.message 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Payment method deleted successfully'
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Delete payment method error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error while deleting payment method' 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}