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

// Helper function to encrypt data
const encrypt = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

// Helper function to hash passwords
const hashPassword = (password) => {
  return CryptoJS.SHA256(password).toString();
};

export async function register(req) {
  try {
    const { name, email, password, userType, emergencyContact, medicalInfo, medicalLicense, facility, hmo } = req.body;
    
    // Decrypt password from client
    const decryptedPassword = decrypt(password);
    if (!decryptedPassword) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Invalid password format' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Hash password for storage
    const hashedPassword = hashPassword(decryptedPassword);
    
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'User with this email already exists' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Create user in auth system
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email,
      password: decryptedPassword,
    });
    
    if (authError) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: authError.message 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Create user profile in database
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([
        { 
          auth_id: authUser.user.id,
          name,
          email,
          password: hashedPassword, // Store hashed password
          user_type: userType,
          emergency_contact: emergencyContact || null,
          medical_info: medicalInfo || null,
          medical_license: medicalLicense || null,
          facility: facility || null,
          hmo: hmo || null,
          created_at: new Date(),
          updated_at: new Date()
        }
      ])
      .select()
      .single();
    
    if (userError) {
      // Rollback auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      
      return new Response(JSON.stringify({ 
        success: false, 
        message: userError.message 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Generate JWT token
    const { data: session } = await supabase.auth.signInWithPassword({
      email,
      password: decryptedPassword,
    });
    
    // Remove sensitive data before returning
    delete user.password;
    
    return new Response(JSON.stringify({ 
      success: true, 
      user,
      token: session.session.access_token,
      refreshToken: session.session.refresh_token
    }), { 
      status: 201, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error during registration' 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

export async function login(req) {
  try {
    const { email, password } = req.body;
    
    // Decrypt password from client
    const decryptedPassword = decrypt(password);
    if (!decryptedPassword) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Invalid password format' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Sign in with Supabase Auth
    const { data: session, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: decryptedPassword,
    });
    
    if (authError) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Invalid email or password' 
      }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Get user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, user_type, created_at, updated_at')
      .eq('auth_id', session.user.id)
      .single();
    
    if (userError) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'User profile not found' 
      }), { 
        status: 404, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      user,
      token: session.session.access_token,
      refreshToken: session.session.refresh_token
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Login error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error during login' 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

export async function refreshToken(req) {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Refresh token is required' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Refresh the session
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    
    if (error) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Invalid or expired refresh token' 
      }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      token: data.session.access_token,
      refreshToken: data.session.refresh_token
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error during token refresh' 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

export async function validateLicense(req) {
  try {
    const { licenseNumber, country, state } = req.body;
    
    // This would typically call an external API to validate the license
    // For now, we'll simulate a validation process
    
    // Mock validation - in production, this would call a real license verification API
    const isValid = licenseNumber && licenseNumber.length > 5;
    
    if (!isValid) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Invalid license number' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'License validated successfully',
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('License validation error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error during license validation' 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}