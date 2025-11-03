import React from 'react';
import { useTranslation } from 'react-i18next';

const I18nTest: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '10px' }}>
      <h3>i18n Test</h3>
      <p>Current language: {i18n.language}</p>
      <p>animals.tabs.basic: "{t('animals.tabs.basic')}"</p>
      <p>animals.tabs.seo: "{t('animals.tabs.seo')}"</p>
      <p>animals.tabs.images: "{t('animals.tabs.images')}"</p>
      <p>animals.tabs.qrCode: "{t('animals.tabs.qrCode')}"</p>
    </div>
  );
};

export default I18nTest;