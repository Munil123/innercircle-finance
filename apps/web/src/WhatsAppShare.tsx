import React from 'react';
import { WhatsappShareButton, WhatsappIcon } from 'react-share';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';

interface WhatsAppShareProps {
  variant?: 'button' | 'icon';
  size?: number;
  className?: string;
  customMessage?: string;
}

const WhatsAppShare: React.FC<WhatsAppShareProps> = ({
  variant = 'button',
  size = 32,
  className = '',
  customMessage
}) => {
  const { user } = useSupabaseAuth();
  
  // Generate referral code based on user ID (you can customize this logic)
  const generateReferralCode = (userId: string): string => {
    const prefix = 'IC';
    const hash = userId.substring(0, 8).toUpperCase();
    return `${prefix}${hash}`;
  };

  // Create the invite URL with referral code
  const createInviteUrl = (): string => {
    const baseUrl = window.location.origin;
    const referralCode = user ? generateReferralCode(user.id) : 'GUEST';
    return `${baseUrl}/auth?ref=${referralCode}`;
  };

  // Create the WhatsApp message
  const createMessage = (): string => {
    const referralCode = user ? generateReferralCode(user.id) : 'GUEST';
    const inviteUrl = createInviteUrl();
    const userName = user?.user_metadata?.full_name || user?.email || 'A friend';
    
    if (customMessage) {
      return customMessage.replace(/\{referralCode\}/g, referralCode)
                        .replace(/\{inviteUrl\}/g, inviteUrl)
                        .replace(/\{userName\}/g, userName);
    }

    return `🚀 Hey! ${userName} invited you to join InnerCircle Finance - the smart way to manage your money!\n\n💰 Get personalized financial insights\n📊 Track expenses and investments\n🤝 Join our exclusive financial community\n\n🎁 Use referral code: ${referralCode}\n\nJoin now: ${inviteUrl}\n\n#FinanceApp #MoneyManagement #InnerCircle`;
  };

  const shareUrl = createInviteUrl();
  const message = createMessage();

  if (variant === 'icon') {
    return (
      <WhatsappShareButton
        url={shareUrl}
        title={message}
        separator=" "
        className={className}
      >
        <WhatsappIcon size={size} round />
      </WhatsappShareButton>
    );
  }

  return (
    <WhatsappShareButton
      url={shareUrl}
      title={message}
      separator=" "
      className={`inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors duration-200 ${className}`}
    >
      <WhatsappIcon size={20} round className="mr-2" />
      Invite via WhatsApp
    </WhatsappShareButton>
  );
};

export default WhatsAppShare;
export type { WhatsAppShareProps };

// Hook for easy integration
export const useReferralSystem = () => {
  const { user } = useSupabaseAuth();
  
  const generateReferralCode = (userId: string): string => {
    const prefix = 'IC';
    const hash = userId.substring(0, 8).toUpperCase();
    return `${prefix}${hash}`;
  };

  const getReferralCode = (): string => {
    return user ? generateReferralCode(user.id) : 'GUEST';
  };

  const getInviteUrl = (): string => {
    const baseUrl = window.location.origin;
    const referralCode = getReferralCode();
    return `${baseUrl}/auth?ref=${referralCode}`;
  };

  const getShareStats = async () => {
    // You can implement tracking logic here
    // This could track how many people used the referral code
    return {
      totalShares: 0,
      totalSignups: 0,
      conversionRate: 0
    };
  };

  return {
    referralCode: getReferralCode(),
    inviteUrl: getInviteUrl(),
    getShareStats,
    user
  };
};
