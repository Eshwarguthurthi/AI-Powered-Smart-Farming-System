
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
    location: {
      title: string;
      source: string;
      state: string;
      district: string;
      subdistrict: string;
      village: string;
      placeholder: string;
      search: string;
      noMatches: string;
      loading: string;
      retry: string;
      showingFirst: string;
      selectParentFirst: string;
      loadError: string;
      optionalVillage: string;
    };
    soil: {
      title: string;
      badgeEstimate: string;
      badgeManual: string;
      badgeUnavailable: string;
      fetching: string;
      idleHint: string;
      summaryTitle: string;
      area: string;
      cycle: string;
      samples: string;
      lastProcessed: string;
      source: string;
      unitsNote: string;
      levels: { village: string; block: string; district: string };
      disclaimer: string;
      fallback: { village_not_found: string; village_insufficient_samples: string; block_insufficient_samples: string };
      unavailable: { state_not_covered: string; district_not_covered: string; no_samples: string; error: string };
      nextStep: string;
      samplesRated: string;
      notAvailable: string;
      ratings: { Low: string; Medium: string; High: string; Acidic: string; Neutral: string; Alkaline: string };
      ownReportToggle: string;
      ownReportHint: string;
      manualPlaceholder: string;
      unit: string;
      clear: string;
      outOfRange: string;
      fixErrors: string;
      noSoilWarning: string;
      retry: string;
    };
    result: {
      soilBasisTitle: string;
      soilBasis: { measured: string; location_estimate: string; unavailable: string };
      aiNote: string;
      suitability: string;
      partialCrops: string;
      partialSections: string;
      notProvided: string;
      sections: { soilSuitability: string; duration: string; timeline: string; water: string; climate: string; fertilizer: string; pests: string; economics: string; risks: string };
      why: string;
      days: string;
      harvestWindow: string;
      dayRange: string;
      requirement: string;
      irrigation: string;
      temperature: string;
      sunlight: string;
      nutrient: string;
      product: string;
      quantity: string;
      timing: string;
      pest: string;
      disease: string;
      prevention: string;
      treatment: string;
      perAcre: string;
      total: string;
      yield: string;
      investment: string;
      revenue: string;
      profit: string;
      roi: string;
      yieldInput: string;
      priceInput: string;
      resetEstimates: string;
      costBreakdown: string;
      assumptions: string;
      yieldBasis: string;
      priceBasis: string;
      econNote: string;
      errorTitle: string;
      retry: string;
      errors: Record<string, string> & { AI_ERROR: string };
    };
    loading: {
      title: string;
      announce: string;
      steps: string[];
      elapsed: string;
      hint: string;
    };
    fallbackBanner: string;
    acresInvalid: string;
    months: string;
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
  marketPage: {
    eyebrow: string;
    title: string;
    subtitle: string;
    pricesFor: string;
    refresh: string;
    unit: string;
    median: string;
    kpi: { commodities: string; markets: string; reports: string; latestDate: string };
    search: string;
    allDistricts: string;
    sortLabel: string;
    sort: { markets: string; priceHigh: string; priceLow: string; name: string };
    board: string;
    marketsCount: string;
    marketOne: string;
    showAll: string;
    showFewer: string;
    detail: string;
    colMarket: string;
    colVariety: string;
    colMin: string;
    colModal: string;
    colMax: string;
    modalExplain: string;
    noMatch: string;
    truncated: string;
    source: string;
    sourceName: string;
    fetched: string;
    ai: { title: string; basisData: string; basisGeneral: string; advice: string; unavailable: string; loading: string };
    trend: { title: string; note: string; days: string; avgModal: string; unavailable: string };
    mirror: { noKey: string; keyIssue: string; note: string; sourceName: string; synced: string; covers: string };
    archive: { note: string; stale: string; sourceName: string };
    age: { one: string; many: string };
    states: {
      notConfiguredTitle: string;
      notConfiguredBody: string;
      steps: string[];
      rateLimited: string;
      busy: string;
      uncoveredTitle: string;
      uncoveredBody: string;
      switchTo: string;
      keyOptional: string;
      keyRejected: string;
      upstream: string;
      noData: string;
      retry: string;
    };
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
      location: {
        title: "Farm Location",
        source: "Location list: Local Government Directory (LGD), Government of India",
        state: "State / UT",
        district: "District",
        subdistrict: "Mandal / Taluka / Tehsil",
        village: "Village",
        placeholder: "Select…",
        search: "Type to search…",
        noMatches: "No matches found",
        loading: "Loading…",
        retry: "Retry",
        showingFirst: "Showing the first {n} matches. Type to narrow the list.",
        selectParentFirst: "Select the level above first",
        loadError: "Could not load this list from the Local Government Directory. Please try again.",
        optionalVillage: "Choosing your village gives the most local soil results.",
      },
      soil: {
        title: "Soil Parameters",
        badgeEstimate: "Location-based estimate",
        badgeManual: "Manual entry",
        badgeUnavailable: "Data unavailable",
        fetching: "Fetching soil test results for this location…",
        idleHint: "Select your village to automatically load government soil test results for your area.",
        summaryTitle: "Soil test results for your area",
        area: "Area",
        cycle: "Testing cycle",
        samples: "Samples tested",
        lastProcessed: "Last processed by portal",
        source: "Source",
        unitsNote: "Values are the ratings that government soil-testing labs gave to available N, P, K (tested in kg/ha) and pH.",
        levels: {
          village: "Village",
          block: "Block / Mandal",
          district: "District",
        },
        disclaimer: "These ratings come from soil samples tested on farms in this area, not from your own field. A soil test of your own field is always more accurate.",
        fallback: {
          village_not_found: "No soil test records were found for this village, so district-level results are shown.",
          village_insufficient_samples: "Too few samples were tested in this village, so block-level results are shown.",
          block_insufficient_samples: "Too few samples were tested in this village and block, so district-level results are shown.",
        },
        unavailable: {
          state_not_covered: "Soil test data is not available: this state was not found in the Soil Health Card portal.",
          district_not_covered: "Soil test data is not available: this district was not found in the Soil Health Card portal.",
          no_samples: "Soil test data is not available: no soil samples are recorded for this village, block or district.",
          error: "Soil test data could not be retrieved right now. The Soil Health Card portal may be unavailable.",
        },
        nextStep: "Next step: get your soil tested at the nearest soil testing laboratory (Soil Health Card scheme, soilhealth.dac.gov.in). If you already have a report, you can add its values below. You can still get a recommendation based on location and season.",
        samplesRated: "{share}% of {total} samples rated {rating}",
        notAvailable: "Not available",
        ratings: {
          Low: "Low",
          Medium: "Medium",
          High: "High",
          Acidic: "Acidic",
          Neutral: "Neutral",
          Alkaline: "Alkaline",
        },
        ownReportToggle: "I have my own soil test report (optional)",
        ownReportHint: "Enter only the values you have. Each value you enter replaces the area estimate for that nutrient.",
        manualPlaceholder: "From your report",
        unit: "kg/ha",
        clear: "Clear",
        outOfRange: "Must be between {min} and {max}",
        fixErrors: "Please correct the highlighted soil test values.",
        noSoilWarning: "No soil data is available, so the recommendation will be based on location and season only.",
        retry: "Retry",
      },
      result: {
        soilBasisTitle: "Soil data used",
        soilBasis: {
          measured: "Your soil test",
          location_estimate: "Location-based estimate",
          unavailable: "Not available",
        },
        aiNote: "Agronomic guidance below is generated by AI ({model}) from general knowledge. It is not field-verified and does not use live weather, market or pest-surveillance data. Confirm doses and pest control with your local KVK or agriculture department.",
        suitability: "AI suitability",
        partialCrops: "Only {count} of 3 crops could be generated.",
        partialSections: "Not provided for this crop: {sections}.",
        notProvided: "Not provided in this response.",
        sections: {
          soilSuitability: "Soil suitability",
          duration: "Duration",
          timeline: "Cultivation timeline",
          water: "Water & irrigation",
          climate: "Temperature & sunlight",
          fertilizer: "Fertilizer plan",
          pests: "Pest & disease risks",
          economics: "Economics",
          risks: "Risks & advice",
        },
        why: "Why this crop?",
        days: "{min}–{max} days",
        harvestWindow: "Approx. harvest",
        dayRange: "Day {start}–{end}",
        requirement: "Requirement",
        irrigation: "Irrigation",
        temperature: "Temperature",
        sunlight: "Sunlight",
        nutrient: "Nutrient",
        product: "Product",
        quantity: "Qty / acre",
        timing: "Timing",
        pest: "Pest",
        disease: "Disease",
        prevention: "Prevention",
        treatment: "Treatment",
        perAcre: "Per acre",
        total: "Total ({acres} ac)",
        yield: "Expected yield",
        investment: "Investment",
        revenue: "Gross revenue",
        profit: "Estimated profit",
        roi: "ROI",
        yieldInput: "Yield (kg/acre)",
        priceInput: "Farm-gate price (₹/quintal)",
        resetEstimates: "Reset to AI estimate",
        costBreakdown: "Cost breakdown per acre",
        assumptions: "Assumptions",
        yieldBasis: "Yield",
        priceBasis: "Price",
        econNote: "Calculated by FarmWise: revenue = yield × price; profit = revenue − cost; ROI = profit ÷ cost × 100. Yield, price and costs are AI estimates, not live market data — adjust them to your local rates.",
        errorTitle: "Could not generate a recommendation",
        retry: "Try again",
        errors: {
          AI_NOT_CONFIGURED: "The AI service is not set up on the server (the Gemini API key is missing).",
          AI_AUTH: "The AI service rejected the server's API key.",
          AI_QUOTA: "The AI service's usage limit has been reached. Please try again later.",
          AI_MODEL_UNAVAILABLE: "The AI models are busy or unavailable right now. Please try again in a minute.",
          AI_TIMEOUT: "The AI service took too long to respond.",
          AI_INVALID_RESPONSE: "The AI service returned an incomplete or invalid answer.",
          AI_ERROR: "The AI service failed.",
          BAD_REQUEST: "Some inputs are invalid.",
          NETWORK: "Could not reach the FarmWise server.",
        },
      },
      loading: {
        title: "FarmWise AI is working",
        announce: "Generating your crop recommendations. This usually takes less than a minute.",
        steps: [
          "Analyzing your soil parameters...",
          "Evaluating regional crop suitability...",
          "Assessing water and climate requirements...",
          "Estimating cultivation costs and expected returns...",
          "Preparing your personalized crop recommendations...",
        ],
        elapsed: "{s} s elapsed",
        hint: "Usually takes less than a minute",
      },
      fallbackBanner: "The AI service is unavailable, so these are general seasonal suggestions for {state}. They do not take your soil data into account.",
      acresInvalid: "Enter a land area greater than 0.",
      months: "Months",
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
    marketPage: {
      eyebrow: "Market Intelligence",
      title: "Market Pulse",
      subtitle: "Daily wholesale prices reported by mandis in {state}",
      pricesFor: "Prices reported for {date}",
      refresh: "Refresh",
      unit: "₹ per quintal",
      median: "Median",
      kpi: {
        commodities: "Commodities",
        markets: "Markets reporting",
        reports: "Price reports",
        latestDate: "Latest arrivals",
      },
      search: "Search commodity…",
      allDistricts: "All districts",
      sortLabel: "Sort by",
      sort: {
        markets: "Most markets",
        priceHigh: "Highest price",
        priceLow: "Lowest price",
        name: "Name (A–Z)",
      },
      board: "Commodity price board",
      marketsCount: "{n} markets",
      marketOne: "1 market",
      showAll: "Show all {n} markets",
      showFewer: "Show top 10 only",
      detail: "Prices by market",
      colMarket: "Market",
      colVariety: "Variety / grade",
      colMin: "Min",
      colModal: "Modal",
      colMax: "Max",
      modalExplain: "Modal price is the price at which most of the produce was traded. The bar shows the lowest and highest price reported across markets; the dot marks the median modal price.",
      noMatch: "No commodities match your filters.",
      truncated: "Showing the first {n} price reports for this state.",
      source: "Source",
      sourceName: "AGMARKNET daily mandi prices (data.gov.in)",
      fetched: "fetched at {time}",
      trend: {
        title: "Price trend",
        note: "Daily average modal price across reporting mandis in this state",
        days: "{n} days",
        avgModal: "Average modal price",
        unavailable: "No price history is available for this commodity.",
      },
      archive: {
        note: "Prices come from an open daily archive of official AGMARKNET records (not an official service).",
        stale: "These are the latest prices it has: {n} days old ({date}).",
        sourceName: "Open AGMARKNET archive (GitHub: agri-commodity-tracker)",
      },
      age: { one: "1 day old", many: "{n} days old" },
      mirror: {
        noKey: "No data.gov.in key is configured, so prices come from a keyless mirror.",
        keyIssue: "The configured data.gov.in key is rate-limited or rejected, so prices come from a keyless mirror.",
        note: "It republishes the same government AGMARKNET records once a day but is not an official service.",
        sourceName: "Mandi Price API (community mirror of AGMARKNET / data.gov.in)",
        synced: "mirror last synced {time}",
        covers: "Without a data.gov.in key, prices are available for: {states}.",
      },
      ai: {
        title: "AI market commentary",
        basisData: "Written by AI (Gemini) from the mandi prices above. Not financial advice.",
        basisGeneral: "General guidance written by AI (Gemini). Live prices were not available, so it contains no price figures.",
        advice: "Suggestions",
        unavailable: "AI commentary is not available right now.",
        loading: "Writing commentary…",
      },
      states: {
        notConfiguredTitle: "Live mandi prices are not connected yet",
        notConfiguredBody: "This page shows official AGMARKNET prices published on data.gov.in. The server needs a free data.gov.in API key to fetch them.",
        steps: [
          "Sign in at data.gov.in and generate your API key (My Account → Generate API Key).",
          "Add DATA_GOV_IN_API_KEY=your_key to the .env file of the FarmWise server.",
          "Restart the server and open Market Pulse again.",
        ],
        rateLimited: "data.gov.in is limiting requests right now. Please try again in a minute.",
        busy: "The free market price service is busy (it allows 100 requests every 15 minutes). Please try again in about {min} min.",
        uncoveredTitle: "Free mandi prices are not available for {state} yet",
        uncoveredBody: "Prices come from a free, keyless copy of the government AGMARKNET data, which currently covers only some states.",
        switchTo: "See prices for a covered state",
        keyOptional: "Optional: all states with a free data.gov.in key",
        keyRejected: "data.gov.in rejected the configured API key. Check DATA_GOV_IN_API_KEY.",
        upstream: "Could not load mandi prices from data.gov.in.",
        noData: "No mandi price reports were found for {state} in the latest data.",
        retry: "Try again",
      },
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
      location: {
        title: "खेत का स्थान",
        source: "स्थान सूची: स्थानीय सरकार निर्देशिका (LGD), भारत सरकार",
        state: "राज्य / केंद्र शासित प्रदेश",
        district: "जिला",
        subdistrict: "मंडल / तालुका / तहसील",
        village: "गाँव",
        placeholder: "चुनें…",
        search: "खोजने के लिए टाइप करें…",
        noMatches: "कोई परिणाम नहीं मिला",
        loading: "लोड हो रहा है…",
        retry: "फिर से प्रयास करें",
        showingFirst: "पहले {n} परिणाम दिखाए जा रहे हैं। सूची छोटी करने के लिए टाइप करें।",
        selectParentFirst: "पहले ऊपर का स्तर चुनें",
        loadError: "स्थानीय सरकार निर्देशिका से यह सूची लोड नहीं हो सकी। कृपया फिर से प्रयास करें।",
        optionalVillage: "अपना गाँव चुनने से सबसे स्थानीय मिट्टी परिणाम मिलते हैं।",
      },
      soil: {
        title: "मिट्टी के पैरामीटर",
        badgeEstimate: "स्थान-आधारित अनुमान",
        badgeManual: "स्वयं दर्ज किया गया",
        badgeUnavailable: "डेटा उपलब्ध नहीं",
        fetching: "इस स्थान के मिट्टी परीक्षण परिणाम लाए जा रहे हैं…",
        idleHint: "अपने क्षेत्र के सरकारी मिट्टी परीक्षण परिणाम अपने-आप देखने के लिए अपना गाँव चुनें।",
        summaryTitle: "आपके क्षेत्र के मिट्टी परीक्षण परिणाम",
        area: "क्षेत्र",
        cycle: "परीक्षण चक्र",
        samples: "परीक्षित नमूने",
        lastProcessed: "पोर्टल द्वारा अंतिम प्रसंस्करण",
        source: "स्रोत",
        unitsNote: "ये मान सरकारी मिट्टी परीक्षण प्रयोगशालाओं द्वारा उपलब्ध N, P, K (किग्रा/हेक्टेयर में परीक्षित) और pH को दी गई रेटिंग हैं।",
        levels: {
          village: "गाँव",
          block: "ब्लॉक / मंडल",
          district: "जिला",
        },
        disclaimer: "ये रेटिंग इस क्षेत्र के खेतों से परीक्षित मिट्टी के नमूनों से हैं, आपके अपने खेत से नहीं। आपके अपने खेत का मिट्टी परीक्षण हमेशा अधिक सटीक होता है।",
        fallback: {
          village_not_found: "इस गाँव के मिट्टी परीक्षण रिकॉर्ड नहीं मिले, इसलिए जिला-स्तर के परिणाम दिखाए गए हैं।",
          village_insufficient_samples: "इस गाँव में बहुत कम नमूनों का परीक्षण हुआ, इसलिए ब्लॉक-स्तर के परिणाम दिखाए गए हैं।",
          block_insufficient_samples: "इस गाँव और ब्लॉक में बहुत कम नमूनों का परीक्षण हुआ, इसलिए जिला-स्तर के परिणाम दिखाए गए हैं।",
        },
        unavailable: {
          state_not_covered: "मिट्टी परीक्षण डेटा उपलब्ध नहीं है: यह राज्य मृदा स्वास्थ्य कार्ड पोर्टल में नहीं मिला।",
          district_not_covered: "मिट्टी परीक्षण डेटा उपलब्ध नहीं है: यह जिला मृदा स्वास्थ्य कार्ड पोर्टल में नहीं मिला।",
          no_samples: "मिट्टी परीक्षण डेटा उपलब्ध नहीं है: इस गाँव, ब्लॉक या जिले के लिए कोई मिट्टी नमूना दर्ज नहीं है।",
          error: "अभी मिट्टी परीक्षण डेटा प्राप्त नहीं हो सका। मृदा स्वास्थ्य कार्ड पोर्टल उपलब्ध नहीं हो सकता है।",
        },
        nextStep: "अगला कदम: अपनी मिट्टी की जाँच नज़दीकी मिट्टी परीक्षण प्रयोगशाला में कराएँ (मृदा स्वास्थ्य कार्ड योजना, soilhealth.dac.gov.in)। यदि आपके पास पहले से रिपोर्ट है, तो उसके मान नीचे जोड़ सकते हैं। आप स्थान और मौसम के आधार पर अब भी सुझाव पा सकते हैं।",
        samplesRated: "{total} नमूनों में से {share}% की रेटिंग {rating}",
        notAvailable: "उपलब्ध नहीं",
        ratings: {
          Low: "कम",
          Medium: "मध्यम",
          High: "अधिक",
          Acidic: "अम्लीय",
          Neutral: "उदासीन",
          Alkaline: "क्षारीय",
        },
        ownReportToggle: "मेरे पास अपनी मिट्टी परीक्षण रिपोर्ट है (वैकल्पिक)",
        ownReportHint: "केवल वही मान दर्ज करें जो आपके पास हैं। दर्ज किया गया हर मान उस पोषक तत्व के क्षेत्रीय अनुमान की जगह लेगा।",
        manualPlaceholder: "आपकी रिपोर्ट से",
        unit: "किग्रा/हे.",
        clear: "हटाएँ",
        outOfRange: "{min} और {max} के बीच होना चाहिए",
        fixErrors: "कृपया चिह्नित मिट्टी परीक्षण मान सुधारें।",
        noSoilWarning: "मिट्टी का कोई डेटा उपलब्ध नहीं है, इसलिए सुझाव केवल स्थान और मौसम पर आधारित होगा।",
        retry: "फिर से प्रयास करें",
      },
      result: {
        soilBasisTitle: "उपयोग किया गया मिट्टी डेटा",
        soilBasis: {
          measured: "आपका मिट्टी परीक्षण",
          location_estimate: "स्थान-आधारित अनुमान",
          unavailable: "उपलब्ध नहीं",
        },
        aiNote: "नीचे दी गई कृषि सलाह AI ({model}) द्वारा सामान्य ज्ञान से बनाई गई है। यह खेत पर सत्यापित नहीं है और इसमें लाइव मौसम, बाज़ार या कीट-निगरानी डेटा का उपयोग नहीं होता। खुराक और कीट नियंत्रण की पुष्टि अपने स्थानीय KVK या कृषि विभाग से करें।",
        suitability: "AI उपयुक्तता",
        partialCrops: "3 में से केवल {count} फसलें बन सकीं।",
        partialSections: "इस फसल के लिए उपलब्ध नहीं: {sections}।",
        notProvided: "इस उत्तर में उपलब्ध नहीं।",
        sections: {
          soilSuitability: "मिट्टी उपयुक्तता",
          duration: "अवधि",
          timeline: "खेती की समयरेखा",
          water: "पानी और सिंचाई",
          climate: "तापमान और धूप",
          fertilizer: "उर्वरक योजना",
          pests: "कीट और रोग जोखिम",
          economics: "अर्थशास्त्र",
          risks: "जोखिम और सलाह",
        },
        why: "यह फसल क्यों?",
        days: "{min}–{max} दिन",
        harvestWindow: "अनुमानित कटाई",
        dayRange: "दिन {start}–{end}",
        requirement: "आवश्यकता",
        irrigation: "सिंचाई",
        temperature: "तापमान",
        sunlight: "धूप",
        nutrient: "पोषक तत्व",
        product: "उत्पाद",
        quantity: "मात्रा / एकड़",
        timing: "समय",
        pest: "कीट",
        disease: "रोग",
        prevention: "रोकथाम",
        treatment: "उपचार",
        perAcre: "प्रति एकड़",
        total: "कुल ({acres} एकड़)",
        yield: "अपेक्षित उपज",
        investment: "निवेश",
        revenue: "सकल राजस्व",
        profit: "अनुमानित लाभ",
        roi: "ROI",
        yieldInput: "उपज (किग्रा/एकड़)",
        priceInput: "खेत पर मूल्य (₹/क्विंटल)",
        resetEstimates: "AI अनुमान पर लौटें",
        costBreakdown: "प्रति एकड़ लागत विवरण",
        assumptions: "मान्यताएँ",
        yieldBasis: "उपज",
        priceBasis: "मूल्य",
        econNote: "FarmWise द्वारा गणना: राजस्व = उपज × मूल्य; लाभ = राजस्व − लागत; ROI = लाभ ÷ लागत × 100। उपज, मूल्य और लागत AI अनुमान हैं, लाइव बाज़ार डेटा नहीं — इन्हें अपनी स्थानीय दरों के अनुसार बदलें।",
        errorTitle: "सुझाव नहीं बन सका",
        retry: "फिर से प्रयास करें",
        errors: {
          AI_NOT_CONFIGURED: "सर्वर पर AI सेवा सेट नहीं है (Gemini API कुंजी नहीं है)।",
          AI_AUTH: "AI सेवा ने सर्वर की API कुंजी अस्वीकार कर दी।",
          AI_QUOTA: "AI सेवा की उपयोग सीमा पूरी हो गई है। कृपया बाद में प्रयास करें।",
          AI_MODEL_UNAVAILABLE: "AI मॉडल अभी व्यस्त या अनुपलब्ध हैं। कृपया एक मिनट बाद फिर प्रयास करें।",
          AI_TIMEOUT: "AI सेवा ने उत्तर देने में बहुत समय लिया।",
          AI_INVALID_RESPONSE: "AI सेवा ने अधूरा या अमान्य उत्तर दिया।",
          AI_ERROR: "AI सेवा विफल रही।",
          BAD_REQUEST: "कुछ इनपुट अमान्य हैं।",
          NETWORK: "FarmWise सर्वर तक नहीं पहुँच सके।",
        },
      },
      loading: {
        title: "FarmWise AI काम कर रहा है",
        announce: "आपके फसल सुझाव तैयार किए जा रहे हैं। इसमें आमतौर पर एक मिनट से कम समय लगता है।",
        steps: [
          "आपकी मिट्टी के मापदंडों का विश्लेषण...",
          "क्षेत्रीय फसल उपयुक्तता का मूल्यांकन...",
          "पानी और जलवायु आवश्यकताओं का आकलन...",
          "खेती की लागत और अपेक्षित आय का अनुमान...",
          "आपके लिए व्यक्तिगत फसल सुझाव तैयार किए जा रहे हैं...",
        ],
        elapsed: "{s} सेकंड बीते",
        hint: "आमतौर पर एक मिनट से कम समय लगता है",
      },
      fallbackBanner: "AI सेवा उपलब्ध नहीं है, इसलिए ये {state} के लिए सामान्य मौसमी सुझाव हैं। इनमें आपकी मिट्टी का डेटा शामिल नहीं है।",
      acresInvalid: "0 से अधिक भूमि क्षेत्र दर्ज करें।",
      months: "महीने",
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
    marketPage: {
      eyebrow: "बाज़ार जानकारी",
      title: "मार्केट पल्स",
      subtitle: "{state} की मंडियों द्वारा दर्ज दैनिक थोक भाव",
      pricesFor: "{date} के दर्ज भाव",
      refresh: "ताज़ा करें",
      unit: "₹ प्रति क्विंटल",
      median: "माध्यिका",
      kpi: {
        commodities: "जिंसें",
        markets: "रिपोर्ट करने वाली मंडियाँ",
        reports: "भाव रिपोर्ट",
        latestDate: "नवीनतम आवक",
      },
      search: "जिंस खोजें…",
      allDistricts: "सभी जिले",
      sortLabel: "क्रम",
      sort: {
        markets: "सबसे अधिक मंडियाँ",
        priceHigh: "सबसे ऊँचा भाव",
        priceLow: "सबसे कम भाव",
        name: "नाम (A–Z)",
      },
      board: "जिंस भाव बोर्ड",
      marketsCount: "{n} मंडियाँ",
      marketOne: "1 मंडी",
      showAll: "सभी {n} मंडियाँ दिखाएँ",
      showFewer: "केवल शीर्ष 10 दिखाएँ",
      detail: "मंडीवार भाव",
      colMarket: "मंडी",
      colVariety: "किस्म / ग्रेड",
      colMin: "न्यूनतम",
      colModal: "मॉडल",
      colMax: "अधिकतम",
      modalExplain: "मॉडल भाव वह भाव है जिस पर सबसे अधिक उपज बिकी। पट्टी मंडियों में दर्ज सबसे कम और सबसे ऊँचा भाव दिखाती है; बिंदु माध्यिका मॉडल भाव है।",
      noMatch: "आपके फ़िल्टर से कोई जिंस मेल नहीं खाती।",
      truncated: "इस राज्य की पहली {n} भाव रिपोर्ट दिखाई जा रही हैं।",
      source: "स्रोत",
      sourceName: "AGMARKNET दैनिक मंडी भाव (data.gov.in)",
      fetched: "{time} पर प्राप्त",
      trend: {
        title: "भाव रुझान",
        note: "इस राज्य की रिपोर्ट करने वाली मंडियों का दैनिक औसत मॉडल भाव",
        days: "{n} दिन",
        avgModal: "औसत मॉडल भाव",
        unavailable: "इस जिंस का भाव इतिहास उपलब्ध नहीं है।",
      },
      archive: {
        note: "भाव आधिकारिक AGMARKNET रिकॉर्ड के खुले दैनिक संग्रह से हैं (आधिकारिक सेवा नहीं)।",
        stale: "इसमें उपलब्ध नवीनतम भाव {n} दिन पुराने हैं ({date})।",
        sourceName: "खुला AGMARKNET संग्रह (GitHub: agri-commodity-tracker)",
      },
      age: { one: "1 दिन पुराना", many: "{n} दिन पुराना" },
      mirror: {
        noKey: "data.gov.in कुंजी सेट नहीं है, इसलिए भाव बिना-कुंजी मिरर से लिए गए हैं।",
        keyIssue: "सेट की गई data.gov.in कुंजी सीमित या अस्वीकृत है, इसलिए भाव बिना-कुंजी मिरर से लिए गए हैं।",
        note: "यह वही सरकारी AGMARKNET रिकॉर्ड दिन में एक बार दोबारा प्रकाशित करता है, पर यह आधिकारिक सेवा नहीं है।",
        sourceName: "Mandi Price API (AGMARKNET / data.gov.in का सामुदायिक मिरर)",
        synced: "मिरर अंतिम सिंक {time}",
        covers: "data.gov.in कुंजी के बिना इन राज्यों के भाव उपलब्ध हैं: {states}।",
      },
      ai: {
        title: "AI बाज़ार टिप्पणी",
        basisData: "ऊपर दिए मंडी भावों के आधार पर AI (Gemini) द्वारा लिखी गई। यह वित्तीय सलाह नहीं है।",
        basisGeneral: "AI (Gemini) द्वारा लिखी गई सामान्य सलाह। लाइव भाव उपलब्ध नहीं थे, इसलिए इसमें कोई भाव नहीं है।",
        advice: "सुझाव",
        unavailable: "AI टिप्पणी अभी उपलब्ध नहीं है।",
        loading: "टिप्पणी लिखी जा रही है…",
      },
      states: {
        notConfiguredTitle: "लाइव मंडी भाव अभी जुड़े नहीं हैं",
        notConfiguredBody: "यह पेज data.gov.in पर प्रकाशित आधिकारिक AGMARKNET भाव दिखाता है। इन्हें लाने के लिए सर्वर को data.gov.in की मुफ़्त API कुंजी चाहिए।",
        steps: [
          "data.gov.in पर साइन इन करें और अपनी API कुंजी बनाएँ (My Account → Generate API Key)।",
          "FarmWise सर्वर की .env फ़ाइल में DATA_GOV_IN_API_KEY=आपकी_कुंजी जोड़ें।",
          "सर्वर फिर से चालू करें और मार्केट पल्स दोबारा खोलें।",
        ],
        rateLimited: "data.gov.in अभी अनुरोध सीमित कर रहा है। कृपया एक मिनट बाद फिर प्रयास करें।",
        busy: "मुफ़्त बाज़ार भाव सेवा अभी व्यस्त है (यह हर 15 मिनट में 100 अनुरोध की अनुमति देती है)। कृपया लगभग {min} मिनट बाद फिर प्रयास करें।",
        uncoveredTitle: "{state} के लिए मुफ़्त मंडी भाव अभी उपलब्ध नहीं हैं",
        uncoveredBody: "भाव सरकारी AGMARKNET डेटा की मुफ़्त, बिना-कुंजी प्रति से आते हैं, जो अभी केवल कुछ राज्यों को कवर करती है।",
        switchTo: "कवर किए गए राज्य के भाव देखें",
        keyOptional: "वैकल्पिक: मुफ़्त data.gov.in कुंजी से सभी राज्य",
        keyRejected: "data.gov.in ने सेट की गई API कुंजी अस्वीकार कर दी। DATA_GOV_IN_API_KEY जाँचें।",
        upstream: "data.gov.in से मंडी भाव लोड नहीं हो सके।",
        noData: "नवीनतम डेटा में {state} के लिए कोई मंडी भाव रिपोर्ट नहीं मिली।",
        retry: "फिर से प्रयास करें",
      },
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
      location: {
        title: "పొలం ఉన్న ప్రదేశం",
        source: "ప్రదేశాల జాబితా: లోకల్ గవర్నమెంట్ డైరెక్టరీ (LGD), భారత ప్రభుత్వం",
        state: "రాష్ట్రం / కేంద్రపాలిత ప్రాంతం",
        district: "జిల్లా",
        subdistrict: "మండలం / తాలూకా / తహసీల్",
        village: "గ్రామం",
        placeholder: "ఎంచుకోండి…",
        search: "వెతకడానికి టైప్ చేయండి…",
        noMatches: "ఫలితాలు ఏవీ లేవు",
        loading: "లోడ్ అవుతోంది…",
        retry: "మళ్లీ ప్రయత్నించండి",
        showingFirst: "మొదటి {n} ఫలితాలు చూపబడుతున్నాయి. జాబితాను తగ్గించడానికి టైప్ చేయండి.",
        selectParentFirst: "ముందుగా పై స్థాయిని ఎంచుకోండి",
        loadError: "లోకల్ గవర్నమెంట్ డైరెక్టరీ నుండి ఈ జాబితాను లోడ్ చేయలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి.",
        optionalVillage: "మీ గ్రామాన్ని ఎంచుకుంటే అత్యంత స్థానిక నేల ఫలితాలు లభిస్తాయి.",
      },
      soil: {
        title: "నేల పారామితులు",
        badgeEstimate: "ప్రదేశ ఆధారిత అంచనా",
        badgeManual: "మాన్యువల్ నమోదు",
        badgeUnavailable: "డేటా అందుబాటులో లేదు",
        fetching: "ఈ ప్రదేశానికి నేల పరీక్ష ఫలితాలను పొందుతోంది…",
        idleHint: "మీ ప్రాంతానికి సంబంధించిన ప్రభుత్వ నేల పరీక్ష ఫలితాలను స్వయంచాలకంగా పొందడానికి మీ గ్రామాన్ని ఎంచుకోండి.",
        summaryTitle: "మీ ప్రాంతంలోని నేల పరీక్ష ఫలితాలు",
        area: "ప్రాంతం",
        cycle: "పరీక్ష చక్రం",
        samples: "పరీక్షించిన నమూనాలు",
        lastProcessed: "పోర్టల్ చివరిగా ప్రాసెస్ చేసింది",
        source: "మూలం",
        unitsNote: "ఈ విలువలు ప్రభుత్వ నేల పరీక్ష ప్రయోగశాలలు అందుబాటులో ఉన్న N, P, K (కి.గ్రా/హె.లో పరీక్షించినవి) మరియు pH కు ఇచ్చిన రేటింగ్‌లు.",
        levels: {
          village: "గ్రామం",
          block: "బ్లాక్ / మండలం",
          district: "జిల్లా",
        },
        disclaimer: "ఈ రేటింగ్‌లు ఈ ప్రాంతంలోని పొలాల నుండి పరీక్షించిన నేల నమూనాలవి, మీ సొంత పొలానివి కావు. మీ పొలం నేల పరీక్ష ఎల్లప్పుడూ మరింత ఖచ్చితమైనది.",
        fallback: {
          village_not_found: "ఈ గ్రామానికి నేల పరీక్ష రికార్డులు దొరకలేదు, అందువల్ల జిల్లా స్థాయి ఫలితాలు చూపబడ్డాయి.",
          village_insufficient_samples: "ఈ గ్రామంలో చాలా తక్కువ నమూనాలు పరీక్షించబడ్డాయి, అందువల్ల బ్లాక్ స్థాయి ఫలితాలు చూపబడ్డాయి.",
          block_insufficient_samples: "ఈ గ్రామం మరియు బ్లాక్‌లో చాలా తక్కువ నమూనాలు పరీక్షించబడ్డాయి, అందువల్ల జిల్లా స్థాయి ఫలితాలు చూపబడ్డాయి.",
        },
        unavailable: {
          state_not_covered: "నేల పరీక్ష డేటా అందుబాటులో లేదు: ఈ రాష్ట్రం సాయిల్ హెల్త్ కార్డ్ పోర్టల్‌లో కనబడలేదు.",
          district_not_covered: "నేల పరీక్ష డేటా అందుబాటులో లేదు: ఈ జిల్లా సాయిల్ హెల్త్ కార్డ్ పోర్టల్‌లో కనబడలేదు.",
          no_samples: "నేల పరీక్ష డేటా అందుబాటులో లేదు: ఈ గ్రామం, బ్లాక్ లేదా జిల్లాకు నేల నమూనాలు ఏవీ నమోదు కాలేదు.",
          error: "ప్రస్తుతం నేల పరీక్ష డేటా పొందలేకపోయాము. సాయిల్ హెల్త్ కార్డ్ పోర్టల్ అందుబాటులో లేకపోవచ్చు.",
        },
        nextStep: "తదుపరి దశ: సమీపంలోని నేల పరీక్ష ప్రయోగశాలలో మీ నేలను పరీక్షించుకోండి (సాయిల్ హెల్త్ కార్డ్ పథకం, soilhealth.dac.gov.in). మీ వద్ద ఇప్పటికే నివేదిక ఉంటే, దాని విలువలను కింద జోడించవచ్చు. ప్రదేశం మరియు సీజన్ ఆధారంగా ఇప్పటికీ సిఫార్సు పొందవచ్చు.",
        samplesRated: "{total} నమూనాలలో {share}% కు రేటింగ్ {rating}",
        notAvailable: "అందుబాటులో లేదు",
        ratings: {
          Low: "తక్కువ",
          Medium: "మధ్యస్థం",
          High: "ఎక్కువ",
          Acidic: "ఆమ్ల",
          Neutral: "తటస్థ",
          Alkaline: "క్షార",
        },
        ownReportToggle: "నా వద్ద సొంత నేల పరీక్ష నివేదిక ఉంది (ఐచ్ఛికం)",
        ownReportHint: "మీ వద్ద ఉన్న విలువలను మాత్రమే నమోదు చేయండి. మీరు నమోదు చేసిన ప్రతి విలువ ఆ పోషకానికి ప్రాంత అంచనాను భర్తీ చేస్తుంది.",
        manualPlaceholder: "మీ నివేదిక నుండి",
        unit: "కి.గ్రా/హె.",
        clear: "తొలగించు",
        outOfRange: "{min} మరియు {max} మధ్య ఉండాలి",
        fixErrors: "దయచేసి గుర్తించిన నేల పరీక్ష విలువలను సరిచేయండి.",
        noSoilWarning: "నేల డేటా అందుబాటులో లేదు, కాబట్టి సిఫార్సు ప్రదేశం మరియు సీజన్ ఆధారంగా మాత్రమే ఉంటుంది.",
        retry: "మళ్లీ ప్రయత్నించండి",
      },
      result: {
        soilBasisTitle: "ఉపయోగించిన నేల డేటా",
        soilBasis: {
          measured: "మీ నేల పరీక్ష",
          location_estimate: "ప్రదేశ ఆధారిత అంచనా",
          unavailable: "అందుబాటులో లేదు",
        },
        aiNote: "కింది వ్యవసాయ సలహా AI ({model}) సాధారణ జ్ఞానం ఆధారంగా రూపొందించింది. ఇది పొలంలో ధృవీకరించబడలేదు మరియు ప్రత్యక్ష వాతావరణ, మార్కెట్ లేదా తెగుళ్ల నిఘా డేటాను ఉపయోగించదు. మోతాదులు మరియు సస్యరక్షణను మీ స్థానిక KVK లేదా వ్యవసాయ శాఖతో నిర్ధారించుకోండి.",
        suitability: "AI అనుకూలత",
        partialCrops: "3 పంటలలో {count} మాత్రమే రూపొందించగలిగాము.",
        partialSections: "ఈ పంటకు అందుబాటులో లేదు: {sections}.",
        notProvided: "ఈ ప్రతిస్పందనలో అందుబాటులో లేదు.",
        sections: {
          soilSuitability: "నేల అనుకూలత",
          duration: "వ్యవధి",
          timeline: "సాగు కాలక్రమం",
          water: "నీరు & నీటిపారుదల",
          climate: "ఉష్ణోగ్రత & సూర్యరశ్మి",
          fertilizer: "ఎరువుల ప్రణాళిక",
          pests: "తెగుళ్లు & వ్యాధి ప్రమాదాలు",
          economics: "ఆర్థికాంశాలు",
          risks: "ప్రమాదాలు & సలహాలు",
        },
        why: "ఈ పంట ఎందుకు?",
        days: "{min}–{max} రోజులు",
        harvestWindow: "సుమారు కోత",
        dayRange: "రోజు {start}–{end}",
        requirement: "అవసరం",
        irrigation: "నీటిపారుదల",
        temperature: "ఉష్ణోగ్రత",
        sunlight: "సూర్యరశ్మి",
        nutrient: "పోషకం",
        product: "ఉత్పత్తి",
        quantity: "పరిమాణం / ఎకరం",
        timing: "సమయం",
        pest: "తెగులు",
        disease: "వ్యాధి",
        prevention: "నివారణ",
        treatment: "చికిత్స",
        perAcre: "ఎకరానికి",
        total: "మొత్తం ({acres} ఎకరాలు)",
        yield: "ఆశించిన దిగుబడి",
        investment: "పెట్టుబడి",
        revenue: "స్థూల ఆదాయం",
        profit: "అంచనా లాభం",
        roi: "ROI",
        yieldInput: "దిగుబడి (కి.గ్రా/ఎకరం)",
        priceInput: "పొలం వద్ద ధర (₹/క్వింటాల్)",
        resetEstimates: "AI అంచనాకు తిరిగి వెళ్ళు",
        costBreakdown: "ఎకరానికి ఖర్చుల వివరాలు",
        assumptions: "అంచనాలు",
        yieldBasis: "దిగుబడి",
        priceBasis: "ధర",
        econNote: "FarmWise లెక్కింపు: ఆదాయం = దిగుబడి × ధర; లాభం = ఆదాయం − ఖర్చు; ROI = లాభం ÷ ఖర్చు × 100. దిగుబడి, ధర మరియు ఖర్చులు AI అంచనాలు, ప్రత్యక్ష మార్కెట్ డేటా కాదు — మీ స్థానిక ధరలకు అనుగుణంగా మార్చండి.",
        errorTitle: "సిఫార్సును రూపొందించలేకపోయాము",
        retry: "మళ్లీ ప్రయత్నించండి",
        errors: {
          AI_NOT_CONFIGURED: "సర్వర్‌లో AI సేవ సెటప్ కాలేదు (Gemini API కీ లేదు).",
          AI_AUTH: "AI సేవ సర్వర్ API కీని తిరస్కరించింది.",
          AI_QUOTA: "AI సేవ వినియోగ పరిమితి చేరింది. దయచేసి తర్వాత ప్రయత్నించండి.",
          AI_MODEL_UNAVAILABLE: "AI మోడల్‌లు ప్రస్తుతం బిజీగా ఉన్నాయి లేదా అందుబాటులో లేవు. దయచేసి ఒక నిమిషం తర్వాత మళ్లీ ప్రయత్నించండి.",
          AI_TIMEOUT: "AI సేవ స్పందించడానికి చాలా సమయం తీసుకుంది.",
          AI_INVALID_RESPONSE: "AI సేవ అసంపూర్ణ లేదా చెల్లని సమాధానం ఇచ్చింది.",
          AI_ERROR: "AI సేవ విఫలమైంది.",
          BAD_REQUEST: "కొన్ని ఇన్‌పుట్‌లు చెల్లవు.",
          NETWORK: "FarmWise సర్వర్‌ను చేరుకోలేకపోయాము.",
        },
      },
      loading: {
        title: "FarmWise AI పని చేస్తోంది",
        announce: "మీ పంట సిఫార్సులు సిద్ధమవుతున్నాయి. దీనికి సాధారణంగా ఒక నిమిషం కంటే తక్కువ సమయం పడుతుంది.",
        steps: [
          "మీ నేల పారామితులను విశ్లేషిస్తోంది...",
          "ప్రాంతీయ పంట అనుకూలతను అంచనా వేస్తోంది...",
          "నీరు మరియు వాతావరణ అవసరాలను పరిశీలిస్తోంది...",
          "సాగు ఖర్చులు మరియు ఆశించిన రాబడిని అంచనా వేస్తోంది...",
          "మీ కోసం వ్యక్తిగత పంట సిఫార్సులను సిద్ధం చేస్తోంది...",
        ],
        elapsed: "{s} సెకన్లు గడిచాయి",
        hint: "సాధారణంగా ఒక నిమిషం కంటే తక్కువ సమయం పడుతుంది",
      },
      fallbackBanner: "AI సేవ అందుబాటులో లేదు, కాబట్టి ఇవి {state} కోసం సాధారణ సీజనల్ సూచనలు మాత్రమే. ఇవి మీ నేల డేటాను పరిగణనలోకి తీసుకోవు.",
      acresInvalid: "0 కంటే ఎక్కువ భూమి విస్తీర్ణాన్ని నమోదు చేయండి.",
      months: "నెలలు",
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
    marketPage: {
      eyebrow: "మార్కెట్ సమాచారం",
      title: "మార్కెట్ పల్స్",
      subtitle: "{state} లోని మార్కెట్ యార్డులు నమోదు చేసిన రోజువారీ టోకు ధరలు",
      pricesFor: "{date} నాటి నమోదైన ధరలు",
      refresh: "రిఫ్రెష్",
      unit: "₹ / క్వింటాల్",
      median: "మధ్యస్థ",
      kpi: {
        commodities: "సరుకులు",
        markets: "నివేదించిన మార్కెట్లు",
        reports: "ధర నివేదికలు",
        latestDate: "తాజా రాకలు",
      },
      search: "సరుకు వెతకండి…",
      allDistricts: "అన్ని జిల్లాలు",
      sortLabel: "క్రమం",
      sort: {
        markets: "ఎక్కువ మార్కెట్లు",
        priceHigh: "అధిక ధర",
        priceLow: "తక్కువ ధర",
        name: "పేరు (A–Z)",
      },
      board: "సరుకు ధరల బోర్డు",
      marketsCount: "{n} మార్కెట్లు",
      marketOne: "1 మార్కెట్",
      showAll: "అన్ని {n} మార్కెట్లు చూపించు",
      showFewer: "టాప్ 10 మాత్రమే చూపించు",
      detail: "మార్కెట్ వారీ ధరలు",
      colMarket: "మార్కెట్",
      colVariety: "రకం / గ్రేడ్",
      colMin: "కనిష్ఠ",
      colModal: "మోడల్",
      colMax: "గరిష్ఠ",
      modalExplain: "మోడల్ ధర అంటే ఎక్కువ సరుకు అమ్ముడైన ధర. పట్టీ మార్కెట్లలో నమోదైన కనిష్ఠ మరియు గరిష్ఠ ధరను చూపుతుంది; చుక్క మధ్యస్థ మోడల్ ధర.",
      noMatch: "మీ ఫిల్టర్లకు సరిపోయే సరుకులు లేవు.",
      truncated: "ఈ రాష్ట్రానికి మొదటి {n} ధర నివేదికలు చూపబడుతున్నాయి.",
      source: "మూలం",
      sourceName: "AGMARKNET రోజువారీ మార్కెట్ ధరలు (data.gov.in)",
      fetched: "{time} కి పొందబడింది",
      trend: {
        title: "ధర ధోరణి",
        note: "ఈ రాష్ట్రంలో నివేదించిన మార్కెట్ల రోజువారీ సగటు మోడల్ ధర",
        days: "{n} రోజులు",
        avgModal: "సగటు మోడల్ ధర",
        unavailable: "ఈ సరుకుకు ధర చరిత్ర అందుబాటులో లేదు.",
      },
      archive: {
        note: "ధరలు అధికారిక AGMARKNET రికార్డుల బహిరంగ రోజువారీ ఆర్కైవ్ నుండి వచ్చాయి (అధికారిక సేవ కాదు).",
        stale: "ఇందులో ఉన్న తాజా ధరలు {n} రోజుల పాతవి ({date}).",
        sourceName: "బహిరంగ AGMARKNET ఆర్కైవ్ (GitHub: agri-commodity-tracker)",
      },
      age: { one: "1 రోజు పాతది", many: "{n} రోజుల పాతది" },
      mirror: {
        noKey: "data.gov.in కీ సెట్ కాలేదు, కాబట్టి ధరలు కీ అవసరం లేని మిర్రర్ నుండి వచ్చాయి.",
        keyIssue: "సెట్ చేసిన data.gov.in కీ పరిమితం లేదా తిరస్కరించబడింది, కాబట్టి ధరలు కీ అవసరం లేని మిర్రర్ నుండి వచ్చాయి.",
        note: "ఇది అదే ప్రభుత్వ AGMARKNET రికార్డులను రోజుకు ఒకసారి మళ్లీ ప్రచురిస్తుంది, కానీ ఇది అధికారిక సేవ కాదు.",
        sourceName: "Mandi Price API (AGMARKNET / data.gov.in యొక్క కమ్యూనిటీ మిర్రర్)",
        synced: "మిర్రర్ చివరి సింక్ {time}",
        covers: "data.gov.in కీ లేకుండా ఈ రాష్ట్రాలకు ధరలు అందుబాటులో ఉన్నాయి: {states}.",
      },
      ai: {
        title: "AI మార్కెట్ వ్యాఖ్యానం",
        basisData: "పై మార్కెట్ ధరల ఆధారంగా AI (Gemini) రాసింది. ఇది ఆర్థిక సలహా కాదు.",
        basisGeneral: "AI (Gemini) రాసిన సాధారణ సలహా. ప్రత్యక్ష ధరలు అందుబాటులో లేవు, కాబట్టి ఇందులో ధరలు లేవు.",
        advice: "సూచనలు",
        unavailable: "AI వ్యాఖ్యానం ప్రస్తుతం అందుబాటులో లేదు.",
        loading: "వ్యాఖ్యానం రాస్తోంది…",
      },
      states: {
        notConfiguredTitle: "ప్రత్యక్ష మార్కెట్ ధరలు ఇంకా కనెక్ట్ కాలేదు",
        notConfiguredBody: "ఈ పేజీ data.gov.in లో ప్రచురించిన అధికారిక AGMARKNET ధరలను చూపుతుంది. వాటిని పొందడానికి సర్వర్‌కు data.gov.in ఉచిత API కీ అవసరం.",
        steps: [
          "data.gov.in లో సైన్ ఇన్ చేసి మీ API కీని రూపొందించండి (My Account → Generate API Key).",
          "FarmWise సర్వర్ .env ఫైల్‌లో DATA_GOV_IN_API_KEY=మీ_కీ జోడించండి.",
          "సర్వర్‌ను రీస్టార్ట్ చేసి మార్కెట్ పల్స్ మళ్లీ తెరవండి.",
        ],
        rateLimited: "data.gov.in ప్రస్తుతం అభ్యర్థనలను పరిమితం చేస్తోంది. దయచేసి ఒక నిమిషం తర్వాత ప్రయత్నించండి.",
        busy: "ఉచిత మార్కెట్ ధరల సేవ ప్రస్తుతం బిజీగా ఉంది (ప్రతి 15 నిమిషాలకు 100 అభ్యర్థనలు మాత్రమే). దయచేసి సుమారు {min} నిమిషాల తర్వాత ప్రయత్నించండి.",
        uncoveredTitle: "{state} కోసం ఉచిత మార్కెట్ ధరలు ఇంకా అందుబాటులో లేవు",
        uncoveredBody: "ధరలు ప్రభుత్వ AGMARKNET డేటా యొక్క ఉచిత, కీ అవసరం లేని కాపీ నుండి వస్తాయి, ఇది ప్రస్తుతం కొన్ని రాష్ట్రాలను మాత్రమే కవర్ చేస్తుంది.",
        switchTo: "కవర్ చేసిన రాష్ట్రం ధరలు చూడండి",
        keyOptional: "ఐచ్ఛికం: ఉచిత data.gov.in కీతో అన్ని రాష్ట్రాలు",
        keyRejected: "data.gov.in సెట్ చేసిన API కీని తిరస్కరించింది. DATA_GOV_IN_API_KEY ని తనిఖీ చేయండి.",
        upstream: "data.gov.in నుండి మార్కెట్ ధరలను లోడ్ చేయలేకపోయాము.",
        noData: "తాజా డేటాలో {state} కోసం మార్కెట్ ధర నివేదికలు కనబడలేదు.",
        retry: "మళ్లీ ప్రయత్నించండి",
      },
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
