import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get token dan user dari URL params (direct redirect dari backend)
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    console.log('🔍 GoogleCallback - Checking URL params:');
    console.log('Token:', token ? 'YES (' + token.substring(0, 20) + '...)' : 'NO');
    console.log('User param:', userParam ? 'YES' : 'NO');

    if (token && userParam) {
      try {
        // Parse user data dari URL params
        const user = JSON.parse(decodeURIComponent(userParam));
        
        console.log('✅ Google login success!');
        console.log('Email:', user.email);
        console.log('Needs password:', user.needsPassword);
        
        if (user.needsPassword) {
          console.log('🔐 User needs to set password');
          navigate('/auth/verify-email', {
            state: { user, token },
            replace: true
          });
        } else {
          console.log('✅ User already has password, logging in');
          
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('active_user', JSON.stringify(user));
          localStorage.setItem('user_type', 'member');
          localStorage.setItem('login_time', new Date().toISOString());
          
          // Force navigate to member page
          setTimeout(() => {
            navigate('/member', { replace: true });
          }, 500);
        }
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        navigate('/auth/login?error=parse_failed');
      }
    } else {
      console.error('❌ Missing token or user in URL params');
      console.log('URL:', window.location.href);
      navigate('/auth/login?error=missing_params');
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 border-4 text-[#8D6E63] animate-spin mx-auto mb-4" />
        <p className="text-[#3E2723] font-medium text-sm sm:text-base">Memproses login dengan Google...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
