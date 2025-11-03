import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  cs: {
    translation: {
      common: {
        appName: 'Pet Management System',
        admin: 'Admin',
        user: 'Uživatel',
        loading: 'Načítání...',
        save: 'Uložit',
        cancel: 'Zrušit',
        edit: 'Upravit',
        delete: 'Smazat',
        create: 'Vytvořit',
        update: 'Aktualizovat',
        search: 'Hledat',
        filter: 'Filtrovat',
        clear: 'Vymazat',
        close: 'Zavřít',
        open: 'Otevřít',
        yes: 'Ano',
        no: 'Ne',
        ok: 'OK',
        or: 'nebo',
        unknownDate: 'Neznámé datum',
        invalidDate: 'Neplatné datum',
        locale: 'cs-CZ',
        addedOn: 'Přidáno',
        login: 'Přihlášení',
        home: 'Domů',
        backToHome: 'Zpět na hlavní stránku',
        seoUrlNotSet: 'SEO URL není nastavena',
        qrCodeLoadError: 'Nepodařilo se načíst QR kód',
        animalProfile: 'Profil zvířete',
        animalProfileDescription: 'Podívejte se na profil tohoto zvířete',
        generatingQR: 'Generuji QR kód...',
        qrCodeNotAvailable: 'QR kód není k dispozici',
        qrCodeAlt: 'QR kód pro profil zvířete',
        downloadQR: 'Stáhnout QR kód',
        share: 'Sdílet',
        copyLink: 'Kopírovat odkaz'
      },
      navigation: {
        home: 'Domů',
        login: 'Přihlášení',
        logout: 'Odhlášení',
        profile: 'Profil',
        settings: 'Nastavení',
        admin: 'Administrace',
        animals: 'Zvířata',
        myAnimals: 'Moje zvířata',
        myAccount: 'Můj účet',
        publicPage: 'Veřejná stránka',
        userManagement: 'Správa uživatelů',
        permissions: 'Oprávnění',
        animalSpecies: 'Druhy zvířat',
        statistics: 'Statistiky'
      },
      userManagement: {
        role: {
          admin: 'Administrátor',
          user: 'Uživatel'
        }
      },
      auth: {
        login: 'Přihlášení',
        logout: 'Odhlásit se',
        loginTab: 'Přihlášení',
        registerTab: 'Registrace',
        selectLoginMethod: 'Vyberte způsob přihlášení',
        loginWithGoogle: 'Přihlásit se pomocí Google',
        loginWithFacebook: 'Přihlásit se pomocí Facebook',
        testCheckAuth: 'Test CheckAuth (Debug)',
        goToHomePage: 'Jít na hlavní stránku (Pokud jste přihlášeni)',
        agreeTerms: 'Pokračováním souhlasíte s našimi podmínkami použití',
        vsCodeSimpleBrowser: 'VS Code Simple Browser:',
        vsCodeInstructions: 'Pro plné OAuth přihlášení otevřete aplikaci v hlavním prohlížeči:',
        vscodeInfo: {
          title: 'VS Code Simple Browser:',
          description: 'Pro plné OAuth přihlášení otevřete aplikaci v hlavním prohlížeči:',
          url: 'http://localhost:8080'
        },
        roles: {
          admin: 'Administrátor',
          user: 'Uživatel'
        }
      },
      pages: {
        myAnimals: 'Moje zvířata',
        adminAnimals: 'Správa všech zvířat'
      },
      descriptions: {
        myAnimalsDescription: 'Zde najdete všechna svá registrovaná zvířata',
        adminAnimalsManagement: 'Jako administrátor můžete spravovat všechna zvířata v systému'
      },
      emptyStates: {
        noAnimalsUser: 'Zatím nemáte registrovaná žádná zvířata',
        noAnimalsUserDesc: 'Začněte přidáním svého prvního domácího mazlíčka',
        noAnimalsAdmin: 'V systému zatím nejsou žádná zvířata',
        noAnimalsAdminDesc: 'Nová zvířata můžete přidat pomocí tlačítka níže nebo importovat testovací data'
      },
      actions: {
        addAnimal: 'Přidat zvíře',
        addMyPet: 'Přidat mého mazlíčka',
        viewDetail: 'Zobrazit detail'
      },
      errors: {
        failedToLoadAnimals: 'Nepodařilo se načíst vaše zvířata',
        failedToDeleteAnimal: 'Nepodařilo se smazat zvíře'
      },
      confirmations: {
        deleteAnimal: 'Opravdu chcete smazat zvíře "{{name}}"? Tato akce je nevratná.'
      },
      age: {
        years_zero: '{{count}} let',
        years_one: '{{count}} rok',
        years_few: '{{count}} roky',
        years_many: '{{count}} let',
        years_other: '{{count}} let',
        months_zero: '{{count}} měsíců',
        months_one: '{{count}} měsíc',
        months_few: '{{count}} měsíce',
        months_many: '{{count}} měsíců',
        months_other: '{{count}} měsíců',
        lessThanMonth: 'méně než měsíc'
      },
      statistics: {
        title: 'Statistiky a přehledy',
        overview: 'Přehled statistik',
        totalAnimals: 'Celkem zvířat',
        totalUsers: 'Celkem uživatelů',
        totalSpecies: 'Celkem druhů',
        averageAge: 'Průměrný věk',
        animalsBySpecies: 'Zvířata podle druhů',
        animalsByCategory: 'Zvířata podle kategorií',
        registrationTrends: 'Trend registrací',
        popularSpecies: 'Nejpopulárnější druhy',
        monthlyData: 'Měsíční data',
        showOnlyLast6Months: 'Zobrazit pouze posledních 6 měsíců',
        showAllData: 'Zobrazit všechna data',
        noData: 'Žádná data k dispozici',
        loading: 'Načítání statistik...',
        error: 'Chyba při načítání statistik'
      },
      animalDetail: {
        title: {
          notFound: 'Zvíře nenalezeno'
        },
        errors: {
          notFound: 'Zvíře nebylo nalezeno',
          loadingError: 'Chyba při načítání zvířete',
          animalNotFound: 'Zvíře nebylo nalezeno'
        },
        basicInfo: 'Základní informace',
        properties: 'Vlastnosti',
        notSpecified: 'Neuvedeno',
        measuredAt: 'Změřeno',
        additionalPhotos: 'Další fotografie',
        fields: {
          birthDate: 'Datum narození',
          owner: 'Majitel',
          scientificName: 'Vědecký název',
          description: 'Popis'
        },
        qrCode: {
          title: 'QR kód pro sdílení',
          description: 'Naskenujte QR kód pro rychlý přístup k profilu zvířete'
        },
        propertyNames: {
          weight: 'Váha',
          height: 'Výška',
          color: 'Barva',
          breed: 'Plemeno',
          gender: 'Pohlaví',
          microchip: 'Čip',
          vaccinated: 'Očkováno',
          neutered: 'Kastrováno/Sterilizováno',
          temperament: 'Temperament',
          specialNeeds: 'Speciální potřeby',
          medicalHistory: 'Zdravotní historie',
          eyeColor: 'Barva očí',
          markings: 'Značky/Znaky',
          allergies: 'Alergie'
        }
      },
      profile: {
        edit: 'Upravit',
        cancel: 'Zrušit',
        save: 'Uložit',
        changePassword: 'Změnit heslo',
        basicInfo: 'Základní informace',
        contact: 'Kontakt',
        social: 'Sociální sítě',
        name: 'Jméno',
        email: 'Email',
        phone: 'Telefon',
        company: 'Společnost',
        address: 'Adresa',
        viber: 'Viber',
        whatsapp: 'WhatsApp',
        signal: 'Signal',
        facebook: 'Facebook',
        instagram: 'Instagram',
        twitter: 'Twitter',
        linkedin: 'LinkedIn',
        currentPassword: 'Současné heslo',
        newPassword: 'Nové heslo',
        confirmPassword: 'Potvrdit heslo',
        emailReadonly: 'Email nelze změnit',
        viberHelp: 'Vaše Viber telefonní číslo',
        whatsappHelp: 'Vaše WhatsApp telefonní číslo',
        signalHelp: 'Vaše Signal telefonní číslo',
        facebookHelp: 'Odkaz na váš Facebook profil',
        instagramHelp: 'Vaše Instagram uživatelské jméno',
        twitterHelp: 'Vaše Twitter uživatelské jméno',
        linkedinHelp: 'Odkaz na váš LinkedIn profil',
        saveSuccess: 'Profil byl úspěšně uložen',
        saveError: 'Chyba při ukládání profilu',
        passwordMismatch: 'Hesla se neshodují',
        passwordChangeSuccess: 'Heslo bylo úspěšně změněno',
        passwordChangeError: 'Chyba při změně hesla',
        notFound: 'Profil nebyl nalezen'
      },
      home: {
        title: 'Pet Management System',
        footer: '© 2025 Pet Management System. Všechna práva vyhrazena.',
        heroSubtitle: 'Moderní systém pro správu domácích mazlíčků a jejich údajů',
        loginToSystem: 'Přihlásit se do systému',
        animalSingular: 'zvíře',
        animalPlural: 'zvířata',
        animalGenitive: 'zvířat',
        errorLoadingAnimals: 'Nepodařilo se načíst zvířata',
        unknownDate: 'Neznámé datum',
        invalidDate: 'Neplatné datum',
        searchResultsTitle: 'Výsledky vyhledávání',
        recentAnimalsTitle: 'Nejnovější zvířata',
        searchResultsCount: 'Nalezeno {{count}} {{countText}}',
        recentAnimalsSubtitle: 'Nejnovější registrovaná zvířata v systému',
        filteringAndSearch: 'Filtrování a vyhledávání',
        activeFiltersCount: 'Aktivní filtry ({{count}})',
        clearFilters: 'Vymazat filtry',
        searchPlaceholder: 'Hledat podle jména, popisu...',
        filterBySpecies: 'Filtrovat podle druhu',
        allSpecies: 'Všechny druhy',
        activeFilters: 'Aktivní filtry:',
        searchLabel: 'Hledání',
        speciesLabel: 'Druh',
        addedOn: 'Přidáno',
        clickForDetail: 'Klikněte pro detail',
        noAnimalsFound: 'Žádná zvířata nenalezena',
        noAnimalsYet: 'V systému zatím nejsou žádná zvířata',
        clearAllFilters: 'Vymazat všechny filtry',
        age: {
          year: 'rok',
          years2to4: 'roky',
          years5plus: 'let',
          month: 'měsíc',
          months2to4: 'měsíce',
          months5plus: 'měsíců',
          lessThanMonth: 'méně než měsíc'
        },
        infoCards: {
          management: {
            title: 'Správa zvířat',
            description: 'Komplexní systém pro registraci a správu všech vašich domácích mazlíčků na jednom místě.'
          },
          tracking: {
            title: 'Sledování a analýzy',
            description: 'Podrobné statistiky a přehledy o vašich zvířatech, jejich zdraví a aktivitách.'
          },
          profiles: {
            title: 'Veřejné profily',
            description: 'Každé zvíře má svůj vlastní veřejný profil s fotografiami a informacemi.'
          }
        }
      }
    }
  },
  en: {
    translation: {
      common: {
        appName: 'Pet Management System',
        admin: 'Admin',
        user: 'User',
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        create: 'Create',
        update: 'Update',
        search: 'Search',
        filter: 'Filter',
        clear: 'Clear',
        close: 'Close',
        open: 'Open',
        yes: 'Yes',
        no: 'No',
        ok: 'OK',
        or: 'or',
        unknownDate: 'Unknown date',
        invalidDate: 'Invalid date',
        locale: 'en-US',
        addedOn: 'Added on',
        login: 'Login',
        home: 'Home',
        backToHome: 'Back to Home Page',
        seoUrlNotSet: 'SEO URL is not set',
        qrCodeLoadError: 'Failed to load QR code',
        animalProfile: 'Animal Profile',
        animalProfileDescription: 'Check out this animal profile',
        generatingQR: 'Generating QR code...',
        qrCodeNotAvailable: 'QR code is not available',
        qrCodeAlt: 'QR code for animal profile',
        downloadQR: 'Download QR code',
        share: 'Share',
        copyLink: 'Copy link'
      },
      navigation: {
        home: 'Home',
        login: 'Login',
        logout: 'Logout',
        profile: 'Profile',
        settings: 'Settings',
        admin: 'Administration',
        animals: 'Animals',
        myAnimals: 'My Animals',
        myAccount: 'My Account',
        publicPage: 'Public Page',
        userManagement: 'User Management',
        permissions: 'Permissions',
        animalSpecies: 'Animal Species',
        statistics: 'Statistics'
      },
      userManagement: {
        role: {
          admin: 'Administrator',
          user: 'User'
        }
      },
      auth: {
        login: 'Login',
        logout: 'Log out',
        loginTab: 'Login',
        registerTab: 'Register',
        selectLoginMethod: 'Select login method',
        loginWithGoogle: 'Login with Google',
        loginWithFacebook: 'Login with Facebook',
        testCheckAuth: 'Test CheckAuth (Debug)',
        goToHomePage: 'Go to home page (If you are logged in)',
        agreeTerms: 'By continuing you agree to our terms of use',
        vsCodeSimpleBrowser: 'VS Code Simple Browser:',
        vsCodeInstructions: 'For full OAuth login open the application in main browser:',
        vscodeInfo: {
          title: 'VS Code Simple Browser:',
          description: 'For full OAuth login open the application in main browser:',
          url: 'http://localhost:8080'
        },
        roles: {
          admin: 'Administrator',
          user: 'User'
        }
      },
      pages: {
        myAnimals: 'My Animals',
        adminAnimals: 'Manage All Animals'
      },
      descriptions: {
        myAnimalsDescription: 'Here you can find all your registered animals',
        adminAnimalsManagement: 'As an administrator you can manage all animals in the system'
      },
      emptyStates: {
        noAnimalsUser: 'You have no registered animals yet',
        noAnimalsUserDesc: 'Start by adding your first pet',
        noAnimalsAdmin: 'There are no animals in the system yet',
        noAnimalsAdminDesc: 'You can add new animals using the button below or import test data'
      },
      actions: {
        addAnimal: 'Add Animal',
        addMyPet: 'Add My Pet',
        viewDetail: 'View Detail'
      },
      errors: {
        failedToLoadAnimals: 'Failed to load your animals',
        failedToDeleteAnimal: 'Failed to delete animal'
      },
      confirmations: {
        deleteAnimal: 'Do you really want to delete animal "{{name}}"? This action is irreversible.'
      },
      age: {
        years_zero: '{{count}} years',
        years_one: '{{count}} year',
        years_other: '{{count}} years',
        months_zero: '{{count}} months',
        months_one: '{{count}} month',
        months_other: '{{count}} months',
        lessThanMonth: 'less than month'
      },
      statistics: {
        title: 'Statistics and Overview',
        overview: 'Statistics Overview',
        totalAnimals: 'Total Animals',
        totalUsers: 'Total Users',
        totalSpecies: 'Total Species',
        averageAge: 'Average Age',
        animalsBySpecies: 'Animals by Species',
        animalsByCategory: 'Animals by Category',
        registrationTrends: 'Registration Trends',
        popularSpecies: 'Popular Species',
        monthlyData: 'Monthly Data',
        showOnlyLast6Months: 'Show only last 6 months',
        showAllData: 'Show all data',
        noData: 'No data available',
        loading: 'Loading statistics...',
        error: 'Error loading statistics'
      },
      animalDetail: {
        title: {
          notFound: 'Animal Not Found'
        },
        errors: {
          notFound: 'Animal not found',
          loadingError: 'Error loading animal',
          animalNotFound: 'Animal not found'
        },
        basicInfo: 'Basic Information',
        properties: 'Properties',
        notSpecified: 'Not specified',
        measuredAt: 'Measured',
        additionalPhotos: 'Additional Photos',
        fields: {
          birthDate: 'Birth Date',
          owner: 'Owner',
          scientificName: 'Scientific Name',
          description: 'Description'
        },
        qrCode: {
          title: 'QR Code for Sharing',
          description: 'Scan QR code for quick access to animal profile'
        },
        propertyNames: {
          weight: 'Weight',
          height: 'Height',
          color: 'Color',
          breed: 'Breed',
          gender: 'Gender',
          microchip: 'Microchip',
          vaccinated: 'Vaccinated',
          neutered: 'Neutered/Spayed',
          temperament: 'Temperament',
          specialNeeds: 'Special Needs',
          medicalHistory: 'Medical History',
          eyeColor: 'Eye Color',
          markings: 'Markings',
          allergies: 'Allergies'
        }
      },
      profile: {
        edit: 'Edit',
        cancel: 'Cancel',
        save: 'Save',
        changePassword: 'Change Password',
        basicInfo: 'Basic Information',
        contact: 'Contact',
        social: 'Social Networks',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        company: 'Company',
        address: 'Address',
        viber: 'Viber',
        whatsapp: 'WhatsApp',
        signal: 'Signal',
        facebook: 'Facebook',
        instagram: 'Instagram',
        twitter: 'Twitter',
        linkedin: 'LinkedIn',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm Password',
        emailReadonly: 'Email cannot be changed',
        viberHelp: 'Your Viber phone number',
        whatsappHelp: 'Your WhatsApp phone number',
        signalHelp: 'Your Signal phone number',
        facebookHelp: 'Link to your Facebook profile',
        instagramHelp: 'Your Instagram username',
        twitterHelp: 'Your Twitter username',
        linkedinHelp: 'Link to your LinkedIn profile',
        saveSuccess: 'Profile saved successfully',
        saveError: 'Error saving profile',
        passwordMismatch: 'Passwords do not match',
        passwordChangeSuccess: 'Password changed successfully',
        passwordChangeError: 'Error changing password',
        notFound: 'Profile not found'
      },
      home: {
        title: 'Pet Management System',
        footer: '© 2025 Pet Management System. All rights reserved.',
        heroSubtitle: 'Modern system for managing pets and their data',
        loginToSystem: 'Login to System',
        animalSingular: 'animal',
        animalPlural: 'animals',
        animalGenitive: 'animals',
        errorLoadingAnimals: 'Failed to load animals',
        unknownDate: 'Unknown date',
        invalidDate: 'Invalid date',
        searchResultsTitle: 'Search Results',
        recentAnimalsTitle: 'Recent Animals',
        searchResultsCount: 'Found {{count}} {{countText}}',
        recentAnimalsSubtitle: 'Latest registered animals in the system',
        filteringAndSearch: 'Filtering and Search',
        activeFiltersCount: 'Active filters ({{count}})',
        clearFilters: 'Clear filters',
        searchPlaceholder: 'Search by name, description...',
        filterBySpecies: 'Filter by species',
        allSpecies: 'All species',
        activeFilters: 'Active filters:',
        searchLabel: 'Search',
        speciesLabel: 'Species',
        addedOn: 'Added on',
        clickForDetail: 'Click for details',
        noAnimalsFound: 'No animals found',
        noAnimalsYet: 'No animals in the system yet',
        clearAllFilters: 'Clear all filters',
        age: {
          year: 'year',
          years2to4: 'years',
          years5plus: 'years',
          month: 'month',
          months2to4: 'months',
          months5plus: 'months',
          lessThanMonth: 'less than month'
        },
        infoCards: {
          management: {
            title: 'Animal Management',
            description: 'Comprehensive system for registering and managing all your pets in one place.'
          },
          tracking: {
            title: 'Tracking and Analytics',
            description: 'Detailed statistics and insights about your animals, their health and activities.'
          },
          profiles: {
            title: 'Public Profiles',
            description: 'Each animal has its own public profile with photos and information.'
          }
        }
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'cs',
    debug: false,
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;