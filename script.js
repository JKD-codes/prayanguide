/* ================================================
   PrayanGuide — Chat Logic & Knowledge Base
   ================================================ */

(function () {
    'use strict';

    // ---- DOM References ----
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const pills = document.querySelectorAll('.suggestion-pill');

    // ---- Knowledge Base ----
    const KB = {
        welcome: `<h3>Welcome to PrayanGuide!</h3>
<p>I'm your personal travel assistant from <strong>Prayana Travels Pvt. Ltd.</strong></p>
<p>Ask me about travel packages, bookings, visa help, cancellation policies, or anything travel-related.</p>`,

        services: `<h3>Services Offered by Prayana Travels</h3>
<ul>
  <li>Domestic Tour Packages (India)</li>
  <li>International Tour Packages</li>
  <li>Honeymoon Packages</li>
  <li>Student Budget Trips</li>
  <li>Corporate Travel Management</li>
  <li>Flight Booking</li>
  <li>Hotel Booking</li>
  <li>Visa Assistance</li>
  <li>Travel Insurance</li>
  <li>Customized Itinerary Planning</li>
</ul>
<p>Need details on any of these? Just ask!</p>`,

        budgetPackages: `<h3>Best Budget Travel Packages</h3>

<div class="package-card">
  <h4>Student Backpacking Himachal</h4>
  <p><strong>Price:</strong> ₹5,499</p>
  <p><strong>Duration:</strong> 4 Days / 3 Nights</p>
  <p><strong>Includes:</strong> Stay, meals, transport, guided treks</p>
  <p><strong>Best For:</strong> College students & solo travelers</p>
</div>

<div class="package-card">
  <h4>Goa Weekend Trip</h4>
  <p><strong>Price:</strong> ₹6,999</p>
  <p><strong>Duration:</strong> 3 Days / 2 Nights</p>
  <p><strong>Includes:</strong> Hotel, breakfast, sightseeing, transfers</p>
  <p><strong>Best For:</strong> Friends, couples, weekend getaway</p>
</div>

<div class="package-card">
  <h4>Manali Adventure</h4>
  <p><strong>Price:</strong> ₹9,999</p>
  <p><strong>Duration:</strong> 5 Days / 4 Nights</p>
  <p><strong>Includes:</strong> Camping, adventure sports, meals, transport</p>
  <p><strong>Best For:</strong> Adventure seekers & groups</p>
</div>`,

        allPackages: `<h3>Our Travel Packages</h3>

<div class="package-card">
  <h4>Student Backpacking Himachal</h4>
  <p><strong>Price:</strong> ₹5,499 | <strong>Duration:</strong> 4D/3N</p>
  <p><strong>Best For:</strong> Students & solo travelers</p>
</div>

<div class="package-card">
  <h4>Goa Weekend Trip</h4>
  <p><strong>Price:</strong> ₹6,999 | <strong>Duration:</strong> 3D/2N</p>
  <p><strong>Best For:</strong> Friends, couples</p>
</div>

<div class="package-card">
  <h4>Manali Adventure</h4>
  <p><strong>Price:</strong> ₹9,999 | <strong>Duration:</strong> 5D/4N</p>
  <p><strong>Best For:</strong> Adventure seekers</p>
</div>

<div class="package-card">
  <h4>Dubai Explorer</h4>
  <p><strong>Price:</strong> ₹45,000 | <strong>Duration:</strong> 5D/4N</p>
  <p><strong>Best For:</strong> Families & couples</p>
</div>

<div class="package-card">
  <h4>Europe Highlights</h4>
  <p><strong>Price:</strong> ₹1,20,000 | <strong>Duration:</strong> 10D/9N</p>
  <p><strong>Best For:</strong> Honeymoon, premium travelers</p>
</div>

<p>Want a customized package? Let me know your budget and preferences!</p>`,

        booking: `<h3>How to Book a Trip with Prayana</h3>
<ol>
  <li><strong>Choose a Package</strong> — Browse our packages or ask me for suggestions based on your budget.</li>
  <li><strong>Customize</strong> — Need changes? We'll tailor the itinerary for you.</li>
  <li><strong>Confirm & Pay</strong> — Secure your spot with a simple online payment.</li>
  <li><strong>Get Itinerary</strong> — Receive your detailed travel plan via email.</li>
  <li><strong>Travel!</strong> — Enjoy a stress-free trip with 24/7 support.</li>
</ol>
<p>Ready to book? Contact us:</p>
<ul>
  <li>Email: <strong>support@prayanatravels.com</strong></li>
  <li>Phone: <strong>+91 98765 43210</strong></li>
  <li>Website: <strong>www.prayanatravels.com</strong></li>
</ul>`,

        refund: `<h3>Refund & Cancellation Policy</h3>
<ul>
  <li><strong>Free cancellation</strong> within 48 hours of booking</li>
  <li><strong>50% refund</strong> if cancelled before 7 days of departure</li>
  <li><strong>No refund</strong> within 48 hours of departure</li>
</ul>
<p>For cancellation requests, email <strong>support@prayanatravels.com</strong> or call <strong>+91 98765 43210</strong>.</p>`,

        contact: `<h3>Contact Prayana Travels</h3>
<ul>
  <li><strong>Email:</strong> support@prayanatravels.com</li>
  <li><strong>Phone:</strong> +91 98765 43210</li>
  <li><strong>Website:</strong> www.prayanatravels.com</li>
</ul>
<p>Our team is available <strong>24/7</strong> to assist you.</p>`,

        about: `<h3>About Prayana Travels</h3>
<p><strong>Prayana Travels Pvt. Ltd.</strong> was founded in <strong>2024</strong> and is headquartered in <strong>Mumbai, India</strong>.</p>
<p><strong>Vision:</strong> To make travel affordable, accessible, and stress-free for everyone.</p>
<p><strong>Mission:</strong></p>
<ul>
  <li>Provide affordable and premium travel packages</li>
  <li>Use AI to personalize travel planning</li>
  <li>Offer 24/7 intelligent customer support</li>
  <li>Ensure transparent pricing</li>
</ul>`,

        visa: `<h3>Visa Assistance</h3>
<p>Prayana offers <strong>complete visa assistance</strong> for international travel:</p>
<ul>
  <li>Document checklist & verification</li>
  <li>Application form guidance</li>
  <li>Embassy appointment scheduling</li>
  <li>Travel insurance bundling</li>
</ul>
<p>Get started by telling me your destination country!</p>`,

        insurance: `<h3>Travel Insurance</h3>
<p>All our international packages include <strong>basic travel insurance</strong>. We also offer:</p>
<ul>
  <li>Trip cancellation coverage</li>
  <li>Medical emergency coverage</li>
  <li>Lost baggage protection</li>
  <li>Flight delay compensation</li>
</ul>
<p>Ask me for a quote based on your trip!</p>`,

        honeymoon: `<h3>Honeymoon Packages</h3>

<div class="package-card">
  <h4>Goa Romance Getaway</h4>
  <p><strong>Price:</strong> ₹12,999 | <strong>Duration:</strong> 4D/3N</p>
  <p><strong>Includes:</strong> Beach resort, candlelight dinner, couples spa</p>
  <p><strong>Best For:</strong> Newlyweds</p>
</div>

<div class="package-card">
  <h4>Dubai Explorer (Honeymoon Special)</h4>
  <p><strong>Price:</strong> ₹55,000 | <strong>Duration:</strong> 5D/4N</p>
  <p><strong>Includes:</strong> Luxury hotel, desert safari, Dhow cruise dinner</p>
  <p><strong>Best For:</strong> Couples seeking luxury</p>
</div>

<div class="package-card">
  <h4>Europe Highlights (Romantic Edition)</h4>
  <p><strong>Price:</strong> ₹1,40,000 | <strong>Duration:</strong> 10D/9N</p>
  <p><strong>Includes:</strong> Paris, Switzerland, Italy — premium stays & tours</p>
  <p><strong>Best For:</strong> Dream honeymoon</p>
</div>

<p>Want something customized? Tell me your preferences!</p>`,

        corporate: `<h3>Corporate Travel Management</h3>
<p>Prayana offers tailored corporate travel solutions:</p>
<ul>
  <li>Group bookings & MICE events</li>
  <li>Corporate retreat planning</li>
  <li>Negotiated hotel & flight rates</li>
  <li>Dedicated account manager</li>
  <li>Expense reporting integration</li>
</ul>
<p>Contact us at <strong>support@prayanatravels.com</strong> for a corporate quote.</p>`,

        goa: `<h3>Goa Weekend Trip</h3>
<div class="package-card">
  <h4>Goa Weekend Trip</h4>
  <p><strong>Price:</strong> ₹6,999</p>
  <p><strong>Duration:</strong> 3 Days / 2 Nights</p>
  <p><strong>Includes:</strong> Hotel stay, breakfast, sightseeing, airport/station transfers</p>
  <p><strong>Best For:</strong> Friends, couples, weekend getaway</p>
</div>
<p>Want to book this trip? Contact <strong>+91 98765 43210</strong> or email <strong>support@prayanatravels.com</strong>.</p>`,

        manali: `<h3>Manali Adventure Package</h3>
<div class="package-card">
  <h4>Manali Adventure</h4>
  <p><strong>Price:</strong> ₹9,999</p>
  <p><strong>Duration:</strong> 5 Days / 4 Nights</p>
  <p><strong>Includes:</strong> Camping, adventure sports, all meals, transport</p>
  <p><strong>Best For:</strong> Adventure seekers & friend groups</p>
</div>
<p>Ready to book? Reach out at <strong>+91 98765 43210</strong>.</p>`,

        dubai: `<h3>Dubai Explorer Package</h3>
<div class="package-card">
  <h4>Dubai Explorer</h4>
  <p><strong>Price:</strong> ₹45,000</p>
  <p><strong>Duration:</strong> 5 Days / 4 Nights</p>
  <p><strong>Includes:</strong> Flights, 4-star hotel, Burj Khalifa visit, desert safari, city tour</p>
  <p><strong>Best For:</strong> Families & couples</p>
</div>
<p>Visa assistance included! Contact us to book.</p>`,

        europe: `<h3>Europe Highlights Package</h3>
<div class="package-card">
  <h4>Europe Highlights</h4>
  <p><strong>Price:</strong> ₹1,20,000</p>
  <p><strong>Duration:</strong> 10 Days / 9 Nights</p>
  <p><strong>Includes:</strong> Flights, premium hotels, guided tours across Paris, Switzerland & Italy</p>
  <p><strong>Best For:</strong> Honeymoon couples, premium travelers</p>
</div>
<p>Includes visa guidance & travel insurance. Get in touch to customize!</p>`,

        student: `<h3>Student Backpacking Himachal</h3>
<div class="package-card">
  <h4>Student Backpacking Himachal</h4>
  <p><strong>Price:</strong> ₹5,499</p>
  <p><strong>Duration:</strong> 4 Days / 3 Nights</p>
  <p><strong>Includes:</strong> Hostel stay, meals, local transport, guided treks</p>
  <p><strong>Best For:</strong> College students & solo budget travelers</p>
</div>
<p>Perfect for a budget-friendly mountain escape! Book now.</p>`,

        fallback: `<p>I'm here to help with Prayana travel services. Please ask something related to travel or bookings.</p>`,

        greeting: `<p>Hello! I'm <strong>PrayanGuide</strong>, your travel assistant. How can I help you today?</p>
<p>You can ask me about packages, bookings, cancellation policies, visa help, and more.</p>`
    };

    // ---- Intent Matching ----
    function getResponse(input) {
        const q = input.toLowerCase().trim();

        // Services
        if (/\bservices?\b/.test(q) || /\bwhat (do|does) prayana (offer|provide)\b/.test(q) || /\bwhat.*(offer|provide)\b/.test(q)) {
            return KB.services;
        }

        // Budget packages
        if (/\bbudget\b/.test(q) || (/\bcheap\b/.test(q) && /\b(package|trip|travel)\b/.test(q)) || /\baffordable\b/.test(q) || /\bbest budget\b/.test(q) || /\blow.?cost\b/.test(q)) {
            return KB.budgetPackages;
        }

        // Booking
        if (/\bbook(ing)?\b/.test(q) || /\bhow.*(book|reserve)\b/.test(q) || /\breserv(e|ation)\b/.test(q)) {
            return KB.booking;
        }

        // Refund / cancellation
        if (/\brefund\b/.test(q) || /\bcancel(lation)?\b/.test(q) || /\bcancell?ed\b/.test(q)) {
            return KB.refund;
        }

        // Contact
        if (/\bcontact\b/.test(q) || /\bphone\b/.test(q) || /\bemail\b/.test(q) || /\bsupport\b/.test(q) || /\breach\b/.test(q) || /\bcall\b/.test(q)) {
            return KB.contact;
        }

        // About
        if (/\babout\b/.test(q) || /\bwho.*(prayana|you)\b/.test(q) || /\bcompany\b/.test(q) || /\bfound(ed|er)?\b/.test(q) || /\bvision\b/.test(q) || /\bmission\b/.test(q)) {
            return KB.about;
        }

        // Visa
        if (/\bvisa\b/.test(q)) {
            return KB.visa;
        }

        // Insurance
        if (/\binsurance\b/.test(q)) {
            return KB.insurance;
        }

        // Honeymoon
        if (/\bhoneymoon\b/.test(q)) {
            return KB.honeymoon;
        }

        // Corporate
        if (/\bcorporat(e|ion)\b/.test(q) || /\bbusiness travel\b/.test(q) || /\bmice\b/.test(q)) {
            return KB.corporate;
        }

        // Specific destinations
        if (/\bgoa\b/.test(q)) return KB.goa;
        if (/\bmanali\b/.test(q)) return KB.manali;
        if (/\bdubai\b/.test(q)) return KB.dubai;
        if (/\beurope\b/.test(q)) return KB.europe;
        if (/\bhimachal\b/.test(q) || /\bstudent.*(trip|package|backpack)\b/.test(q) || /\bbackpack\b/.test(q)) return KB.student;

        // All packages
        if (/\bpackage/i.test(q) || /\btrip/i.test(q) || /\btour/i.test(q) || /\bdestination/i.test(q) || /\btravel plan/i.test(q) || /\bitinerary/i.test(q)) {
            return KB.allPackages;
        }

        // Greetings
        if (/^(hi|hello|hey|hola|namaste|good\s?(morning|afternoon|evening))\b/i.test(q)) {
            return KB.greeting;
        }

        // Pricing
        if (/\bpric(e|ing)\b/.test(q) || /\bcost\b/.test(q) || /\bhow much\b/.test(q) || /\brate\b/.test(q)) {
            return KB.allPackages;
        }

        // Thanks
        if (/\b(thank|thanks|thx)\b/i.test(q)) {
            return `<p>You're welcome! If you need anything else about Prayana Travel services, feel free to ask.</p>`;
        }

        return KB.fallback;
    }

    // ---- Chat Helpers ----
    function appendMessage(html, sender) {
        const div = document.createElement('div');
        div.classList.add('msg', sender === 'user' ? 'msg--user' : 'msg--bot');
        div.innerHTML = html;
        chatMessages.appendChild(div);
        scrollToBottom();
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

        // Simulate response delay (600–1000ms)
        const delay = 600 + Math.random() * 400;
        setTimeout(() => {
            hideTyping();
            const response = getResponse(trimmed);
            appendMessage(response, 'bot');
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
