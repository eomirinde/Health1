import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);

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
    .select('*')
    .eq('auth_id', data.user.id)
    .single();
  
  if (userError || !user) {
    return null;
  }
  
  return user;
}

export async function getProfile(req) {
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
    
    // Remove sensitive data
    delete user.password;
    
    return new Response(JSON.stringify({ 
      success: true, 
      ...user
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Get profile error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error while fetching profile' 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

export async function updateProfile(req) {
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
    
    const { name, phone, address, dateOfBirth, gender, bloodType } = await req.json();
    
    // Update user profile
    const { data, error } = await supabase
      .from('users')
      .update({ 
        name,
        phone,
        address,
        date_of_birth: dateOfBirth,
        gender,
        blood_type: bloodType,
        updated_at: new Date()
      })
      .eq('id', user.id)
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
    
    // Remove sensitive data
    delete data.password;
    
    return new Response(JSON.stringify({ 
      success: true, 
      ...data
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error while updating profile' 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

export async function updateEmergencyContact(req) {
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
    
    const emergencyContact = await req.json();
    
    // Update emergency contact
    const { data, error } = await supabase
      .from('users')
      .update({ 
        emergency_contact: emergencyContact,
        updated_at: new Date()
      })
      .eq('id', user.id)
      .select('emergency_contact')
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
      emergencyContact: data.emergency_contact
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Update emergency contact error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error while updating emergency contact' 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

export async function updateMedicalInfo(req) {
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
    
    const medicalInfo = await req.json();
    
    // Update medical info
    const { data, error } = await supabase
      .from('users')
      .update({ 
        medical_info: medicalInfo,
        updated_at: new Date()
      })
      .eq('id', user.id)
      .select('medical_info')
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
      medicalInfo: data.medical_info
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Update medical info error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error while updating medical information' 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

export async function uploadProfileImage(req) {
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
    
    // Parse form data
    const formData = await req.formData();
    const file = formData.get('profileImage');
    
    if (!file) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No file uploaded' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Upload to Supabase Storage
    const fileName = `${user.id}-${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: uploadError.message 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);
    
    // Update user profile with image URL
    const { data, error } = await supabase
      .from('users')
      .update({ 
        profile_image: publicUrlData.publicUrl,
        updated_at: new Date()
      })
      .eq('id', user.id)
      .select('profile_image')
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
      profileImage: data.profile_image
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error while uploading profile image' 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}