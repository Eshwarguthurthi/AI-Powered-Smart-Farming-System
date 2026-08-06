
export type Language = 'en' | 'hi' | 'te';

export interface Translations {
  common: {
    dashboard: string;
    planning: string;
    diagnostics: string;
    market: string;
    about: string;
    loading: string;
    confidence: string;
    investment: string;
    revenue: string;
    profit: string;
    acres: string;
    season: string;
    state: string;
    settings: string;
    help: string;
    regionalContext: string;
    localized: string;
    selectLanguage: string;
    aiPowered: string;
    precisionAgri: string;
    researcher: string;
    success: string;
    error: string;
  };
  dashboard: {
    welcome: string;
    subtitle: string;
    weatherTitle: string;
    humidity: string;
    windSpeed: string;
    rainChance: string;
    soilHealth: string;
    moisture: string;
    nutrientStatus: string;
    optimizationTitle: string;
    optimizationDesc: string;
    launchOptimizer: string;
    diagnosticTitle: string;
    diagnosticDesc: string;
    runDiagnostic: string;
    liveUpdate: string;
    temp: string;
    yieldProjections: string;
    yieldDesc: string;
    confidenceIndex: string;
    activeAlerts: string;
    stableConditions: string;
    noThreats: string;
    pathogenDetected: string;
    realtime: string;
  };
  planning: {
    title: string;
    subtitle: string;
    soilN: string;
    soilP: string;
    soilK: string;
    soilPh: string;
    optimizeBtn: string;
    recommendation: string;
    rationale: string;
    requirements: string;
    alternatives: string;
    water: string;
    fertilizer: string;
    sunlight: string;
    temp: string;
    seasons: {
      spring: string;
      summer: string;
      autumn: string;
      winter: string;
    };
    planningTool: string;
    awaitingInput: string;
    awaitingInputDesc: string;
    aiProcessing: string;
    aiProcessingDesc: string;
    expectedYield: string;
    estDuration: string;
    marketValue: string;
    totalYield: string;
    cropCycle: string;
    marketTrend: string;
    grossRevenue: string;
    roiEstimate: string;
    pestRisks: string;
    cultivationTimeline: string;
    sowing: string;
    growth: string;
    maturity: string;
    harvest: string;
    altRecs: string;
    knowledgeBase: string;
    knowledgeBaseDesc: string;
    stapleCrops: string;
    cashCrops: string;
    horticulture: string;
    soilBoosters: string;
  };
  diagnostics: {
    title: string;
    subtitle: string;
    uploadTitle: string;
    uploadDesc: string;
    analyzeBtn: string;
    result: string;
    prevention: string;
    proTip: string;
    proTipDesc: string;
    noDiagnosis: string;
    noDiagnosisDesc: string;
    scanning: string;
    neuralAnalysis: string;
    symptoms: string;
    treatment: string;
    recovery: string;
    invalidSample: string;
    pathogenAnalysis: string;
  };
  market: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    ratePerQuintal: string;
    insights: string;
    intelligence: string;
    lastUpdated: string;
    intelActive: string;
    report: string;
    sentiment: string;
    updateFeed: string;
    advisorPulse: string;
    volatility: string;
    stability: string;
    distilling: string;
    error: string;
  };
  about: {
    title: string;
    subtitle: string;
    team: string;
    supervisor: string;
    algorithms: string;
    teamTitle: string;
    supervisedBy: string;
    techArch: string;
    cropDesc: string;
    incomePred: string;
    incomeDesc: string;
    diseaseDesc: string;
    academicContext: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      dashboard: "Dashboard",
      planning: "Crop Planning",
      diagnostics: "Diagnostics",
      market: "Market Pulse",
      about: "Documentation",
      loading: "Analyzing...",
      confidence: "Confidence",
      investment: "Investment",
      revenue: "Revenue",
      profit: "Profit",
      acres: "Acre",
      season: "Season",
      state: "State",
      settings: "Settings",
      help: "Support",
      regionalContext: "Regional Context",
      localized: "Localized",
      selectLanguage: "Select Language",
      aiPowered: "AI-Powered",
      precisionAgri: "Precision Agri",
      researcher: "Researcher",
      success: "Success",
      error: "Error",
    },
    dashboard: {
      welcome: "FarmWise AI",
      subtitle: "Precision agriculture at your fingertips",
      weatherTitle: "Live Weather",
      humidity: "Humidity",
      windSpeed: "Wind Speed",
      rainChance: "Rain Chance",
      soilHealth: "Soil Health",
      moisture: "Moisture",
      nutrientStatus: "Nutrient Status",
      optimizationTitle: "Yield Optimization",
      optimizationDesc: "Get AI-driven crop recommendations based on your soil.",
      launchOptimizer: "Launch Optimizer",
      diagnosticTitle: "Plant Health",
      diagnosticDesc: "Identify pests and diseases from leaf photos.",
      runDiagnostic: "Run Diagnostic Scan",
      liveUpdate: "Live Update",
      temp: "Temp",
      yieldProjections: "Yield Projections",
      yieldDesc: "Expected regional output vs historical mean",
      confidenceIndex: "Confidence Index",
      activeAlerts: "Active Alerts",
      stableConditions: "Stable Conditions",
      noThreats: "No significant biological threats detected in your area.",
      pathogenDetected: "Blast disease detected in neighboring blocks.",
      realtime: "Real-time",
    },
    planning: {
      title: "Crop Optimization",
      subtitle: "Enter your soil parameters for precision planning",
      soilN: "Nitrogen (N)",
      soilP: "Phosphorus (P)",
      soilK: "Potassium (K)",
      soilPh: "Soil pH",
      optimizeBtn: "Generate Recommendation",
      recommendation: "Top Recommendation",
      rationale: "Why this crop?",
      requirements: "Farming Requirements",
      alternatives: "Alternative Options",
      water: "Water",
      fertilizer: "Fertilizer",
      sunlight: "Sunlight",
      temp: "Temperature",
      seasons: {
        spring: "Spring",
        summer: "Summer",
        autumn: "Autumn",
        winter: "Winter",
      },
      planningTool: "Planning Tool",
      awaitingInput: "Awaiting Input",
      awaitingInputDesc: "Fill in your soil parameters and regional context to generate a precision agricultural recommendation.",
      aiProcessing: "AI is Processing",
      aiProcessingDesc: "Cross-referencing global crop data...",
      expectedYield: "Expected Yield",
      estDuration: "Est. Duration",
      marketValue: "Market Value",
      totalYield: "Total Yield",
      cropCycle: "Crop Cycle",
      marketTrend: "Market Trend",
      grossRevenue: "Gross Revenue",
      roiEstimate: "ROI Estimate",
      pestRisks: "Pest & Disease Risks",
      cultivationTimeline: "Cultivation Timeline",
      sowing: "Sowing",
      growth: "Growth",
      maturity: "Maturity",
      harvest: "Harvest",
      altRecs: "Alternative Recommendations",
      knowledgeBase: "Regional Knowledge Base",
      knowledgeBaseDesc: "Verified agricultural patterns for",
      stapleCrops: "Staple Crops",
      cashCrops: "Cash Crops",
      horticulture: "Horticulture",
      soilBoosters: "Soil Boosters",
    },
    diagnostics: {
      title: "Plant Diagnostics",
      subtitle: "Identify crop diseases using computer vision",
      uploadTitle: "Drop leaf photo here",
      uploadDesc: "or click to browse files",
      analyzeBtn: "Analyze Plant Health",
      result: "Diagnosis Result",
      prevention: "Prevention Plan",
      proTip: "Pro Tip",
      proTipDesc: "Take high-resolution photos in natural daylight. Clear view of both sides of the leaf helps the AI identify pathogens more accurately.",
      noDiagnosis: "No Diagnosis Active",
      noDiagnosisDesc: "The AI Diagnostic Engine is on standby. Upload a leaf sample to begin pathogenic screening.",
      scanning: "Scanning DNA...",
      neuralAnalysis: "Neural Analysis in Progress",
      symptoms: "Symptoms Analysis",
      treatment: "Recommended Treatment",
      recovery: "Recovery Protocol",
      invalidSample: "Invalid Sample",
      pathogenAnalysis: "Pathogen Analysis Complete",
    },
    market: {
      title: "Market Pulse",
      subtitle: "Real-time crop prices and trends",
      searchPlaceholder: "Search crops or regions...",
      ratePerQuintal: "RATE / QUINTAL",
      insights: "Market Insights",
      intelligence: "Intelligence",
      lastUpdated: "Last Updated",
      intelActive: "Intelligence Active",
      report: "Bazaar Intel Report",
      sentiment: "Sentiment",
      updateFeed: "Update Live Feed",
      advisorPulse: "Advisor's Pulse",
      volatility: "Volatility",
      stability: "Stability",
      distilling: "AI is distilling real-time market data...",
      error: "Cloud Market Intelligence is currently unavailable.",
    },
    about: {
      title: "Project Documentation",
      subtitle: "Major Project Details & Team",
      team: "Research Team",
      supervisor: "Supervisor",
      algorithms: "Algorithms Used",
      teamTitle: "Research Team",
      supervisedBy: "Supervised By",
      techArch: "Technical Architecture",
      cropDesc: "High-accuracy classification based on Nitrogen, Phosphorus, Potassium, and pH levels.",
      incomePred: "Income Prediction",
      incomeDesc: "Regression model predicting market potential and expected yield for seasonal planning.",
      diseaseDesc: "Convolutional Neural Network for identifying leaf pathology markers from uploaded samples.",
      academicContext: "Academic Context",
    },
  },
  hi: {
    common: {
      dashboard: "डैशबोर्ड",
      planning: "फसल योजना",
      diagnostics: "रोग पहचान",
      market: "बाजार की नब्ज",
      about: "दस्तावेज़ीकरण",
      loading: "विश्लेषण हो रहा है...",
      confidence: "आत्मविश्वास",
      investment: "निवेश",
      revenue: "राजस्व",
      profit: "लाभ",
      acres: "एकड़",
      season: "सीजन",
      state: "राज्य",
      settings: "सेटिंग्स",
      help: "सहायता",
      regionalContext: "क्षेत्रीय संदर्भ",
      localized: "स्थानीयकृत",
      selectLanguage: "भाषा चुनें",
      aiPowered: "एआई-संचालित",
      precisionAgri: "सटीक कृषि",
      researcher: "अनुसंधानकर्ता",
      success: "सफलता",
      error: "त्रुटि",
    },
    dashboard: {
      welcome: "FarmWise AI",
      subtitle: "आपकी उंगलियों पर सटीक कृषि",
      weatherTitle: "लाइव मौसम",
      humidity: "नमी",
      windSpeed: "हवा की गति",
      rainChance: "बारिश की संभावना",
      soilHealth: "मिट्टी का स्वास्थ्य",
      moisture: "नमी का स्तर",
      nutrientStatus: "पोषक तत्व",
      optimizationTitle: "उपज अनुकूलन",
      optimizationDesc: "मिट्टी के आधार पर AI-संचालित फसल सुझाव प्राप्त करें।",
      launchOptimizer: "अनुकूलन शुरू करें",
      diagnosticTitle: "पौधों का स्वास्थ्य",
      diagnosticDesc: "पत्तियों की तस्वीरों से कीटों और बीमारियों को पहचानें।",
      runDiagnostic: "डायग्नोस्टिक स्कैन करें",
      liveUpdate: "लाइव अपडेट",
      temp: "तापमान",
      yieldProjections: "उपज अनुमान",
      yieldDesc: "ऐतिहासिक औसत बनाम अपेक्षित क्षेत्रीय उत्पादन",
      confidenceIndex: "विश्वास सूचकांक",
      activeAlerts: "सक्रिय अलर्ट",
      stableConditions: "स्थिर स्थितियां",
      noThreats: "आपके क्षेत्र में कोई महत्वपूर्ण जैविक खतरा नहीं पाया गया।",
      pathogenDetected: "पड़ोसी ब्लॉकों में ब्लास्ट बीमारी का पता चला।",
      realtime: "वास्तविक समय",
    },
    planning: {
      title: "फसल अनुकूलन",
      subtitle: "सटीक योजना के लिए मिट्टी के पैरामीटर दर्ज करें",
      soilN: "नाइट्रोजन (N)",
      soilP: "फास्फोरस (P)",
      soilK: "पोटेशियम (K)",
      soilPh: "मिट्टी का pH",
      optimizeBtn: "सुझाव उत्पन्न करें",
      recommendation: "शीर्ष सुझाव",
      rationale: "यह फसल क्यों?",
      requirements: "खेती की आवश्यकताएं",
      alternatives: "वैकल्पिक विकल्प",
      water: "पानी",
      fertilizer: "उर्वरक",
      sunlight: "धूप",
      temp: "तापमान",
      seasons: {
        spring: "वसंत",
        summer: "गर्मी",
        autumn: "पतझड़",
        winter: "सर्दी",
      },
      planningTool: "नियोजन उपकरण",
      awaitingInput: "इनपुट की प्रतीक्षा है",
      awaitingInputDesc: "सटीक कृषि सुझाव उत्पन्न करने के लिए अपनी मिट्टी के मापदंडों और क्षेत्रीय संदर्भ को भरें।",
      aiProcessing: "एआई प्रसंस्करण कर रहा है",
      aiProcessingDesc: "वैश्विक फसल डेटा का मिलान किया जा रहा है...",
      expectedYield: "अपेक्षित उपज",
      estDuration: "अनुमानित अवधि",
      marketValue: "बाजार मूल्य",
      totalYield: "कुल उपज",
      cropCycle: "फसल चक्र",
      marketTrend: "बाजार का रुझान",
      grossRevenue: "सकल राजस्व",
      roiEstimate: "ROI अनुमान",
      pestRisks: "कीट और रोग जोखिम",
      cultivationTimeline: "खेती की समयरेखा",
      sowing: "बुवाई",
      growth: "विकास",
      maturity: "परिपक्वता",
      harvest: "कटाई",
      altRecs: "वैकल्पिक सुझाव",
      knowledgeBase: "क्षेत्रीय ज्ञान आधार",
      knowledgeBaseDesc: "के लिए सत्यापित कृषि पैटर्न",
      stapleCrops: "प्रमुख फसलें",
      cashCrops: "नकद फसलें",
      horticulture: "बागवानी",
      soilBoosters: "मिट्टी बूस्टर",
    },
    diagnostics: {
      title: "पौधों का निदान",
      subtitle: "कंप्यूटर विजन का उपयोग करके फसल रोगों की पहचान करें",
      uploadTitle: "पत्ती की फोटो यहाँ डालें",
      uploadDesc: "या फ़ाइलें ब्राउज़ करने के लिए क्लिक करें",
      analyzeBtn: "स्वास्थ्य विश्लेषण करें",
      result: "निदान परिणाम",
      prevention: "बचाव योजना",
      proTip: "प्रो टिप",
      proTipDesc: "प्राकृतिक दिन के उजाले में उच्च-रिज़ॉल्यूशन वाली तस्वीरें लें। पत्ती के दोनों किनारों का स्पष्ट दृश्य AI को रोगजनकों की अधिक सटीक पहचान करने में मदद करता है।",
      noDiagnosis: "कोई निदान सक्रिय नहीं है",
      noDiagnosisDesc: "एआई डायग्नोस्टिक इंजन स्टैंडबाय पर है। रोगजनक स्क्रीनिंग शुरू करने के लिए पत्ती का नमूना अपलोड करें।",
      scanning: "डीएनए स्कैनिंग...",
      neuralAnalysis: "तंत्रिका विश्लेषण प्रगति पर है",
      symptoms: "लक्षण विश्लेषण",
      treatment: "अनुशंसित उपचार",
      recovery: "रिकवरी प्रोटोकॉल",
      invalidSample: "अमान्य नमूना",
      pathogenAnalysis: "रोगजनक विश्लेषण पूर्ण",
    },
    market: {
      title: "बाजार की नब्ज",
      subtitle: "वास्तविक समय में फसल की कीमतें और रुझान",
      searchPlaceholder: "फसलें या क्षेत्र खोजें...",
      ratePerQuintal: "दर / क्विंटल",
      insights: "बाजार अंतर्दृष्टि",
      intelligence: "इंटेलिजेंस",
      lastUpdated: "आखिरी अपडेट",
      intelActive: "इंटेलिजेंस सक्रिय",
      report: "बाजार इंटेल रिपोर्ट",
      sentiment: "भावना",
      updateFeed: "लाइव फीड अपडेट करें",
      advisorPulse: "सलाहकार की नब्ज",
      volatility: "अस्थिरता",
      stability: "स्थिरता",
      distilling: "एआई रीयल-टाइम मार्केट डेटा को डिस्टिल कर रहा है...",
      error: "क्लाउड मार्केट इंटेलिजेंस वर्तमान में अनुपलब्ध है।",
    },
    about: {
      title: "परियोजना दस्तावेज़ीकरण",
      subtitle: "प्रमुख परियोजना विवरण और टीम",
      team: "अनुसंधान टीम",
      supervisor: "पर्यवेक्षक",
      algorithms: "उपयोग किए गए एल्गोरिदम",
      teamTitle: "अनुसंधान टीम",
      supervisedBy: "इनके द्वारा पर्यवेक्षित",
      techArch: "तकनीकी वास्तुकला",
      cropDesc: "नाइट्रोजन, फास्फोरस, पोटेशियम और पीएच स्तरों के आधार पर उच्च-सटीकता वर्गीकरण।",
      incomePred: "आय की भविष्यवाणी",
      incomeDesc: "मौसमी योजना के लिए बाजार की क्षमता और अपेक्षित उपज की भविष्यवाणी करने वाला प्रतिगमन मॉडल।",
      diseaseDesc: "अपलोड किए गए नमूनों से पत्ती विकृति मार्करों की पहचान करने के लिए कन्वोल्यूशनल न्यूरल नेटवर्क।",
      academicContext: "अकादमिक संदर्भ",
    },
  },
  te: {
    common: {
      dashboard: "డ్యాష్‌బోర్డ్",
      planning: "పంట ప్రణాళిక",
      diagnostics: "రోగ నిర్ధారణ",
      market: "మార్కెట్ పల్స్",
      about: "డాక్యుమెంటేషన్",
      loading: "విశ్లేషిస్తోంది...",
      confidence: "నమ్మకం",
      investment: "పెట్టుబడి",
      revenue: "రాబడి",
      profit: "లాభం",
      acres: "ఎకరం",
      season: "సీజన్",
      state: "రాష్ట్రం",
      settings: "సెట్టింగ్‌లు",
      help: "మద్దతు",
      regionalContext: "ప్రాంతీయ సందర్భం",
      localized: "స్థానికీకరించబడింది",
      selectLanguage: "భాషను ఎంచుకోండి",
      aiPowered: "AI-ఆధారిత",
      precisionAgri: "ఖచ్చితమైన వ్యవసాయం",
      researcher: "పరిశోధకుడు",
      success: "విజయం",
      error: "లోపం",
    },
    dashboard: {
      welcome: "FarmWise AI",
      subtitle: "మీ చేతివేళ్ల వద్ద ఖచ్చితమైన వ్యవసాయం",
      weatherTitle: "లైవ్ వాతావరణం",
      humidity: "తేమ",
      windSpeed: "గాలి వేగం",
      rainChance: "వర్షం అవకాశం",
      soilHealth: "నేల ఆరోగ్యం",
      moisture: "తేమ స్థాయి",
      nutrientStatus: "పోషకాల స్థితి",
      optimizationTitle: "దిగుబడి ఆప్టిమైజేషన్",
      optimizationDesc: "మీ నేల ఆధారంగా AI-ఆధారిత పంట సిఫార్సులను పొందండి.",
      launchOptimizer: "ఆప్టిమైజర్‌ను ప్రారంభించండి",
      diagnosticTitle: "మొక్కల ఆరోగ్యం",
      diagnosticDesc: "ఆకు ఫోటోల నుండి తెగుళ్లు మరియు వ్యాధులను గుర్తించండి.",
      runDiagnostic: "డయాగ్నస్టిక్ స్కాన్ చేయండి",
      liveUpdate: "లైవ్ అప్‌డేట్",
      temp: "ఉష్ణోగ్రత",
      yieldProjections: "దిగుబడి అంచనాలు",
      yieldDesc: "చారిత్రక సగటుతో పోలిస్తే ఆశించిన ప్రాంతీయ ఉత్పత్తి",
      confidenceIndex: "విశ్వాస సూచిక",
      activeAlerts: "యాక్టివ్ అలర్ట్స్",
      stableConditions: "స్థిరమైన పరిస్థితులు",
      noThreats: "మీ ప్రాంతంలో ఎటువంటి ముఖ్యమైన జీవసంబంధమైన ముప్పులు కనుగొనబడలేదు.",
      pathogenDetected: "పొరుగు బ్లాకుల్లో బ్లాస్ట్ వ్యాధి గుర్తించబడింది.",
      realtime: "నిజ సమయం",
    },
    planning: {
      title: "పంట ఆప్టిమైజేషన్",
      subtitle: "ఖచ్చితమైన ప్రణాళిక కోసం మీ నేల పారామితులను నమోదు చేయండి",
      soilN: "నత్రజని (N)",
      soilP: "భాస్వరం (P)",
      soilK: "పొటాషియం (K)",
      soilPh: "నేల pH",
      optimizeBtn: "సిఫార్సును రూపొందించండి",
      recommendation: "టాప్ సిఫార్సు",
      rationale: "ఈ పంట ఎందుకు?",
      requirements: "వ్యవసాయ అవసరాలు",
      alternatives: "ప్రత్యామ్నాయ ఎంపికలు",
      water: "నీరు",
      fertilizer: "ఎరువులు",
      sunlight: "సూర్యరశ్మి",
      temp: "ఉష్ణోగ్రత",
      seasons: {
        spring: "వసంతకాలం",
        summer: "వేసవి కాలం",
        autumn: "శరదృతువు",
        winter: "శీతాకాలం",
      },
      planningTool: "ప్లానింగ్ టూల్",
      awaitingInput: "ఇన్పుట్ కోసం వేచి ఉంది",
      awaitingInputDesc: "ఖచ్చితమైన వ్యవసాయ సిఫార్సును రూపొందించడానికి మీ నేల పారామితులు మరియు ప్రాంతీయ సందర్భాన్ని పూరించండి.",
      aiProcessing: "AI ప్రాసెస్ చేస్తోంది",
      aiProcessingDesc: "ప్రపంచ పంట డేటాను సరిపోల్చుతోంది...",
      expectedYield: "ఆశించిన దిగుబడి",
      estDuration: "అంచనా వేసిన వ్యవధి",
      marketValue: "మార్కెట్ విలువ",
      totalYield: "మొత్తం దిగుబడి",
      cropCycle: "పంట చక్రం",
      marketTrend: "మార్కెట్ ట్రెండ్",
      grossRevenue: "మొత్తం రాబడి",
      roiEstimate: "ROI అంచనా",
      pestRisks: "తెగుళ్లు మరియు వ్యాధి ప్రమాదాలు",
      cultivationTimeline: "సాగు కాలక్రమం",
      sowing: "విత్తడం",
      growth: "వృద్ధి",
      maturity: "పరిపక్వత",
      harvest: "కోత",
      altRecs: "ప్రత్యామ్నాయ సిఫార్సులు",
      knowledgeBase: "ప్రాంతీయ నాలెడ్జ్ బేస్",
      knowledgeBaseDesc: "దీనికి ధృవీకరించబడిన వ్యవసాయ పద్ధతులు",
      stapleCrops: "ప్రధాన పంటలు",
      cashCrops: "వాణిజ్య పంటలు",
      horticulture: "ఉద్యానవనం",
      soilBoosters: "నేల బూస్టర్లు",
    },
    diagnostics: {
      title: "మొక్కల నిర్ధారణ",
      subtitle: "కంప్యూటర్ విజన్‌ని ఉపయోగించి పంట వ్యాధులను గుర్తించండి",
      uploadTitle: "ఆకు ఫోటోను ఇక్కడ ఉంచండి",
      uploadDesc: "లేదా ఫైల్‌లను బ్రౌజ్ చేయడానికి క్లిక్ చేయండి",
      analyzeBtn: "మొక్కల ఆరోగ్యాన్ని విశ్లేషించండి",
      result: "నిర్ధారణ ఫలితం",
      prevention: "నివారణ ప్రణాళిక",
      proTip: "చిట్కా",
      proTipDesc: "పగటి వెలుతురులో హై-రిజల్యూషన్ ఫోటోలను తీయండి. ఆకు యొక్క రెండు వైపులా స్పష్టంగా కనిపిస్తే AI మరింత ఖచ్చితంగా వ్యాధులను గుర్తిస్తుంది.",
      noDiagnosis: "డయాగ్నసిస్ ఏదీ లేదు",
      noDiagnosisDesc: "AI డయాగ్నస్టిక్ ఇంజిన్ సిద్ధంగా ఉంది. విశ్లేషణ ప్రారంభించడానికి ఆకు నమూనాను అప్‌లోడ్ చేయండి.",
      scanning: "DNA స్కాన్ చేస్తోంది...",
      neuralAnalysis: "విశ్లేషణ జరుగుతోంది",
      symptoms: "లక్షణాల విశ్లేషణ",
      treatment: "సిఫార్సు చేయబడిన చికిత్స",
      recovery: "కోలుకునే విధానం",
      invalidSample: "చెల్లని నమూనా",
      pathogenAnalysis: "విశ్లేషణ పూర్తయింది",
    },
    market: {
      title: "మార్కెట్ పల్స్",
      subtitle: "రియల్ టైమ్ పంట ధరలు మరియు ట్రెండ్‌లు",
      searchPlaceholder: "పంటలు లేదా ప్రాంతాలను వెతకండి...",
      ratePerQuintal: "ధర / క్వింటాల్",
      insights: "మార్కెట్ అంతర్దృష్టులు",
      intelligence: "ఇంటెలిజెన్స్",
      lastUpdated: "చివరి అప్‌డేట్",
      intelActive: "ఇంటెలిజెన్స్ యాక్టివ్",
      report: "బజార్ ఇంటెల్ రిపోర్ట్",
      sentiment: "సెంటిమెంట్",
      updateFeed: "లైవ్ ఫీడ్‌ని అప్‌డేట్ చేయండి",
      advisorPulse: "అడ్వైజర్ పల్స్",
      volatility: "అస్థిరత",
      stability: "స్థిరత్వం",
      distilling: "AI రియల్ టైమ్ మార్కెట్ డేటాను విశ్లేషిస్తోంది...",
      error: "క్లౌడ్ మార్కెట్ ఇంటెలిజెన్స్ ప్రస్తుతం అందుబాటులో లేదు.",
    },
    about: {
      title: "ప్రాజెక్ట్ డాక్యుమెంటేషన్",
      subtitle: "ప్రధాన ప్రాజెక్ట్ వివరాలు & బృందం",
      team: "పరిశోధన బృందం",
      supervisor: "పర్యవేక్షకుడు",
      algorithms: "ఉపయోగించిన అల్గోరిథంలు",
      teamTitle: "పరిశోధన బృందం",
      supervisedBy: "పర్యవేక్షణ",
      techArch: "సాంకేతిక నిర్మాణం",
      cropDesc: "నత్రజని, భాస్వరం, పొటాషియం మరియు pH స్థాయిల ఆధారంగా ఖచ్చితమైన వర్గీకరణ.",
      incomePred: "ఆదాయ అంచనా",
      incomeDesc: "మార్కెట్ సామర్థ్యం మరియు పంట దిగుబడిని అంచనా వేసే మోడల్.",
      diseaseDesc: "ఆకు ఫోటోల ద్వారా వ్యాధులను గుర్తించే న్యూరల్ నెట్‌వర్క్.",
      academicContext: "విద్యా సంబంధిత సందర్భం",
    },
  },
};
