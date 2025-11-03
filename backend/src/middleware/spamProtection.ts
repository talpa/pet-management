import { Request, Response, NextFunction } from 'express';

// Známé disposable email domény
const disposableEmailDomains = [
  '10minutemail.com',
  'mailinator.com',
  'guerrillamail.com',
  'temp-mail.org',
  'throwaway.email',
  'dispostable.com',
  'tempmail.ninja',
  'maildrop.cc',
  'getnada.com',
  'tempmailaddress.com',
  'yopmail.com',
  'mailnesia.com',
  'spambox.us',
  'spam4.me',
  'emailondeck.com',
  'temp-mail.io',
  'mohmal.com',
  'sharklasers.com',
  'trbvm.com',
  'guerrillamailblock.com'
];

// Podezřelé vzory v emailech
const suspiciousEmailPatterns = [
  /^[a-zA-Z]+\d{6,}@/, // jmeno123456@
  /^[a-zA-Z]{1,3}\d{4,}@/, // abc1234@
  /^\d+[a-zA-Z]{1,3}\d+@/, // 123abc456@
  /^test\d*@/, // test123@
  /^admin\d*@/, // admin123@
  /^user\d*@/, // user123@
  /^spam\d*@/, // spam123@
  /^[a-z]{20,}@/, // velmi dlouhé náhodné řetězce
];

// Podezřelá jména
const suspiciousNamePatterns = [
  /^[a-zA-Z]+\d{4,}$/, // jmeno1234
  /^test\d*$/i, // test123
  /^admin\d*$/i, // admin123
  /^user\d*$/i, // user123
  /^spam\d*$/i, // spam123
  /^[a-z]{1,2}$/i, // velmi krátké
  /^[a-z]{20,}$/i, // velmi dlouhé náhodné
  /^(.)\1{3,}$/i, // aaaa, bbbb atd.
];

export const validateRegistrationData = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  try {
    // Kontrola disposable email domén
    const emailDomain = email.toLowerCase().split('@')[1];
    if (disposableEmailDomains.includes(emailDomain)) {
      res.status(400).json({
        success: false,
        message: 'Registrace s dočasnými emailovými adresami není povolena.',
        code: 'DISPOSABLE_EMAIL'
      });
      return;
    }

    // Kontrola podezřelých vzorů v emailu
    const emailUser = email.toLowerCase().split('@')[0];
    if (suspiciousEmailPatterns.some(pattern => pattern.test(email.toLowerCase()))) {
      res.status(400).json({
        success: false,
        message: 'Email adresa vypadá podezřele. Použijte prosím platnou emailovou adresu.',
        code: 'SUSPICIOUS_EMAIL'
      });
      return;
    }

    // Kontrola podezřelých jmen
    if (suspiciousNamePatterns.some(pattern => pattern.test(name))) {
      res.status(400).json({
        success: false,
        message: 'Jméno vypadá podezřele. Použijte prosím své skutečné jméno.',
        code: 'SUSPICIOUS_NAME'
      });
      return;
    }

    // Kontrola velmi slabých hesel
    const weakPasswords = [
      'password', 'password123', '123456', '123456789', 'qwerty', 
      'abc123', 'password1', 'admin', 'letmein', 'welcome',
      'monkey', 'dragon', '111111', '123123'
    ];
    
    if (weakPasswords.includes(password.toLowerCase())) {
      res.status(400).json({
        success: false,
        message: 'Heslo je příliš slabé. Vyberte si silnější heslo.',
        code: 'WEAK_PASSWORD'
      });
      return;
    }

    // Kontrola, že jméno obsahuje pouze povolené znaky
    const nameRegex = /^[a-zA-ZáčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ\s\-\.]{2,50}$/;
    if (!nameRegex.test(name)) {
      res.status(400).json({
        success: false,
        message: 'Jméno obsahuje nepovolené znaky nebo je příliš krátké/dlouhé.',
        code: 'INVALID_NAME_FORMAT'
      });
      return;
    }

    // Kontrola duplicitních znaků v řadě
    if (/(.)\1{4,}/.test(name) || /(.)\1{4,}/.test(emailUser)) {
      res.status(400).json({
        success: false,
        message: 'Příliš mnoho opakujících se znaků.',
        code: 'REPETITIVE_CHARACTERS'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při ověřování dat'
    });
  }
};

// Honeypot field validation
export const validateHoneypot = (req: Request, res: Response, next: NextFunction) => {
  // Honeypot pole by mělo být prázdné
  if (req.body.website || req.body.url || req.body.homepage) {
    console.log('🍯 Honeypot triggered:', req.ip, req.body);
    
    // Simulujeme úspěch, ale neregistrujeme uživatele
    res.status(200).json({
      success: true,
      message: 'Registrace úspěšná! Můžete se nyní přihlásit.',
      data: {
        user: {
          id: 999999,
          name: req.body.name,
          email: req.body.email,
          role: 'user'
        }
      }
    });
    return;
  }
  
  next();
};