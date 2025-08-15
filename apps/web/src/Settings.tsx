import React, { useState } from 'react';
import WhatsAppShare, { useReferralSystem } from './WhatsAppShare';

const Settings: React.FC = () => {
  const { referralCode, inviteUrl, user } = useReferralSystem();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    whatsapp: true
  });
  
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    shareTransactions: false
  });

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handlePrivacyChange = (type: keyof typeof privacy) => {
    setPrivacy(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>Settings</h1>
        <div className="header-actions">
          <WhatsAppShare 
            variant="button" 
            className="share-button"
            customMessage="🔧 Managing my finances just got easier with InnerCircle Finance! Take control of your money like I did. Use my referral code: {referralCode} to get started! 💰 {inviteUrl}"
          />
        </div>
      </div>

      <div className="settings-content">
        {/* Account Information */}
        <section className="settings-section">
          <h2>Account Information</h2>
          <div className="account-info">
            <div className="info-item">
              <label>Email:</label>
              <span>{user?.email || 'Not available'}</span>
            </div>
            <div className="info-item">
              <label>Name:</label>
              <span>{user?.user_metadata?.full_name || 'Not set'}</span>
            </div>
            <div className="info-item">
              <label>Member Since:</label>
              <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not available'}</span>
            </div>
          </div>
        </section>

        {/* Referral System */}
        <section className="settings-section">
          <h2>Referral System</h2>
          <div className="referral-info">
            <div className="referral-code">
              <label>Your Referral Code:</label>
              <div className="code-display">
                <span className="code">{referralCode}</span>
                <button
                  className="copy-button"
                  onClick={() => navigator.clipboard.writeText(referralCode)}
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="referral-url">
              <label>Invite URL:</label>
              <div className="url-display">
                <span className="url">{inviteUrl}</span>
                <button
                  className="copy-button"
                  onClick={() => navigator.clipboard.writeText(inviteUrl)}
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="share-options">
              <label>Share via:</label>
              <div className="share-buttons">
                <WhatsAppShare size={40} variant="icon" />
                <WhatsAppShare
                  variant="button" 
                  customMessage="💰 Hey! I've been using InnerCircle Finance to manage my money and it's amazing! Join me with code {referralCode}: {inviteUrl}"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="settings-section">
          <h2>Notifications</h2>
          <div className="notification-settings">
            <div className="setting-item">
              <label>
                <input
                  type="checkbox" 
                  checked={notifications.email}
                  onChange={() => handleNotificationChange('email')}
                />
                Email Notifications
              </label>
              <span className="setting-description">Receive important updates via email</span>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox" 
                  checked={notifications.push}
                  onChange={() => handleNotificationChange('push')}
                />
                Push Notifications
              </label>
              <span className="setting-description">Get instant notifications on your device</span>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox" 
                  checked={notifications.whatsapp}
                  onChange={() => handleNotificationChange('whatsapp')}
                />
                WhatsApp Updates
              </label>
              <span className="setting-description">Receive updates via WhatsApp</span>
            </div>
          </div>
        </section>

        {/* Privacy Settings */}
        <section className="settings-section">
          <h2>Privacy Settings</h2>
          <div className="privacy-settings">
            <div className="setting-item">
              <label>
                <input
                  type="checkbox" 
                  checked={privacy.profileVisible}
                  onChange={() => handlePrivacyChange('profileVisible')}
                />
                Profile Visible to Friends
              </label>
              <span className="setting-description">Allow friends to see your profile</span>
            </div>
            <div className="setting-item">
              <label>
                <input
                  type="checkbox" 
                  checked={privacy.shareTransactions}
                  onChange={() => handlePrivacyChange('shareTransactions')}
                />
                Share Transaction Insights
              </label>
              <span className="setting-description">Allow sharing anonymized spending insights</span>
            </div>
          </div>
        </section>

        {/* App Preferences */}
        <section className="settings-section">
          <h2>App Preferences</h2>
          <div className="app-preferences">
            <div className="setting-item">
              <label>Currency:</label>
              <select className="currency-select">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="INR">INR (₹)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Date Format:</label>
              <select className="date-format-select">
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div className="setting-item">
              <label>Theme:</label>
              <select className="theme-select">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .settings {
          padding: 20px;
          max-width: 1000px;
          margin: 0 auto;
          background-color: #f8f9fa;
          min-height: 100vh;
        }
        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .settings-header h1 {
          margin: 0;
          color: #333;
          font-size: 2rem;
        }
        .header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .share-button {
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .settings-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .settings-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .settings-section h2 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 1.25rem;
          border-bottom: 2px solid #e9ecef;
          padding-bottom: 10px;
        }
        .account-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .info-item:last-child {
          border-bottom: none;
        }
        .info-item label {
          font-weight: 600;
          color: #666;
        }
        .info-item span {
          color: #333;
        }
        .referral-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .referral-code, .referral-url {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .code-display, .url-display {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        .code, .url {
          flex: 1;
          font-family: monospace;
          font-weight: 600;
          color: #495057;
        }
        .copy-button {
          padding: 6px 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background-color 0.2s;
        }
        .copy-button:hover {
          background: #0056b3;
        }
        .share-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .share-buttons {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        .notification-settings, .privacy-settings, .app-preferences {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .setting-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 12px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .setting-item:last-child {
          border-bottom: none;
        }
        .setting-item label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          color: #333;
          cursor: pointer;
        }
        .setting-item input[type="checkbox"] {
          margin: 0;
        }
        .setting-description {
          font-size: 0.875rem;
          color: #666;
          margin-left: 24px;
        }
        .currency-select, .date-format-select, .theme-select {
          padding: 8px 12px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          background: white;
          font-size: 0.875rem;
          min-width: 150px;
        }
        .app-preferences .setting-item {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }
        .app-preferences .setting-item label {
          margin: 0;
          font-weight: 600;
          color: #666;
        }
        @media (max-width: 768px) {
          .settings {
            padding: 10px;
          }
          .settings-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
          .header-actions {
            justify-content: center;
          }
          .code-display, .url-display {
            flex-direction: column;
            align-items: stretch;
          }
          .share-buttons {
            justify-content: center;
          }
          .app-preferences .setting-item {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;
