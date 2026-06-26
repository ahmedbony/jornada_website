// Narrative content for the Option Page template (see OptionPage.jsx).
// Keyed by option id. Each entry follows the 8-section structure from the
// wireframe: Overview, Water outcomes, Implementation, Where it fits,
// Benefits, Costs/limitations, Case studies, Resources.
export const OPTION_DETAILS = {
  "solar-shade": {
    overview:
      "Solar shade involves placing structures or materials to reduce the amount of solar radiation that reaches water surfaces. This can lower evaporation losses in storage ponds, canals, and tanks, helping conserve water — especially during hot, dry, and windy conditions.\n\nIt can be applied as floating covers, overhead shade structures, or closely spaced photovoltaic (PV) arrays that provide partial shade while generating energy. Design should consider climate, system purpose, and potential operational needs.",
    waterOutcomes: {
      primaryPathway: "Reduces evaporation losses from open water surfaces.",
      secondaryPathways:
        "May improve water quality by reducing temperature and algal growth; can support energy generation that reduces pumping costs.",
      scaleOfEffect:
        "Typically small to moderate at the pond, canal, or tank scale; larger impacts when applied across multiple systems.",
      evidenceConfidence:
        "Moderate. Field studies show consistent evaporation reduction; outcomes vary with design, climate, and operations.",
      caveats:
        "Effectiveness depends on coverage, wind conditions, and maintenance; may affect access for cleaning, mixing, or other operations.",
      diagram: "solar-shade",
    },
    implementation:
      "Start with a site assessment of the water body's size, depth, and exposure. Floating covers suit smaller ponds and tanks; overhead structures or PV arrays fit larger canals and reservoirs where load-bearing supports can be installed. Plan for periodic cleaning and inspection, especially after storms or high-wind events.",
    whereItFits:
      "Best suited to storage ponds, canals, and tanks in hot, arid, and windy regions where evaporation losses are a significant share of total water loss. Less impactful in cooler, humid, or low-wind settings.",
    benefits:
      "Reduces non-productive water loss without reducing the water available for use. PV-based shading can offset pumping or operational energy costs. Some designs also reduce algal growth and improve water quality.",
    costsLimitations:
      "Upfront material and installation costs vary widely by design — floating covers are the least expensive, PV arrays the most. Ongoing maintenance is required to keep structures functional. Effectiveness is context-dependent and harder to predict than more established practices.",
    caseStudies:
      "Examples from farms, districts, and research sites applying floating covers on irrigation ponds and PV shade structures on canals in arid regions.",
    resourceTypes: ["funding", "extension", "tools"],
  },

  "managed-recharge": {
    overview:
      "Managed aquifer recharge intentionally directs surface water — from snowmelt, storm flows, or treated water — into the ground to replenish aquifers during periods of surplus, building up storage that can be drawn on later during shortages.",
    waterOutcomes: {
      primaryPathway: "Increases aquifer storage by capturing surplus water and infiltrating it underground.",
      secondaryPathways: "Can stabilize or reverse local groundwater level decline and reduce land subsidence risk.",
      scaleOfEffect: "Effects build at the basin or sub-basin scale and accrue over multiple recharge seasons.",
      evidenceConfidence: "Strong. Widely studied and implemented across groundwater basins in the western U.S.",
      caveats: "Requires suitable soils and available surplus water; benefits take time to materialize and are shared across the basin rather than captured by one user.",
    },
    implementation:
      "Identify recharge-suitable land (often retired or fallowed fields with permeable soils) and a reliable surplus water source. Coordinate with a groundwater management agency or irrigation district, since recharge projects are usually managed collectively rather than by a single producer.",
    whereItFits:
      "Groundwater-dependent agricultural regions facing long-term aquifer decline, particularly where surplus surface water is seasonally available.",
    benefits:
      "Builds a buffer against future drought years, can reduce pumping costs by raising the water table, and may qualify for state or district cost-share funding.",
    costsLimitations:
      "Requires infrastructure (basins, conveyance) and land dedicated to recharge. Benefits are basin-wide and may not directly accrue to the landowner hosting the project without a formal agreement.",
    caseStudies: "District-led recharge programs piloted on fallowed or rotational fields during wet years.",
    resourceTypes: ["funding", "extension"],
  },

  "groundwater-plan": {
    overview:
      "A groundwater conservation plan lays out specific goals, monitoring practices, and management actions to bring groundwater use in line with sustainable supply — often developed jointly by a group of producers or a local management agency.",
    waterOutcomes: {
      primaryPathway: "Reduces aggregate groundwater extraction relative to a defined baseline.",
      secondaryPathways: "Improves planning certainty for water users facing future allocation limits.",
      scaleOfEffect: "District or basin scale, though individual producers implement specific actions within the plan.",
      evidenceConfidence: "Strong. Required under groundwater management frameworks in several western states.",
      caveats: "Effectiveness depends on stakeholder buy-in and enforcement; plans without monitoring or accountability mechanisms tend to underperform.",
    },
    implementation:
      "Typically developed through a groundwater sustainability agency or similar local body, with input from producers. Involves setting measurable targets, identifying monitoring wells, and selecting demand-reduction or recharge actions to reach those targets.",
    whereItFits:
      "Any groundwater-dependent region, especially those under state-mandated sustainability planning requirements.",
    benefits:
      "Low direct cost to individual producers; creates a shared framework that can unlock funding for complementary projects like recharge or efficiency upgrades.",
    costsLimitations:
      "Primarily a planning and coordination cost rather than a capital cost. Can take years to show measurable water-level results.",
    caseStudies: "Groundwater sustainability plans developed under state-mandated basin management programs.",
    resourceTypes: ["extension", "funding"],
  },

  "irrigation-scheduling": {
    overview:
      "Irrigation scheduling means adjusting the timing and amount of water applied based on crop needs, soil conditions, and weather — rather than a fixed calendar — to avoid applying more water than the crop actually needs.",
    waterOutcomes: {
      primaryPathway: "Reduces water applied per acre by matching irrigation to actual crop water demand.",
      secondaryPathways: "Lowers pumping energy costs and can reduce nutrient leaching from over-irrigation.",
      scaleOfEffect: "On-farm, field-by-field; effects are immediate and directly attributable to the change.",
      evidenceConfidence: "Strong. One of the most well-documented on-farm water efficiency practices.",
      caveats: "Requires access to weather/ET data or soil moisture information and some adjustment to existing routines.",
    },
    implementation:
      "Use a free evapotranspiration (ET) data source like OpenET, or install basic soil moisture sensors. Adjust irrigation timing and depth weekly based on crop stage and current conditions rather than a fixed schedule.",
    whereItFits: "Any irrigated operation, particularly where pumping costs are high or water allocations are tight.",
    benefits:
      "Often the lowest-cost, fastest-to-implement water efficiency improvement available, with direct savings on both water and energy costs.",
    costsLimitations:
      "Minimal cost if using free data tools; more advanced sensor-based scheduling has moderate upfront hardware cost. Requires consistent attention to apply correctly.",
    caseStudies: "On-farm trials showing reduced pumping hours after adopting ET-based scheduling.",
    resourceTypes: ["tools", "guides"],
  },

  "water-lease": {
    overview:
      "Water leasing and purchase involves acquiring additional water rights — temporarily or permanently — through the water market, giving an operation more flexibility to meet needs during shortages.",
    waterOutcomes: {
      primaryPathway: "Increases water availability without changing on-farm practices.",
      secondaryPathways: "Can support diversification or expansion that would otherwise be limited by existing allocation.",
      scaleOfEffect: "Individual transaction scale, but cumulative market activity affects regional water pricing and availability.",
      evidenceConfidence: "Moderate. Water markets are well-established in some basins, less developed in others.",
      caveats: "Subject to water rights law, market price volatility, and approval processes that vary significantly by state and basin.",
    },
    implementation:
      "Work with a water rights broker, district, or attorney familiar with local transfer rules. Lease terms can range from single-season to multi-year; permanent purchases require more due diligence.",
    whereItFits:
      "Operations in basins with active water markets and surface-water-dependent systems facing allocation shortfalls.",
    benefits: "Provides near-term flexibility without requiring infrastructure changes or shifts in cropping practice.",
    costsLimitations:
      "Can be expensive, particularly during drought years when demand for transfers spikes. Transaction costs and legal review add time and expense.",
    caseStudies: "Seasonal water transfers between agricultural and municipal users during drought years.",
    resourceTypes: ["funding"],
  },

  "forecasting-tools": {
    overview:
      "Forecasting tools use historical data, remote sensing, and hydrologic models to project aquifer levels and water availability, helping producers and districts plan further ahead than reactive monitoring alone allows.",
    waterOutcomes: {
      primaryPathway: "Improves planning lead time by projecting future water availability.",
      secondaryPathways: "Supports better-timed recharge, demand-reduction, or contingency decisions.",
      scaleOfEffect: "District or basin scale forecasting; informs decisions made at any scale.",
      evidenceConfidence: "Moderate. Forecast accuracy varies by basin data quality and model type.",
      caveats: "Forecasts carry uncertainty and should inform, not replace, direct monitoring.",
    },
    implementation:
      "Many basins have publicly available forecasting dashboards through state water agencies or universities; for more localized forecasting, work with a hydrologist or extension specialist.",
    whereItFits: "Groundwater-dependent regions and any system planning multi-year water management strategies.",
    benefits: "Low-cost way to improve planning certainty, especially when paired with a conservation plan.",
    costsLimitations:
      "Mostly free or low-cost where public tools exist; custom modeling for a specific operation can be more involved.",
    caseStudies: "District use of aquifer-level forecasting to time voluntary pumping reductions.",
    resourceTypes: ["tools", "extension"],
  },

  "drought-planning": {
    overview:
      "Drought planning means developing a proactive strategy — triggers, response actions, and contingencies — for water shortages before they happen, rather than reacting to each drought as it unfolds.",
    waterOutcomes: {
      primaryPathway: "Improves response time and decision quality during water shortages.",
      secondaryPathways: "Can reduce financial losses by enabling earlier, more deliberate decisions (e.g., destocking, fallowing).",
      scaleOfEffect: "Can be developed at the individual operation or district/regional scale.",
      evidenceConfidence: "Strong. Drought planning is a well-established risk management practice.",
      caveats: "A plan is only as useful as its triggers and follow-through; needs periodic review and updating.",
    },
    implementation:
      "Define specific drought indicators relevant to your operation (e.g., reservoir level, allocation percentage), and pre-decide what actions you'll take at each threshold. Extension offices often provide drought planning templates.",
    whereItFits: "Rangeland, livestock, and any operation in drought-prone regions with variable water supply.",
    benefits: "Low-cost and proactive; reduces decision fatigue and financial risk during actual drought events.",
    costsLimitations: "Primarily a time investment to develop; doesn't reduce water use on its own without paired actions.",
    caseStudies: "Ranch-level drought contingency plans with destocking and supplemental feed triggers.",
    resourceTypes: ["extension", "guides"],
  },

  "soil-moisture-monitoring": {
    overview:
      "Soil moisture monitoring uses in-field sensors to track real-time soil water conditions, allowing irrigation decisions to be based on direct measurement rather than estimation alone.",
    waterOutcomes: {
      primaryPathway: "Improves precision of irrigation timing and depth based on direct soil measurement.",
      secondaryPathways: "Builds soil water storage data over time, supporting longer-term irrigation planning.",
      scaleOfEffect: "Field or zone-level, depending on sensor density.",
      evidenceConfidence: "Strong. Well-documented water savings in irrigated systems.",
      caveats: "Requires sensor placement representative of field conditions and some technical setup.",
    },
    implementation:
      "Install sensors at representative depths and locations across a field or management zone; pair with an app or dashboard for ongoing monitoring. Calibrate readings against known soil types.",
    whereItFits: "Irrigated fields and orchards, particularly with variable soil types or high-value crops.",
    benefits: "Direct, field-specific data improves on generalized scheduling and can catch problems early.",
    costsLimitations: "Moderate upfront hardware cost; some ongoing maintenance and calibration needed.",
    caseStudies: "Orchard operations using sensor networks to fine-tune drip irrigation timing.",
    resourceTypes: ["tools", "guides"],
  },

  "drought-tolerant-crops": {
    overview:
      "Shifting to drought-tolerant or lower-water-use crop varieties reduces an operation's water demand structurally, rather than through changes in irrigation management alone.",
    waterOutcomes: {
      primaryPathway: "Reduces total crop water demand by selecting varieties suited to water-limited conditions.",
      secondaryPathways: "Can reduce heat stress losses and stabilize yields in variable-water years.",
      scaleOfEffect: "Field or operation-wide, depending on how much acreage is converted.",
      evidenceConfidence: "Moderate. Variety performance depends heavily on local soil and climate conditions.",
      caveats: "May involve a transition period, different market dynamics, or new equipment/management needs.",
    },
    implementation:
      "Work with extension or seed suppliers to identify varieties suited to local conditions and trial on a limited area before broader conversion.",
    whereItFits: "Irrigated and rangeland operations facing persistent water constraints or rising input costs.",
    benefits: "Structural reduction in water need; can reduce input costs and stabilize yields under stress.",
    costsLimitations: "Low direct cost, but may involve yield or market trade-offs during transition.",
    caseStudies: "Producer trials comparing yield and water use across conventional and drought-tolerant varieties.",
    resourceTypes: ["extension", "guides"],
  },
};

export const SECTION_DEFAULT_OPEN = {
  overview: true,
  waterOutcomes: true,
  implementation: false,
  whereItFits: false,
  benefits: false,
  costsLimitations: false,
  caseStudies: true,
  resources: true,
};
