/* ================================================
   PrayanGuide — Conversational Trip Planner
   State-machine chatbot with trip planning flow
   ================================================ */

(function () {
  'use strict';

  // ---- DOM References ----
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const pills = document.querySelectorAll('.suggestion-pill');
  const suggestedQuestions = document.getElementById('suggestedQuestions');

  // ---- Trip Planning State ----
  let tripState = {
    step: 'idle',         // idle | ask_city | ask_budget | ask_days | ask_type | suggest_dest | ask_itinerary | show_itinerary | ask_hotel | show_hotel | ask_transport | show_transport | complete
    city: '',
    budget: 0,
    days: 0,
    people: 0,
    type: '',
    destination: '',
    hotelTier: '',
    crowdPref: ''
  };

  function resetTrip() {
    tripState = {
      step: 'idle', city: '', budget: 0, days: 0, people: 0,
      type: '', destination: '', hotelTier: '', crowdPref: ''
    };
  }

  // ── Destinations Database ──
  const destinations = {
    manali: {
      name: 'Manali',
      tags: ['mountain', 'adventure', 'snow'],
      crowded: true,
      weather: 'Pleasant in March, 5–15°C. Snow may be seen at higher altitudes.',
      description: 'Popular hill station in Himachal Pradesh known for adventure sports, Rohtang Pass, and Solang Valley.',
      itinerary: {
        5: [
          { day: 1, title: 'Arrival & Mall Road', details: 'Arrive in Manali, check-in. Evening stroll at Mall Road & explore Old Manali cafes.' },
          { day: 2, title: 'Solang Valley Adventure', details: 'Full day at Solang Valley — paragliding, zorbing, zip-lining. Enjoy snow activities.' },
          { day: 3, title: 'Rohtang Pass Excursion', details: 'Day trip to Rohtang Pass (subject to permit). Stunning mountain views and snow play.' },
          { day: 4, title: 'Kullu Rafting & Temples', details: 'River rafting on Beas River in Kullu. Visit Hadimba Temple & Vashisht Hot Springs.' },
          { day: 5, title: 'Departure', details: 'Last-minute shopping for Kullu shawls. Departure.' }
        ]
      },
      cost: {
        stay: 9000, travel: 10000, activities: 7000, buffer: 2000
      },
      hotels: {
        budget: [
          { name: 'Zostel Manali', price: '₹600/night', rating: '4.2★', desc: 'Popular backpacker hostel with valley views' },
          { name: 'Hotel River View', price: '₹1,200/night', rating: '3.9★', desc: 'Cozy rooms near Mall Road' }
        ],
        midrange: [
          { name: 'The Orchard Greens', price: '₹2,500/night', rating: '4.4★', desc: 'Beautiful orchard setting with mountain views' },
          { name: 'Snow Valley Resorts', price: '₹3,000/night', rating: '4.3★', desc: 'Modern rooms with valley-facing balcony' },
          { name: 'Hotel Beas View', price: '₹2,200/night', rating: '4.1★', desc: 'Riverside location, complimentary breakfast' }
        ],
        premium: [
          { name: 'The Himalayan', price: '₹7,500/night', rating: '4.7★', desc: 'Luxury resort with spa & heated pool' },
          { name: 'Manu Allaya', price: '₹8,000/night', rating: '4.6★', desc: 'Heritage luxury with panoramic views' }
        ]
      },
      transport: {
        fromBangalore: [
          { mode: 'Flight to Kullu + Taxi', cost: '₹7,500/person', duration: '4h flight + 1.5h taxi', details: 'Fly BLR → Kullu Bhuntar Airport, then taxi to Manali. Fastest option.' },
          { mode: 'Flight to Delhi + Bus', cost: '₹4,500/person', duration: '3h flight + 12h bus', details: 'Fly to Delhi, then Volvo bus from ISBT Kashmere Gate to Manali.' },
          { mode: 'Train to Delhi + Bus', cost: '₹3,200/person', duration: '34h train + 12h bus', details: 'Train BLR → NDLS (Rajdhani), then Volvo bus to Manali. Most economical.' }
        ]
      }
    },
    munnar: {
      name: 'Munnar',
      tags: ['mountain', 'nature', 'tea', 'trekking'],
      crowded: false,
      weather: 'Comfortable in March, 15–25°C. Clear skies, ideal for trekking.',
      description: 'Stunning hill station in Kerala famous for tea plantations, misty mountains, and wildlife.',
      itinerary: {
        5: [
          { day: 1, title: 'Arrival & Tea Garden Visit', details: 'Arrive in Munnar. Visit Kanan Devan Tea Plantation & Tea Museum. Evening walk through spice gardens.' },
          { day: 2, title: 'Eravikulam National Park & Mattupetty Dam', details: 'Morning visit to Eravikulam National Park (spot Nilgiri Tahr). Afternoon at Mattupetty Dam for boating & Echo Point.' },
          { day: 3, title: 'Trekking & Adventure Activities', details: 'Full-day trek through Meesapulimala or Anamudi Peak. Options for mountain biking, rappelling, and rock climbing.' },
          { day: 4, title: 'Top Station & Echo Point', details: 'Drive to Top Station for panoramic views of Western Ghats. Visit Kundala Lake, flower garden & Photo Point.' },
          { day: 5, title: 'Local Shopping & Departure', details: 'Shop for authentic Munnar tea, spices, and homemade chocolates. Departure.' }
        ]
      },
      cost: {
        stay: 8000, travel: 9000, activities: 6000, buffer: 2000
      },
      hotels: {
        budget: [
          { name: 'Hostel by the Lake', price: '₹500/night', rating: '4.0★', desc: 'Lakeside hostel with common kitchen' },
          { name: 'Green View Inn', price: '₹1,000/night', rating: '3.8★', desc: 'Basic comfortable rooms in town center' }
        ],
        midrange: [
          { name: 'Tea Valley Resort', price: '₹2,200/night', rating: '4.5★', desc: 'Nestled among tea gardens with stunning views' },
          { name: 'Misty Mountain Resort', price: '₹2,800/night', rating: '4.4★', desc: 'Modern amenities, mountain-facing rooms' },
          { name: 'Windermere Estate', price: '₹2,500/night', rating: '4.3★', desc: 'Plantation bungalow with heritage charm' }
        ],
        premium: [
          { name: 'Spice Tree Munnar', price: '₹9,000/night', rating: '4.8★', desc: 'Ultra-luxury treehouse experience' },
          { name: 'Fragrant Nature', price: '₹6,500/night', rating: '4.6★', desc: 'Premium resort with infinity pool' }
        ]
      },
      transport: {
        fromBangalore: [
          { mode: 'Flight to Kochi + Taxi', cost: '₹4,500/person', duration: '1h flight + 4h taxi', details: 'Fly BLR → Cochin International Airport, then taxi/cab to Munnar.' },
          { mode: 'Bus (Direct Sleeper)', cost: '₹1,800/person', duration: '10–11h', details: 'KSRTC or private Volvo sleeper bus from Bangalore to Munnar. Overnight journey.' },
          { mode: 'Train to Aluva + Taxi', cost: '₹3,500/person (round trip)', duration: '11h train + 3.5h taxi', details: 'Train BLR → Aluva/Ernakulam, then shared/private taxi to Munnar. Most economical option.' }
        ]
      }
    },
    coorg: {
      name: 'Coorg (Kodagu)',
      tags: ['mountain', 'nature', 'coffee', 'adventure'],
      crowded: false,
      weather: 'Warm and pleasant in March, 18–28°C. Great for outdoor activities.',
      description: 'The Scotland of India — known for coffee plantations, misty hills, and adventure treks.',
      itinerary: {
        5: [
          { day: 1, title: 'Arrival & Abbey Falls', details: 'Arrive in Coorg/Madikeri. Visit Abbey Falls, enjoy a coffee plantation tour.' },
          { day: 2, title: 'Dubare Elephant Camp & Rafting', details: 'Morning at Dubare Elephant Camp (bathing & feeding elephants). Afternoon river rafting on Cauvery.' },
          { day: 3, title: 'Tadiandamol Trek', details: 'Full-day trek to Tadiandamol, the highest peak in Coorg (1,748m). Stunning views of rolling hills.' },
          { day: 4, title: 'Namdroling Monastery & Raja Seat', details: 'Visit the Golden Temple (Namdroling Monastery) in Bylakuppe. Evening sunset at Raja Seat.' },
          { day: 5, title: 'Shopping & Departure', details: 'Buy Coorg coffee, honey, spices, and handmade wines. Departure.' }
        ]
      },
      cost: {
        stay: 7000, travel: 5000, activities: 5000, buffer: 2000
      },
      hotels: {
        budget: [
          { name: 'Coorg Backpackers', price: '₹600/night', rating: '4.1★', desc: 'Dorm-style with rooftop views' },
          { name: 'Misty Woods Homestay', price: '₹1,200/night', rating: '4.0★', desc: 'Homely feel with local cuisine' }
        ],
        midrange: [
          { name: 'Amanvana Spa Resort', price: '₹3,500/night', rating: '4.5★', desc: 'Riverside resort with spa facilities' },
          { name: 'The Tamara Coorg', price: '₹3,000/night', rating: '4.4★', desc: 'Luxury plantation stay, jungle cottages' },
          { name: 'Heritage Resort', price: '₹2,800/night', rating: '4.3★', desc: 'Colonial-style bungalow in coffee estate' }
        ],
        premium: [
          { name: 'Evolve Back (Orange County)', price: '₹12,000/night', rating: '4.9★', desc: 'World-class luxury amidst coffee plantations' },
          { name: 'Taj Madikeri Resort', price: '₹10,000/night', rating: '4.7★', desc: 'Premium resort with panoramic valley views' }
        ]
      },
      transport: {
        fromBangalore: [
          { mode: 'Self-Drive / Cab', cost: '₹3,000/person (round trip)', duration: '5–6h drive', details: 'Drive or hire a cab from Bangalore to Coorg via Mysore Road. Scenic route!' },
          { mode: 'KSRTC Bus + Local Taxi', cost: '₹1,200/person', duration: '6–7h', details: 'KSRTC bus Bangalore → Madikeri, then local auto/taxi to resort.' },
          { mode: 'Train to Mysore + Taxi', cost: '₹1,800/person', duration: '3h train + 3h taxi', details: 'Train BLR → Mysore Junction, then taxi to Coorg. Comfortable option.' }
        ]
      }
    },
    ooty: {
      name: 'Ooty',
      tags: ['mountain', 'nature', 'heritage'],
      crowded: true,
      weather: 'Cool in March, 10–20°C. Clear skies, ideal for sightseeing.',
      description: 'Queen of Hill Stations in Tamil Nadu, famous for Nilgiri Mountain Railway and botanical gardens.',
      itinerary: {
        5: [
          { day: 1, title: 'Arrival & Botanical Garden', details: 'Arrive in Ooty. Visit the Government Botanical Garden and Ooty Lake.' },
          { day: 2, title: 'Nilgiri Mountain Railway & Doddabetta', details: 'Ride the UNESCO heritage toy train. Visit Doddabetta Peak, the highest point in Nilgiris.' },
          { day: 3, title: 'Pykara Lake & Waterfalls', details: 'Visit Pykara Lake for boating, Pykara Falls, and Pine Forest.' },
          { day: 4, title: 'Coonoor & Tea Factory', details: 'Day trip to Coonoor — Sim Park, Dolphin Nose viewpoint, and tea factory visit.' },
          { day: 5, title: 'Shopping & Departure', details: 'Shop for homemade chocolates, essential oils, and Nilgiri tea. Departure.' }
        ]
      },
      cost: {
        stay: 7500, travel: 6000, activities: 5500, buffer: 2000
      },
      hotels: {
        budget: [
          { name: 'YoYo Backpackers', price: '₹500/night', rating: '3.9★', desc: 'Budget hostel near bus stand' },
          { name: 'Hotel Lakeview', price: '₹1,100/night', rating: '3.8★', desc: 'Lake-facing basic rooms' }
        ],
        midrange: [
          { name: 'Sterling Ooty Fern Hill', price: '₹2,500/night', rating: '4.3★', desc: 'Heritage property with colonial charm' },
          { name: 'Club Mahindra Derby Green', price: '₹2,800/night', rating: '4.2★', desc: 'Modern resort with family amenities' },
          { name: 'The Monarch Ooty', price: '₹2,200/night', rating: '4.1★', desc: 'Centrally located with garden views' }
        ],
        premium: [
          { name: 'Savoy – IHCL', price: '₹8,000/night', rating: '4.7★', desc: 'Historic luxury with old-world elegance' },
          { name: 'Gem Park Ooty', price: '₹6,000/night', rating: '4.5★', desc: 'Premium hilltop resort' }
        ]
      },
      transport: {
        fromBangalore: [
          { mode: 'Bus (KSRTC/Private)', cost: '₹1,500/person', duration: '7–8h', details: 'Direct bus Bangalore → Ooty via Mysore and Bandipur.' },
          { mode: 'Train to Mysore + Toy Train', cost: '₹1,200/person', duration: '3h + 5h', details: 'Train to Mysore, then bus to Mettupalayam, then the heritage Nilgiri Mountain Railway!' },
          { mode: 'Self-Drive / Cab', cost: '₹2,500/person', duration: '6–7h', details: 'Scenic drive through Bandipur Tiger Reserve.' }
        ]
      }
    },
    wayanad: {
      name: 'Wayanad',
      tags: ['mountain', 'adventure', 'nature', 'wildlife'],
      crowded: false,
      weather: 'Warm in March, 20–30°C. Great for trekking and wildlife.',
      description: 'Lush green district in Kerala known for waterfalls, caves, trekking, and wildlife sanctuaries.',
      itinerary: {
        5: [
          { day: 1, title: 'Arrival & Banasura Dam', details: 'Arrive in Wayanad. Visit Banasura Sagar Dam — India\'s largest earth dam. Speed boating available.' },
          { day: 2, title: 'Edakkal Caves & Zipline', details: 'Trek to Edakkal Caves (ancient petroglyphs). Try zipline adventures at Soochipara.' },
          { day: 3, title: 'Chembra Peak Trek', details: 'Full-day trek to Chembra Peak via the heart-shaped lake. Stunning panoramic views.' },
          { day: 4, title: 'Wildlife Safari & Waterfalls', details: 'Wayanad Wildlife Sanctuary jeep safari. Visit Meenmutty and Soochipara waterfalls.' },
          { day: 5, title: 'Bamboo Rafting & Departure', details: 'Bamboo rafting at Kuruva Island. Shopping and departure.' }
        ]
      },
      cost: {
        stay: 7000, travel: 7000, activities: 5500, buffer: 2000
      },
      hotels: {
        budget: [
          { name: 'Jungle Treehouse', price: '₹800/night', rating: '4.2★', desc: 'Treehouse stay in the forest' },
          { name: 'Wayanad Blooms', price: '₹1,100/night', rating: '3.9★', desc: 'Cozy homestay with local food' }
        ],
        midrange: [
          { name: 'Vythiri Resort', price: '₹3,200/night', rating: '4.5★', desc: 'Treehouse and pool villa options' },
          { name: 'Edakkal Hermitage', price: '₹2,500/night', rating: '4.3★', desc: 'Plantation stay near Edakkal Caves' },
          { name: 'Wayanad Silver Woods', price: '₹2,800/night', rating: '4.2★', desc: 'Eco-resort with nature trails' }
        ],
        premium: [
          { name: 'CGH Earth Lakkidi', price: '₹7,500/night', rating: '4.6★', desc: 'Eco-luxury in coffee plantation' },
          { name: 'Wayanad Wild', price: '₹6,000/night', rating: '4.5★', desc: 'Luxury safari-style lodge' }
        ]
      },
      transport: {
        fromBangalore: [
          { mode: 'Bus (Overnight Sleeper)', cost: '₹1,500/person', duration: '7–8h', details: 'KSRTC or private bus Bangalore → Kalpetta (Wayanad). Overnight journey.' },
          { mode: 'Self-Drive / Cab', cost: '₹2,800/person', duration: '6–7h', details: 'Scenic drive via Mysore–Gundlupet–Sultan Bathery route.' },
          { mode: 'Train to Kozhikode + Taxi', cost: '₹2,200/person', duration: '8h train + 2.5h taxi', details: 'Train to Kozhikode, then taxi to Wayanad. Comfortable mix.' }
        ]
      }
    }
  };

  // ── Recommendation Engine ──
  function getRecommendations(city, budget, days, type) {
    let matches = [];
    const typeTokens = type.toLowerCase().split(/[\s,&+]+/);

    for (const [key, dest] of Object.entries(destinations)) {
      let score = 0;
      // Tag matching
      for (const token of typeTokens) {
        if (dest.tags.some(t => t.includes(token) || token.includes(t))) score += 3;
      }
      // Budget fit (per person total cost)
      const totalCost = dest.cost.stay + dest.cost.travel + dest.cost.activities + dest.cost.buffer;
      if (totalCost <= budget) score += 2;
      else if (totalCost <= budget * 1.2) score += 1;

      // Itinerary available for requested days
      if (dest.itinerary[days]) score += 1;

      if (score > 0) matches.push({ key, dest, score });
    }
    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, 3);
  }

  function getCheapestTransport(dest) {
    const options = dest.transport.fromBangalore;
    if (!options || options.length === 0) return null;
    // Parse cost to compare
    const parsed = options.map(o => {
      const num = parseInt(o.cost.replace(/[^\d]/g, ''));
      return { ...o, numCost: num };
    });
    parsed.sort((a, b) => a.numCost - b.numCost);
    return parsed[0];
  }

  // ---- Knowledge Base (FAQ — kept from original) ----
  const KB = {
    welcome: `<h3>Welcome to Prayana! 🌍✈️</h3>
<p>I'm <strong>PrayanGuide</strong>, your AI travel assistant from <strong>Prayana Travels Pvt. Ltd.</strong></p>
<p>I can help you:</p>
<ul>
  <li>🗺️ <strong>Plan a trip</strong> — step by step</li>
  <li>📦 Browse travel packages</li>
  <li>📋 Get itineraries, hotel & transport options</li>
  <li>🛂 Visa & insurance assistance</li>
</ul>
<p>Tap <strong>"Plan a Trip"</strong> or just type to get started!</p>`,

    services: `<h3>Services Offered by Prayana Travels</h3>
<ul>
  <li>🗺️ Domestic Tour Packages (India)</li>
  <li>🌏 International Tour Packages</li>
  <li>💑 Honeymoon Packages</li>
  <li>🎓 Student Budget Trips</li>
  <li>🏢 Corporate Travel Management</li>
  <li>✈️ Flight Booking</li>
  <li>🏨 Hotel Booking</li>
  <li>🛂 Visa Assistance</li>
  <li>🛡️ Travel Insurance</li>
  <li>📋 Customized Itinerary Planning</li>
</ul>
<p>Need details on any of these? Just ask!</p>`,

    budgetPackages: `<h3>Best Budget Travel Packages</h3>
<div class="package-card">
  <h4>🎒 Student Backpacking Himachal</h4>
  <p><strong>Price:</strong> ₹5,499 · <strong>Duration:</strong> 4D / 3N</p>
  <p><strong>Includes:</strong> Stay, meals, transport, guided treks</p>
</div>
<div class="package-card">
  <h4>🏖️ Goa Weekend Trip</h4>
  <p><strong>Price:</strong> ₹6,999 · <strong>Duration:</strong> 3D / 2N</p>
  <p><strong>Includes:</strong> Hotel, breakfast, sightseeing, transfers</p>
</div>
<div class="package-card">
  <h4>⛰️ Manali Adventure</h4>
  <p><strong>Price:</strong> ₹9,999 · <strong>Duration:</strong> 5D / 4N</p>
  <p><strong>Includes:</strong> Camping, adventure sports, meals, transport</p>
</div>`,

    booking: `<h3>How to Book a Trip with Prayana</h3>
<ol>
  <li><strong>Choose a Package</strong> — Browse or ask me for suggestions</li>
  <li><strong>Customize</strong> — We'll tailor itinerary for you</li>
  <li><strong>Confirm & Pay</strong> — Simple online payment</li>
  <li><strong>Get Itinerary</strong> — Detailed plan via email</li>
  <li><strong>Travel!</strong> — Stress-free trip with 24/7 support</li>
</ol>
<p>📞 <strong>+91 98765 43210</strong> · ✉️ <strong>support@prayanatravels.com</strong></p>`,

    refund: `<h3>Refund & Cancellation Policy</h3>
<ul>
  <li>✅ <strong>Free cancellation</strong> within 48 hours of booking</li>
  <li>⚠️ <strong>50% refund</strong> if cancelled before 7 days of departure</li>
  <li>❌ <strong>No refund</strong> within 48 hours of departure</li>
</ul>
<p>Email <strong>support@prayanatravels.com</strong> or call <strong>+91 98765 43210</strong>.</p>`,

    contact: `<h3>Contact Prayana Travels</h3>
<ul>
  <li>✉️ <strong>Email:</strong> support@prayanatravels.com</li>
  <li>📞 <strong>Phone:</strong> +91 98765 43210</li>
  <li>🌐 <strong>Website:</strong> www.prayanatravels.com</li>
</ul>
<p>Our team is available <strong>24/7</strong> to assist you.</p>`,

    about: `<h3>About Prayana Travels</h3>
<p><strong>Prayana Travels Pvt. Ltd.</strong> was founded in <strong>2024</strong>, headquartered in <strong>Mumbai, India</strong>.</p>
<p><strong>Vision:</strong> To make travel affordable, accessible, and stress-free for everyone.</p>
<ul>
  <li>Affordable and premium travel packages</li>
  <li>AI-powered personalized travel planning</li>
  <li>24/7 intelligent customer support</li>
  <li>Transparent pricing, no hidden fees</li>
</ul>`,

    visa: `<h3>Visa Assistance</h3>
<p>Prayana offers <strong>complete visa assistance</strong> for international travel:</p>
<ul>
  <li>Document checklist & verification</li>
  <li>Application form guidance</li>
  <li>Embassy appointment scheduling</li>
  <li>Travel insurance bundling</li>
</ul>
<p>Tell me your destination country to get started!</p>`,

    insurance: `<h3>Travel Insurance</h3>
<p>All international packages include <strong>basic travel insurance</strong>. We also offer:</p>
<ul>
  <li>Trip cancellation coverage</li>
  <li>Medical emergency coverage</li>
  <li>Lost baggage protection</li>
  <li>Flight delay compensation</li>
</ul>`,

    fallback: `<p>I'm not sure I understood that. 🤔</p>
<p>I can help you <strong>plan a trip</strong>, browse <strong>packages</strong>, or answer questions about <strong>bookings, visas, and policies</strong>.</p>
<p>Try typing <strong>"Plan a trip"</strong> to get started!</p>`,

    greeting: `<p>Hello! 😊 I'm <strong>PrayanGuide</strong>, your travel assistant.</p>
<p>How can I help you today? You can:</p>
<ul>
  <li>🗺️ Say <strong>"Plan a trip"</strong> to start planning</li>
  <li>📦 Ask about travel packages</li>
  <li>❓ Ask any travel question</li>
</ul>`
  };

  // ---- Intent Matching (for non-trip-planning queries) ----
  function getResponse(input) {
    const q = input.toLowerCase().trim();

    // Trip planning trigger
    if (/\b(plan|planning)\b.*\b(trip|travel|vacation|holiday)\b/.test(q) ||
      /\btrip\b.*\b(plan|planner)\b/.test(q) ||
      /\bi want to (travel|go|visit|plan)\b/.test(q) ||
      /\bplan a trip\b/.test(q) ||
      /\bhelp me plan\b/.test(q)) {
      startTripPlanning();
      return null; // handled by flow
    }

    if (/\bservices?\b/.test(q) || /\bwhat.*(offer|provide)\b/.test(q)) return KB.services;
    if (/\bbudget\b/.test(q) || /\bcheap\b.*\b(package|trip)\b/.test(q) || /\baffordable\b/.test(q)) return KB.budgetPackages;
    if (/\bbook(ing)?\b/.test(q) || /\bhow.*(book|reserve)\b/.test(q)) return KB.booking;
    if (/\brefund\b/.test(q) || /\bcancel(lation)?\b/.test(q)) return KB.refund;
    if (/\bcontact\b/.test(q) || /\bphone\b/.test(q) || /\bemail\b/.test(q) || /\bsupport\b/.test(q)) return KB.contact;
    if (/\babout\b/.test(q) || /\bwho.*(prayana|you)\b/.test(q) || /\bcompany\b/.test(q)) return KB.about;
    if (/\bvisa\b/.test(q)) return KB.visa;
    if (/\binsurance\b/.test(q)) return KB.insurance;
    if (/^(hi|hello|hey|hola|namaste|good\s?(morning|afternoon|evening))\b/i.test(q)) return KB.greeting;
    if (/\b(thank|thanks|thx)\b/i.test(q)) return `<p>You're welcome! 😊 Feel free to ask anything else about Prayana Travel services.</p>`;

    return KB.fallback;
  }

  // ── Trip Planning Conversational Flow ──
  function startTripPlanning() {
    resetTrip();
    tripState.step = 'ask_city';
    const msg = `<h3>Let's Plan Your Trip! 🗺️✨</h3>
<p>That sounds exciting! I'll guide you step by step.</p>
<p><strong>What is your departure city?</strong></p>`;
    appendMessage(msg, 'bot');
  }

  function handleTripStep(input) {
    const q = input.toLowerCase().trim();

    switch (tripState.step) {
      case 'ask_city':
        tripState.city = input.trim();
        tripState.step = 'ask_budget';
        return `<p>Great! Traveling from <strong>${escapeHtml(tripState.city)}</strong>. 📍</p>
<p><strong>What is your approximate budget per person?</strong> (in ₹)</p>
<p class="hint-text">Example: 15000, 25000, 50000</p>`;

      case 'ask_budget':
        const budgetNum = parseInt(q.replace(/[^\d]/g, ''));
        if (!budgetNum || budgetNum < 1000) {
          return `<p>Please enter a valid budget amount in ₹ (e.g., <strong>25000</strong>).</p>`;
        }
        tripState.budget = budgetNum;
        tripState.step = 'ask_days';
        return `<p>Budget: <strong>₹${tripState.budget.toLocaleString('en-IN')}</strong> per person 💰</p>
<p><strong>How many days are you planning, and how many people are traveling?</strong></p>
<p class="hint-text">Example: "5 days, 2 people"</p>`;

      case 'ask_days': {
        const dayMatch = q.match(/(\d+)\s*day/);
        const peopleMatch = q.match(/(\d+)\s*(people|person|pax|traveler)/);
        if (!dayMatch) {
          return `<p>Please mention the number of days (e.g., <strong>"5 days, 2 people"</strong>).</p>`;
        }
        tripState.days = parseInt(dayMatch[1]);
        tripState.people = peopleMatch ? parseInt(peopleMatch[1]) : 1;
        tripState.step = 'ask_type';

        return `<p>Got it! <strong>${tripState.days} days</strong>, <strong>${tripState.people} ${tripState.people > 1 ? 'people' : 'person'}</strong>. 👥</p>
<p><strong>What type of experience are you looking for?</strong></p>
<div class="option-buttons" id="typeOptions">
  <button class="option-btn" data-value="beach">🏖️ Relaxing Beach</button>
  <button class="option-btn" data-value="mountain">🏔️ Mountain & Nature</button>
  <button class="option-btn" data-value="adventure">🧗 Adventure Activities</button>
  <button class="option-btn" data-value="cultural">🏛️ Cultural / Heritage</button>
  <button class="option-btn" data-value="mountain adventure">⛰️🧗 Mountain + Adventure</button>
</div>`;
      }

      case 'ask_type': {
        tripState.type = input.trim();
        tripState.step = 'suggest_dest';

        const recs = getRecommendations(tripState.city, tripState.budget, tripState.days, tripState.type);
        if (recs.length === 0) {
          tripState.step = 'idle';
          return `<p>Sorry, I couldn't find matching destinations for your preferences. Try adjusting your budget or trip type.</p>`;
        }

        let html = `<p>Based on your inputs (<strong>₹${tripState.budget.toLocaleString('en-IN')}</strong> budget, <strong>${tripState.days} days</strong>, from <strong>${escapeHtml(tripState.city)}</strong>, <strong>${escapeHtml(tripState.type)}</strong>), I recommend:</p>`;

        recs.forEach((r, i) => {
          const emoji = ['1️⃣', '2️⃣', '3️⃣'][i];
          const totalCost = r.dest.cost.stay + r.dest.cost.travel + r.dest.cost.activities + r.dest.cost.buffer;
          html += `<div class="dest-card">
  <h4>${emoji} ${r.dest.name}</h4>
  <p>${r.dest.description}</p>
  <p class="dest-weather">🌤️ March weather: ${r.dest.weather}</p>
  <p><strong>Est. cost:</strong> ₹${totalCost.toLocaleString('en-IN')}/person</p>
  ${r.dest.crowded ? '<span class="crowd-tag crowd-high">👥 Popular / Crowded</span>' : '<span class="crowd-tag crowd-low">🌿 Less Crowded</span>'}
</div>`;
        });

        // Store recommendations for reference
        tripState._recs = recs;

        html += `<p><strong>Would you like a detailed plan for any of these?</strong></p>
<div class="option-buttons" id="destOptions">
  ${recs.map(r => `<button class="option-btn" data-value="${r.key}">${r.dest.name}</button>`).join('\n  ')}
</div>`;

        return html;
      }

      case 'suggest_dest': {
        // User chose a destination or expressed crowd preference
        if (/less\s*crowd|not\s*crowd|quiet|peaceful|secluded|prefer.*less/i.test(q)) {
          // Filter for less crowded
          const lessC = (tripState._recs || []).filter(r => !r.dest.crowded);
          if (lessC.length > 0) {
            const chosen = lessC[0];
            tripState.destination = chosen.key;
            tripState.step = 'ask_hotel';
            return buildItineraryWithHotelPrompt(chosen.dest);
          }
        }

        // Match destination by name or key
        let chosen = null;
        for (const [key, dest] of Object.entries(destinations)) {
          if (q.includes(key) || q.includes(dest.name.toLowerCase())) {
            chosen = { key, dest };
            break;
          }
        }
        // Also accept "yes" or "1" / "2" / "3" to pick from recommendations
        if (!chosen && tripState._recs) {
          if (/\b(yes|sure|ok|yeah|yep|1|first)\b/.test(q)) chosen = tripState._recs[0];
          else if (/\b(2|second)\b/.test(q)) chosen = tripState._recs[1];
          else if (/\b(3|third)\b/.test(q)) chosen = tripState._recs[2];
        }

        if (!chosen) {
          return `<p>Please select a destination from the options above, or tell me your preference (e.g., "I prefer less crowded places").</p>`;
        }

        tripState.destination = chosen.key;
        tripState.step = 'ask_hotel';
        return buildItineraryWithHotelPrompt(chosen.dest);
      }

      // show_itinerary step removed — itinerary + hotel prompt now combined

      case 'ask_hotel': {
        let tier = 'midrange';
        if (/budget|cheap|economy/i.test(q)) tier = 'budget';
        else if (/mid|medium|moderate/i.test(q)) tier = 'midrange';
        else if (/premium|luxury|high|best/i.test(q)) tier = 'premium';

        tripState.hotelTier = tier;
        tripState.step = 'show_hotel';

        const dest = destinations[tripState.destination];
        const hotels = dest.hotels[tier] || [];
        const tierLabel = { budget: '💰 Budget', midrange: '⭐ Mid-range', premium: '💎 Premium' }[tier];

        let html = `<h3>${tierLabel} Hotels in ${dest.name}</h3>`;
        hotels.forEach(h => {
          html += `<div class="hotel-card">
  <div class="hotel-header">
    <h4>🏨 ${h.name}</h4>
    <span class="hotel-rating">${h.rating}</span>
  </div>
  <p>${h.desc}</p>
  <p class="hotel-price">${h.price}</p>
</div>`;
        });

        html += `<p>Would you also like <strong>transport options</strong> from ${escapeHtml(tripState.city)}?</p>
<div class="option-buttons" id="transportChoice">
  <button class="option-btn" data-value="yes_transport">✈️ Yes, show options</button>
  <button class="option-btn" data-value="cheapest_transport">💰 Yes, cheapest option</button>
  <button class="option-btn" data-value="no_transport">❌ No, I'm all set</button>
</div>`;

        return html;
      }

      case 'show_hotel': {
        // transport question response
        const dest = destinations[tripState.destination];

        if (/no|nah|skip|all set|done/i.test(q)) {
          tripState.step = 'complete';
          return buildSummary(dest);
        }

        tripState.step = 'complete';

        if (/cheap|economical|lowest|budget/i.test(q)) {
          const cheapest = getCheapestTransport(dest);
          if (cheapest) {
            let html = `<h3>💰 Most Economical Transport</h3>
<div class="transport-card transport-card--highlight">
  <h4>🚆 ${cheapest.mode}</h4>
  <p><strong>Cost:</strong> ${cheapest.cost}</p>
  <p><strong>Duration:</strong> ${cheapest.duration}</p>
  <p>${cheapest.details}</p>
</div>`;
            html += buildSummary(dest);
            return html;
          }
        }

        // Show all transport options
        const options = dest.transport.fromBangalore || [];
        let html = `<h3>🚗 Transport Options from ${escapeHtml(tripState.city)}</h3>`;
        options.forEach((o, i) => {
          const cheapest = getCheapestTransport(dest);
          const isC = cheapest && o.mode === cheapest.mode;
          html += `<div class="transport-card ${isC ? 'transport-card--highlight' : ''}">
  <h4>${['✈️', '🚌', '🚆'][i] || '🚗'} ${o.mode}</h4>
  <p><strong>Cost:</strong> ${o.cost}</p>
  <p><strong>Duration:</strong> ${o.duration}</p>
  <p>${o.details}</p>
  ${isC ? '<span class="best-value-tag">💰 Best Value</span>' : ''}
</div>`;
        });

        html += buildSummary(dest);
        return html;
      }

      case 'complete':
        resetTrip();
        return `<p>Happy to help! 😊 Want to plan another trip? Just say <strong>"Plan a trip"</strong>!</p>`;

      default:
        return null;
    }
  }

  function buildItineraryResponse(dest) {
    const days = tripState.days;
    const itinerary = dest.itinerary[5] || dest.itinerary[Object.keys(dest.itinerary)[0]];
    const useDays = itinerary.slice(0, days);

    let html = `<h3>📋 Your ${days}-Day Plan for ${dest.name}</h3>
<p class="dest-weather">🌤️ ${dest.weather}</p>`;

    useDays.forEach(d => {
      html += `<div class="itinerary-day">
  <div class="day-badge">Day ${d.day}</div>
  <div class="day-content">
    <h4>${d.title}</h4>
    <p>${d.details}</p>
  </div>
</div>`;
    });

    // Cost breakdown
    html += `<div class="cost-breakdown">
  <h4>💰 Estimated Cost Breakdown (per person)</h4>
  <div class="cost-row"><span>🏨 Stay</span><span>₹${dest.cost.stay.toLocaleString('en-IN')}</span></div>
  <div class="cost-row"><span>🚗 Travel</span><span>₹${dest.cost.travel.toLocaleString('en-IN')}</span></div>
  <div class="cost-row"><span>🎯 Activities & Food</span><span>₹${dest.cost.activities.toLocaleString('en-IN')}</span></div>
  <div class="cost-row"><span>🛡️ Buffer</span><span>₹${dest.cost.buffer.toLocaleString('en-IN')}</span></div>
  <div class="cost-row cost-row--total"><span>Total</span><span>₹${(dest.cost.stay + dest.cost.travel + dest.cost.activities + dest.cost.buffer).toLocaleString('en-IN')}</span></div>
</div>`;

    return html;
  }

  function buildItineraryWithHotelPrompt(dest) {
    let html = buildItineraryResponse(dest);
    html += `<p style="margin-top:14px"><strong>Would you like hotel recommendations?</strong></p>
<div class="option-buttons" id="hotelOptions">
  <button class="option-btn" data-value="budget">💰 Budget</button>
  <button class="option-btn" data-value="midrange">⭐ Mid-range</button>
  <button class="option-btn" data-value="premium">💎 Premium</button>
</div>`;
    return html;
  }

  function buildSummary(dest) {
    const total = dest.cost.stay + dest.cost.travel + dest.cost.activities + dest.cost.buffer;
    return `<div class="trip-summary">
  <h4>🎉 Your Trip Summary</h4>
  <div class="summary-grid">
    <div class="summary-item"><span class="summary-label">📍 Destination</span><span>${dest.name}</span></div>
    <div class="summary-item"><span class="summary-label">🏙️ From</span><span>${escapeHtml(tripState.city)}</span></div>
    <div class="summary-item"><span class="summary-label">📅 Duration</span><span>${tripState.days} Days</span></div>
    <div class="summary-item"><span class="summary-label">👥 Travelers</span><span>${tripState.people}</span></div>
    <div class="summary-item"><span class="summary-label">💰 Per Person</span><span>₹${total.toLocaleString('en-IN')}</span></div>
    <div class="summary-item"><span class="summary-label">💳 Total Est.</span><span>₹${(total * tripState.people).toLocaleString('en-IN')}</span></div>
  </div>
  <p>Ready to book? Contact us at <strong>+91 98765 43210</strong> or <strong>support@prayanatravels.com</strong></p>
</div>`;
  }

  // ---- Chat Helpers ----
  function appendMessage(html, sender) {
    const div = document.createElement('div');
    div.classList.add('msg', sender === 'user' ? 'msg--user' : 'msg--bot');
    div.innerHTML = html;
    chatMessages.appendChild(div);
    scrollToBottom();
    // After appending, bind any option buttons
    if (sender === 'bot') bindOptionButtons(div);
  }

  function bindOptionButtons(container) {
    const btns = container.querySelectorAll('.option-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.getAttribute('data-value');
        const label = btn.textContent.trim();
        // Highlight selected
        btns.forEach(b => b.classList.remove('option-btn--selected'));
        btn.classList.add('option-btn--selected');
        // Process as user input
        setTimeout(() => handleUserInput(label), 200);
      });
    });
  }

  function showTyping() {
    const div = document.createElement('div');
    div.classList.add('typing-indicator');
    div.id = 'typingIndicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(div);
    scrollToBottom();
  }

  function hideTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    });
  }

  function handleUserInput(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Show user message
    appendMessage(escapeHtml(trimmed), 'user');
    chatInput.value = '';

    // Disable input while bot is "typing"
    chatInput.disabled = true;
    sendBtn.disabled = true;

    // Show typing indicator
    showTyping();

    // Simulate response delay
    const delay = 600 + Math.random() * 500;
    setTimeout(() => {
      hideTyping();

      let response;
      // If we're in a trip-planning step, route to trip handler
      if (tripState.step !== 'idle') {
        response = handleTripStep(trimmed);
      } else {
        response = getResponse(trimmed);
      }

      if (response) {
        appendMessage(response, 'bot');
      }

      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }, delay);
  }

  function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // ---- Event Listeners ----
  sendBtn.addEventListener('click', () => handleUserInput(chatInput.value));

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUserInput(chatInput.value);
    }
  });

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const question = pill.getAttribute('data-question');
      handleUserInput(question);
    });
  });

  // ---- Welcome Message ----
  appendMessage(KB.welcome, 'bot');
})();
