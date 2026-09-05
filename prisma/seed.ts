import "dotenv/config";
import { db } from "../lib/db";
import { mondayOf } from "../lib/weeks";
import { subWeeks, getMonth, getYear } from "date-fns";
import type { ArticleInput } from "../lib/types";

const PLACEHOLDER = "/placeholder-briefing.svg";

function weeksAgo(n: number) {
  return mondayOf(subWeeks(new Date(), n));
}

// Real stories reformatted from the admin's own past newsletters
// (Gryphon News Update, Jan 2026 / Bucc Corner News Update, Feb 2026),
// redistributed across a few weeks so the archive view has real content
// to demonstrate. Weeks 8/6/3 are ARCHIVED; week 0 (this week) is PUBLISHED.
const ARTICLES: ArticleInput[] = [
  {
    slug: "singapore-epirus-microwave-weapons-counter-drone",
    title: "Singapore, Epirus Team on Microwave Weapons to Defeat Drones",
    region: "SINGAPORE",
    weekOf: weeksAgo(8),
    summaryP1:
      "Singapore's Defence Science and Technology Agency (DSTA) has signed a memorandum of understanding with U.S. defence tech company Epirus to explore and potentially develop high-power microwave (HPM) weapons as part of efforts to counter advanced unmanned aerial system (UAS) threats, including drones. The collaboration will focus on evaluating microwave systems that use directed electromagnetic energy to disrupt or disable the electronics of hostile drones and drone swarms.",
    summaryP2:
      "The partnership is expected to enhance Singapore's counter-drone capabilities through technology exchange, joint testing, and assessments across varied operational scenarios, including maritime approaches and dense urban terrain. For DSTA, the MOU offers a lower-cost-per-engagement alternative to missile-based interceptors at a time when cheap, mass-produced drones are reshaping the economics of air defence across multiple theatres.",
    didYouKnow:
      "Epirus's flagship technology, the Leonidas high-power microwave system, doesn't destroy targets with explosives. Instead, it emits powerful bursts of electromagnetic energy that disable the electronics inside drones or other threats at range — creating a sort of \"electronic force field\" that can neutralise multiple targets with a single pulse, without traditional kinetic force.",
    perspective:
      "Singapore's Perspective: For the RSAF and the wider SAF, HPM systems address a growing capability gap — cheap commercial and militarised drones can be launched in numbers that make missile-based counter-UAS disproportionately expensive to sustain. A directed-energy layer integrated with Singapore's existing ground-based air defence network would let the SAF engage drone swarms at a fraction of the cost per shot, freeing SAMs for higher-value threats and reducing the logistics burden of magazine depth during prolonged tension.",
    bullets: [
      "DSTA and Epirus signed an MOU to jointly evaluate high-power microwave (HPM) counter-drone weapons.",
      "The tech disables drone electronics with electromagnetic pulses instead of kinetic interceptors.",
      "Leonidas can engage multiple targets simultaneously across a wide area with one pulse.",
      "Programme includes joint testing and assessments across varied operational scenarios.",
      "Offers a lower cost-per-engagement alternative to missile interceptors against drone swarms.",
    ],
    images: [
      { url: "https://thedefensepost.com/wp-content/uploads/2023/01/Epirus_Leonidas.jpg", caption: "The Leonidas high-power microwave system developed by Epirus.", sourceUrl: "https://thedefensepost.com/2026/01/28/singapore-epirus-microwave-drones/" },
    ],
    sources: [
      { name: "The Defense Post", url: "https://thedefensepost.com/2026/01/28/singapore-epirus-microwave-drones/" },
    ],
    reliabilityScore: 1,
  },
  {
    slug: "malaysia-fast-tracks-next-generation-fighter-programme",
    title: "Malaysia Could Fast-Track Next-Generation Fighter Programme",
    region: "MALAYSIA",
    country: "Malaysia",
    weekOf: weeksAgo(8),
    summaryP1:
      "Malaysia is fast-tracking its Next-Generation fighter aircraft procurement under the Royal Malaysian Air Force's (RMAF) Multi-Role Combat Aircraft (MRCA) programme, after ongoing uncertainty and delays in securing ex-Kuwaiti F/A-18 Hornet jets that were intended as a stopgap. The stalled interim deal has prompted concerns about capability shortfalls as older RMAF platforms age, pushing Kuala Lumpur toward strategic discussions on ensuring long-term air defence readiness rather than extending reliance on ageing interim jets.",
    summaryP2:
      "At the same time, Korea Aerospace Industries (KAI) has confirmed an accelerated delivery schedule for Malaysia's FA-50M light combat aircraft, with six of the jets now expected to arrive by the end of 2026 — up from the four originally planned. The stepped-up delivery gives the RMAF an interim boost in operational capacity while larger MRCA decisions are made, and may influence the broader timeline for Malaysia's force modernisation.",
    didYouKnow:
      "The FA-50M light combat aircraft is a highly capable variant of the FA-50 family, featuring an Active Electronically Scanned Array (AESA) radar, modern mission systems, and precision-strike capability that punches well above its light-fighter classification.",
    perspective:
      "Singapore's Perspective: A faster-modernising RMAF narrows the qualitative edge the RSAF has historically relied on in the northern approaches. An accelerated FA-50M fleet plus a longer-term MRCA leap to a genuinely next-generation platform would be a meaningful shift in the regional balance, and is likely being watched closely as an input into Singapore's own fighter roadmap beyond the F-35B.",
    bullets: [
      "RMAF is fast-tracking its MRCA next-generation fighter programme amid stalled ex-Kuwaiti F/A-18 talks.",
      "Concerns are growing over capability shortfalls as Malaysia's older fighter fleet ages.",
      "KAI accelerated FA-50M delivery: six aircraft now expected by end of 2026, up from four.",
      "FA-50M bridges the capability gap short-term while Malaysia weighs long-term MRCA options.",
    ],
    images: [
      { url: PLACEHOLDER, caption: "FIGHTER GROUP INTEL briefing graphic.", sourceUrl: "https://www.asianmilitaryreview.com/2026/01/malaysia-could-fast-track-next-generation-fighter-programme-foc/" },
    ],
    sources: [
      { name: "Asian Military Review", url: "https://www.asianmilitaryreview.com/2026/01/malaysia-could-fast-track-next-generation-fighter-programme-foc/" },
      { name: "Defence Security Asia", url: "https://defencesecurityasia.com/en/kai-fa-50m-delivery-2026-rmaf-malaysia/" },
    ],
    reliabilityScore: 2,
  },
  {
    slug: "why-venezuela-air-defence-failed-caracas-raid",
    title: "Why did Venezuela's Air Defence Fail in US' Caracas Raid?",
    region: "GLOBAL",
    weekOf: weeksAgo(6),
    summaryP1:
      "Venezuela's much-touted air-defence network — built around Russian-made S-300 and Buk systems and Chinese radars — failed to engage or down a single American aircraft during the US raid on Caracas, despite fears it could pose a serious threat. Analysts and US officials report that Venezuelan radar and air-defence assets were rapidly neutralised or never became operational during the opening phases of the assault, with many systems offline, poorly maintained, or simply not connected to their radars at the time of the attack.",
    summaryP2:
      "Beyond technical shortcomings, degraded readiness compounded the failure: poor maintenance, a shortage of spare parts and skilled personnel, and command hesitancy amid political tensions all played a role. US electronic warfare, cyber operations, and suppression-of-enemy-air-defence (SEAD) tactics — including jamming and precision strikes — effectively \"blinded\" Venezuela's sensors and disrupted command-and-control, allowing special operations aviation to fly in with minimal resistance.",
    didYouKnow:
      "The S-300 is a long-range Soviet/Russian-designed surface-to-air missile system regarded as one of the most capable widely-exported air-defence platforms in the world on paper — yet its effectiveness depends entirely on maintenance discipline, integrated radar cueing, and trained crews, none of which Venezuela was able to sustain under pressure.",
    perspective:
      "Singapore's Perspective: The episode is a reminder that a modern integrated air-defence network is only as strong as its maintenance culture, sensor integration and command readiness — hardware alone does not guarantee a credible deterrent. For the SAF, it reinforces the value Singapore places on realistic, high-tempo readiness exercises and tightly integrated C2, rather than treating advertised system specifications as a proxy for actual combat capability.",
    bullets: [
      "Venezuela's S-300/Buk-based air defence failed to engage a single US aircraft during the Caracas raid.",
      "Many systems were offline, poorly maintained, or disconnected from their radars.",
      "US SEAD, jamming and cyber operations blinded Venezuelan sensors and C2 before the strike.",
      "Analysts point to readiness and maintenance failures, not just hardware, as the root cause.",
    ],
    images: [
      { url: "https://www.army-technology.com/wp-content/uploads/sites/3/2026/01/main-image-S-300-430x241.jpg", caption: "An S-300 surface-to-air missile system, of the type operated by Venezuela.", sourceUrl: "https://www.army-technology.com/features/why-did-venezuelas-air-defence-fail-in-us-caracas-raid/" },
    ],
    sources: [
      { name: "Army Technology", url: "https://www.army-technology.com/features/why-did-venezuelas-air-defence-fail-in-us-caracas-raid/" },
    ],
    reliabilityScore: 1,
  },
  {
    slug: "operation-absolute-resolve-caracas",
    title: "Operation Absolute Resolve",
    region: "USA",
    weekOf: weeksAgo(6),
    summaryP1:
      "The airborne component of Operation Absolute Resolve was one of the largest and most complex in recent U.S. history, involving more than 150 aircraft from across the U.S. military. These included fifth-generation fighters like F-22 Raptors and F-35 Lightning IIs for air dominance and stealth operations, F/A-18 Super Hornets, EA-18G Growlers for electronic warfare and radar suppression, E-2D Hawkeyes for airborne early warning, and B-1 bombers for precision strikes, alongside surveillance, refuelling and unmanned systems. Army rotary-wing assets such as MH-60 Black Hawks and MH-47 Chinooks transported special operations forces into Caracas.",
    summaryP2:
      "Analysis of the mission's success was rooted in meticulous planning, joint and interagency integration, and advanced technology rather than sheer force. Months of rehearsal, combined with extensive ISR and electronic warfare capability, allowed U.S. planners to achieve surprise and minimal U.S. casualties despite operating deep in hostile territory. Cyber operations, space and signals intelligence, and non-kinetic effects neutralised Venezuelan defences, while the joint air package dismantled remaining threats in minutes — showcasing how modern multi-domain integration can compress decision cycles against a defended target.",
    didYouKnow:
      "U.S. forces reportedly built an extremely detailed intelligence picture of the target's daily routine ahead of the raid — an illustration of how modern ISR fusion (signals, human and space-based intelligence) can enable a high-risk special operations raid involving more than 150 aircraft to be executed with no reported U.S. fatalities.",
    perspective:
      "Singapore's Perspective: Operation Absolute Resolve is a live case study in what a fully joint, multi-domain strike package looks like when ISR, cyber, electronic warfare and precision strike are fused into one operation. For a small, technologically-focused force like the SAF, the operation underlines the payoff of investing in networked C4ISR and joint integration over raw platform numbers — the same principle behind Singapore's own Third Generation SAF transformation.",
    bullets: [
      "Over 150 U.S. aircraft took part, including F-22s, F-35s, EA-18G Growlers and B-1 bombers.",
      "Army MH-60/MH-47 helicopters inserted special operations forces into Caracas.",
      "Extensive ISR, cyber and electronic warfare neutralised Venezuelan defences ahead of the strike.",
      "The operation achieved surprise with no reported U.S. fatalities despite the high-risk profile.",
      "Analysts credit joint/interagency integration and rehearsal, not just force size, for the outcome.",
    ],
    images: [
      { url: PLACEHOLDER, caption: "FIGHTER GROUP INTEL briefing graphic.", sourceUrl: "https://www.army-technology.com/features/what-us-aircraft-were-used-in-operation-absolute-resolve/" },
    ],
    sources: [
      { name: "Army Technology", url: "https://www.army-technology.com/features/what-us-aircraft-were-used-in-operation-absolute-resolve/" },
      { name: "Modern War Institute", url: "https://mwi.westpoint.edu/mwi-podcast-analyzing-operation-absolute-resolve/" },
    ],
    reliabilityScore: 3,
  },
  {
    slug: "new-drones-buzzing-singapore-rsaf-uas",
    title: "New Drones are Buzzing in Singapore",
    region: "SINGAPORE",
    weekOf: weeksAgo(3),
    summaryP1:
      "The growing role of Unmanned Aerial Systems (UAS) within RSAF operations was highlighted at the Singapore Airshow. A key development was the introduction of the Elbit Systems Hermes 900, a Medium-Altitude Long-Endurance (MALE) UAV that will replace the older Hermes 450 fleet. The RSAF also showcased the smaller Orbiter 4 tactical UAV, alongside continued development by ST Engineering of the Veloce UAV family and other drone concepts.",
    summaryP2:
      "The RSAF is expanding its drone ecosystem with new operational concepts such as the Drone Rapid Operational Integration and Deployment (DROID) unit, alongside plans to train reservists in small-drone operations. Overall, the focus is on scaling Singapore's unmanned capabilities across strategic ISR, tactical surveillance, and future multi-domain operations.",
    didYouKnow:
      "The Elbit Systems Hermes 900 has an endurance of up to roughly 36 hours, allowing it to maintain persistent surveillance over large areas without frequent launches or crew turnover. Powered by a Rotax 914 engine, it can operate hundreds of kilometres from its control station while carrying multiple ISR payloads simultaneously.",
    perspective:
      "How it affects the RSAF: For the RSAF, the Hermes 900's endurance means a single UAV can maintain near-continuous maritime or regional surveillance around Singapore's air and sea confines — a significant improvement in situational awareness over the older Hermes 450 it replaces, and a force multiplier as the DROID unit scales up reservist-operated small-drone capacity.",
    bullets: [
      "RSAF is replacing the Hermes 450 with the longer-endurance Elbit Hermes 900 MALE UAV.",
      "Orbiter 4 tactical UAVs and ST Engineering's Veloce family were also showcased at Singapore Airshow.",
      "New DROID unit integrates drone operations rapidly across RSAF concepts.",
      "RSAF plans to train reservists in small-drone operations to scale capacity.",
      "Hermes 900 offers ~36 hours endurance, operating hundreds of km from its control station.",
    ],
    images: [
      { url: PLACEHOLDER, caption: "FIGHTER GROUP INTEL briefing graphic.", sourceUrl: "https://www.asianmilitaryreview.com/2026/02/new-drones-are-buzzing-in-singapore-foc/" },
    ],
    sources: [
      { name: "Asian Military Review", url: "https://www.asianmilitaryreview.com/2026/02/new-drones-are-buzzing-in-singapore-foc/" },
    ],
    reliabilityScore: 1,
  },
  {
    slug: "indonesia-aircraft-carrier-giuseppe-garibaldi",
    title: "Why Indonesia is Getting an Aircraft Carrier, and How South-East Asia Could Respond",
    region: "INDONESIA",
    country: "Indonesia",
    weekOf: weeksAgo(3),
    summaryP1:
      "Indonesia plans to acquire the Italian aircraft carrier Giuseppe Garibaldi as part of a broader military modernisation effort under President Prabowo Subianto. The carrier, operated by the Italian Navy from 1985 to 2024, is expected to be transferred to Indonesia as a grant and could arrive before the Indonesian Armed Forces anniversary on 5 October. If completed, Indonesia would become the second South-East Asian country after Thailand to operate an aircraft carrier.",
    summaryP2:
      "As the world's largest archipelagic state, with thousands of islands and numerous maritime chokepoints, Indonesia finds a mobile sea-based air platform strategically attractive for patrolling sea lanes, conducting surveillance, and supporting humanitarian or disaster-relief missions. However, questions remain over whether operating and maintaining such a complex platform will strain Indonesia's defence budget and logistics infrastructure, raising the risk it becomes more symbolic than operationally effective without adequate air assets and escort ships.",
    didYouKnow:
      "The Giuseppe Garibaldi is a relatively small STOVL carrier compared to modern supercarriers, originally designed to operate AV-8B Harrier II jump-jets and helicopters — meaning Indonesia would need a credible fixed-wing STOVL air wing (or accept a helicopter-carrier role) to make full use of the flight deck.",
    perspective:
      "How this affects SEA geopolitics and the SAF: An Indonesian carrier, even a modest one, signals a gradual shift in regional maritime capability and prestige. For the SAF, it doesn't change the immediate balance of power, but it reinforces the trend of South-East Asian navies pursuing blue-water, power-projection assets — a factor Singapore's own naval and air planning will continue to track as regional maritime postures evolve.",
    bullets: [
      "Indonesia is set to receive the ex-Italian carrier Giuseppe Garibaldi, reportedly as a grant.",
      "Indonesia would become the second SEA nation after Thailand to operate a carrier.",
      "Archipelagic geography makes a mobile sea-based air platform strategically attractive.",
      "Budget and logistics strain raise doubts over full operational integration.",
      "Signals a broader regional trend toward blue-water power projection in SEA.",
    ],
    images: [
      { url: PLACEHOLDER, caption: "FIGHTER GROUP INTEL briefing graphic.", sourceUrl: "https://www.channelnewsasia.com/asia/indonesia-aircraft-carrier-military-strategic-maritime-5942391" },
    ],
    sources: [
      { name: "Channel News Asia", url: "https://www.channelnewsasia.com/asia/indonesia-aircraft-carrier-military-strategic-maritime-5942391" },
    ],
    reliabilityScore: 1,
  },
  {
    slug: "iran-shahed-136-strait-of-hormuz",
    title: "Iran's Conflict: How a \"Poor Man's Cruise Missile\" is Shaping Tehran's Retaliation and Its Impact on the Strait of Hormuz",
    region: "GLOBAL",
    weekOf: weeksAgo(0),
    summaryP1:
      "Iran's Shahed-136 drones have become a major challenge for U.S./Israeli and Gulf air-defence systems due to their extremely low cost and ability to be deployed in large numbers. These one-way \"kamikaze\" drones are designed to fly long distances and explode on impact with targets such as airbases, ports, or energy infrastructure. A key issue is the cost imbalance in air defence: a Shahed-136 can cost roughly US$20,000–$50,000, while the interceptors used to shoot it down can cost millions of dollars each, forcing defenders to spend far more than the attacker.",
    summaryP2:
      "The increased use of drones and missiles in the Iran conflict has raised serious risks to shipping through the Strait of Hormuz, one of the world's most critical maritime chokepoints. Intelligence indicates attacks on vessels and maritime infrastructure around the strait have already damaged several commercial ships, prompting insurers and shipping companies to reconsider transit routes. As traffic reroutes or slows, global supply chains face disruption, with roughly 20% of the world's oil trade passing through the strait.",
    didYouKnow:
      "The Shahed-136 is a loitering munition designed to loiter over an area before striking a target on impact, carrying an explosive payload of 30–50kg. It can be launched from mobile ground launchers, trucks, or coastal sites, letting Iran target ships, ports, or offshore energy facilities without deploying large naval forces — and even limited strikes or the mere threat of drone attacks can push shipping insurers to raise premiums.",
    perspective:
      "Singapore's Perspective: The Strait of Hormuz disruption is a stark reminder of how a single maritime chokepoint incident ripples through global energy and shipping markets — a dynamic Singapore, as a major transhipment and bunkering hub, watches closely. It also underscores for the SAF the strategic value of low-cost loitering munitions and mass drone tactics, reinforcing the case for layered, cost-efficient counter-UAS defences (such as directed-energy weapons) rather than relying solely on expensive interceptors.",
    bullets: [
      "Iran's Shahed-136 loitering munitions are cheap (US$20k-50k) versus multi-million-dollar interceptors.",
      "Drone swarms exploit this cost asymmetry to overwhelm layered air defences.",
      "Attacks near the Strait of Hormuz have damaged commercial vessels and disrupted shipping routes.",
      "About 20% of world oil trade transits the strait, so disruption has global economic impact.",
      "Iran can launch strikes from mobile, low-signature platforms without large naval forces.",
    ],
    images: [
      { url: PLACEHOLDER, caption: "FIGHTER GROUP INTEL briefing graphic.", sourceUrl: "https://www.janes.com/osint-insights/defence-and-national-security-analysis/iran-conflict-2026-disruption-to-strait-of-hormuz-increases-energy-and-food-production-risks" },
    ],
    sources: [
      { name: "CNBC", url: "https://www.cnbc.com/2026/03/05/iran-shahed-136-drone-cost-air-defense-gulf-war-us-israel-gulf-scorpion-strike-centcom.html" },
      { name: "JANES", url: "https://www.janes.com/osint-insights/defence-and-national-security-analysis/iran-conflict-2026-disruption-to-strait-of-hormuz-increases-energy-and-food-production-risks" },
    ],
    reliabilityScore: 2,
  },
  {
    slug: "operation-epic-fury-iran",
    title: "Operation Epic Fury",
    region: "USA",
    weekOf: weeksAgo(0),
    summaryP1:
      "Operation Epic Fury began on 28 February 2026 when the United States, in coordination with Israel, launched a large-scale military campaign targeting Iran's military infrastructure and strategic capabilities. Directed by the U.S. President and executed by United States Central Command (CENTCOM), the operation focused on dismantling Iran's security apparatus, including ballistic missile launch sites, military command centres, naval assets, and missile production facilities. The opening phase involved a synchronised strike package of more than 100 aircraft, cruise missiles, drones, and naval assets, including stealth bombers and carrier-based fighters operating across the CENTCOM area of responsibility.",
    summaryP2:
      "During the first several days of the campaign, U.S. forces reportedly struck over 1,700 targets across Iran, degrading its missile network, command infrastructure, and naval forces. The operation employed a wide range of capabilities, including B-1 and B-2 bombers, carrier aviation, Tomahawk cruise missiles, and air-defence systems like Patriot and THAAD to support both offensive and defensive operations — part of a broader regional conflict in which the U.S. and Israel aim to prevent Iran from developing nuclear weapons and reduce its offensive strike capability, while Iran has responded with missile and drone attacks against regional U.S. bases and allied states in the Gulf.",
    didYouKnow:
      "The strike package integrated stealth bombers, carrier aviation and long-range cruise missiles with layered missile defence (Patriot/THAAD) operating simultaneously in offensive and defensive roles — a rare real-world demonstration of a fully integrated joint air, missile-defence and naval campaign at this scale.",
    perspective:
      "USA's Perspective: Officials describe the mission as \"laser-focused\" on destroying missile systems, naval assets and military infrastructure linked to Iran's ability to threaten regional allies and shipping routes, while preventing Iran from developing nuclear weapons.\n\nIsrael's Perspective: The operation is viewed as a critical effort to eliminate what it considers an existential threat — Iran's ballistic missile arsenal, nuclear ambitions and support for proxy groups such as Hezbollah — with Israeli forces conducting large-scale airstrikes and cyber operations alongside the U.S.\n\nIran's Perspective: Iran views the strikes as a direct act of aggression and a violation of its sovereignty, accusing the United States and Israel of escalating the conflict, and has retaliated with ballistic missile and drone strikes against U.S. bases and allied targets across the Gulf, raising fears of a wider regional war.\n\nSingapore's Perspective: The conflict highlights the vulnerability of energy and shipping routes far from South-East Asia to a conflict that is nonetheless keenly felt at home — via oil prices, insurance costs and shipping schedules through the Strait of Hormuz. For the SAF, Epic Fury is a live demonstration of a fully integrated multi-domain campaign (stealth strike, cyber, layered missile defence and naval airpower operating together), reinforcing the value Singapore places on interoperability with key partners and on maintaining credible, integrated air and missile defence at home.",
    bullets: [
      "Operation Epic Fury: US-Israel campaign against Iran's military infrastructure began 28 Feb 2026.",
      "Over 100 aircraft, cruise missiles, drones and naval assets in the opening strike package.",
      "More than 1,700 targets struck in the first days, degrading Iran's missile and naval forces.",
      "Patriot/THAAD layered missile defence operated alongside the offensive campaign.",
      "Iran retaliated with missile/drone strikes on US and allied Gulf bases, raising wider-war fears.",
    ],
    images: [
      { url: PLACEHOLDER, caption: "FIGHTER GROUP INTEL briefing graphic.", sourceUrl: "https://www.centcom.mil/MEDIA/PRESS-RELEASES/Press-Release-View/Article/4418396/us-forces-launch-operation-epic-fury/" },
    ],
    sources: [
      { name: "CENTCOM", url: "https://www.centcom.mil/MEDIA/PRESS-RELEASES/Press-Release-View/Article/4418396/us-forces-launch-operation-epic-fury/" },
      { name: "NY Post", url: "https://nypost.com/2026/02/28/us-news/us-officials-reveal-the-urgency-behind-operation-epic-fury-attack-on-iran/" },
    ],
    reliabilityScore: 2,
  },
];

const DIGEST_SUMMARY_THIS_WEEK =
  "This week: Iran's cheap Shahed-136 drones keep pressuring Gulf air defences and Strait of Hormuz shipping, while Operation Epic Fury's opening days show what a fully integrated US-Israel strike campaign against Iran looks like — both carrying real knock-on implications for Singapore's energy security and the SAF's own integrated air/missile-defence posture.";

async function main() {
  console.log("Seeding regions...");
  for (const region of ["SINGAPORE", "SEA", "GLOBAL", "USA", "MALAYSIA", "INDONESIA"] as const) {
    await db.regionSetting.upsert({
      where: { region },
      update: {},
      create: { region, enabled: true },
    });
  }

  console.log("Seeding articles...");
  const currentWeek = weeksAgo(0);
  const publishedIds: string[] = [];

  for (const a of ARTICLES) {
    const isCurrentWeek = a.weekOf.getTime() === currentWeek.getTime();
    const article = await db.article.upsert({
      where: { slug: a.slug },
      update: {},
      create: {
        slug: a.slug,
        title: a.title,
        region: a.region,
        country: a.country,
        status: isCurrentWeek ? "PUBLISHED" : "ARCHIVED",
        summaryP1: a.summaryP1,
        summaryP2: a.summaryP2,
        didYouKnow: a.didYouKnow,
        perspective: a.perspective,
        bullets: JSON.stringify(a.bullets),
        images: JSON.stringify(a.images),
        sources: JSON.stringify(a.sources),
        reliabilityScore: a.reliabilityScore,
        weekOf: a.weekOf,
        month: getMonth(a.weekOf) + 1,
        year: getYear(a.weekOf),
        createdBy: "admin",
        publishedAt: new Date(),
      },
    });
    if (isCurrentWeek) publishedIds.push(article.id);
  }

  console.log("Seeding this week's digest...");
  await db.weeklyDigest.upsert({
    where: { weekOf: currentWeek },
    update: { summaryText: DIGEST_SUMMARY_THIS_WEEK, articleIds: JSON.stringify(publishedIds) },
    create: {
      weekOf: currentWeek,
      summaryText: DIGEST_SUMMARY_THIS_WEEK,
      articleIds: JSON.stringify(publishedIds),
    },
  });

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
