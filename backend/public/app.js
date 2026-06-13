// Global State variables
let apiKey = '';
let departments = [];
let seriesList = [];
let typingIndicator = null;

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const inputForm = document.getElementById('inputForm');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const suggestionsPanel = document.getElementById('suggestionsPanel');

// Startup initialization
async function init() {
  try {
    // 1. Fetch API Key Config
    const configRes = await fetch('/api/chatbot/config');
    const configData = await configRes.json();
    apiKey = configData.apiKey;

    // 2. Load lists (departments, series) in parallel
    const [deptRes, seriesRes] = await Promise.all([
      fetch('/api/chatbot/departments', { headers: { 'x-api-key': apiKey } }),
      fetch('/api/chatbot/series', { headers: { 'x-api-key': apiKey } })
    ]);

    departments = await deptRes.json();
    seriesList = await seriesRes.json();

    // 3. Welcome user
    showWelcomeMessage();
  } catch (err) {
    console.error('Initialization error:', err);
    addBotMessage('⚠️ Failed to initialize connection to database. Please make sure the backend is running.');
  }
}

// Helper to format currency/dates
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey
  };
}

// Add User message to log
function addUserMessage(text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message user';
  
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = text;
  
  const time = document.createElement('div');
  time.className = 'message-time';
  time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  msgDiv.appendChild(bubble);
  msgDiv.appendChild(time);
  chatMessages.appendChild(msgDiv);
  scrollToBottom();
}

// Add Bot message to log
function addBotMessage(text, options = null, customHtml = null) {
  removeTypingIndicator();

  const msgDiv = document.createElement('div');
  msgDiv.className = 'message bot';
  
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.innerHTML = text; // support bold / html formatting
  
  // Custom HTML (Forms, Stock details)
  if (customHtml) {
    bubble.appendChild(customHtml);
  }

  // Option Buttons
  if (options && options.length > 0) {
    const optContainer = document.createElement('div');
    optContainer.className = 'options-container';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = opt.label;
      btn.onclick = () => {
        addUserMessage(opt.label);
        opt.action(opt.value);
      };
      optContainer.appendChild(btn);
    });
    bubble.appendChild(optContainer);
  }
  
  const time = document.createElement('div');
  time.className = 'message-time';
  time.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  msgDiv.appendChild(bubble);
  msgDiv.appendChild(time);
  chatMessages.appendChild(msgDiv);
  scrollToBottom();
}

// Add typing indicator
function showTypingIndicator() {
  if (typingIndicator) return;
  
  const indicator = document.createElement('div');
  indicator.className = 'message bot';
  
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble typing-indicator';
  bubble.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
  `;
  
  indicator.appendChild(bubble);
  chatMessages.appendChild(indicator);
  typingIndicator = indicator;
  scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
  if (typingIndicator) {
    typingIndicator.remove();
    typingIndicator = null;
  }
}

// Scroll to bottom
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Welcome Screen
function showWelcomeMessage() {
  addBotMessage(
    "नमस्ते! मैं आपका <strong>Procurement & Inventory Assistant</strong> हूँ। 🤖<br>मैं स्टोर में स्टॉक चेक कर सकता हूँ और ज़रूरत पड़ने पर Oracle database में नया Indent डाल सकता हूँ।",
    [
      { label: "Check Stock / Search Item", value: "check_stock", action: promptSearchItem }
    ]
  );
}

// State transition: Start item search
function promptSearchItem() {
  addBotMessage("स्टॉक चेक करने या इंडेंट डालने के लिए आइटम का नाम या कोड टाइप करें (उदा. BOLT):");
  userInput.focus();
}

// Setup autocomplete events
let searchTimeout = null;
userInput.addEventListener('input', () => {
  const val = userInput.value.trim();
  
  if (searchTimeout) clearTimeout(searchTimeout);
  
  if (val.length < 2) {
    suggestionsPanel.style.display = 'none';
    return;
  }

  searchTimeout = setTimeout(async () => {
    try {
      const res = await fetch(`/api/chatbot/items?q=${encodeURIComponent(val)}`, {
        headers: { 'x-api-key': apiKey }
      });
      const items = await res.json();
      
      renderSuggestions(items);
    } catch (err) {
      console.error(err);
    }
  }, 300);
});

// Render suggestions panel
function renderSuggestions(items) {
  suggestionsPanel.innerHTML = '';
  
  if (items.length === 0) {
    suggestionsPanel.style.display = 'none';
    return;
  }

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    div.innerHTML = `
      <span class="suggestion-text">${item.itemName}</span>
      <span class="suggestion-code">${item.itemCode}</span>
    `;
    div.onclick = () => {
      userInput.value = '';
      suggestionsPanel.style.display = 'none';
      addUserMessage(`Selected: ${item.itemName} (${item.itemCode})`);
      processSelectedItem(item);
    };
    suggestionsPanel.appendChild(div);
  });

  suggestionsPanel.style.display = 'block';
}

// Handle submit in primary form (for searching items)
inputForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const val = userInput.value.trim();
  if (!val) return;

  userInput.value = '';
  suggestionsPanel.style.display = 'none';
  addUserMessage(val);

  showTypingIndicator();
  
  try {
    const res = await fetch(`/api/chatbot/items?q=${encodeURIComponent(val)}`, {
      headers: { 'x-api-key': apiKey }
    });
    const items = await res.json();
    
    if (items.length > 0) {
      // Show matching items as selection options
      addBotMessage("मुझे ये आइटम मिले हैं, कृपया इनमें से एक चुनें:", 
        items.slice(0, 10).map(item => ({
          label: `${item.itemName} (${item.itemCode})`,
          value: item,
          action: (selectedItem) => {
            addUserMessage(`Selected: ${selectedItem.itemName} (${selectedItem.itemCode})`);
            processSelectedItem(selectedItem);
          }
        }))
      );
    } else {
      addBotMessage(`⚠️ मुझे "${val}" नाम या कोड से कोई आइटम नहीं मिला। कृपया पुनः प्रयास करें।`);
    }
  } catch (err) {
    console.error(err);
    addBotMessage("⚠️ आइटम सर्च करते समय कोई त्रुटि हुई।");
  }
});

// Thank you reset message
function sayThanks() {
  addBotMessage("धन्यवाद! यदि आपको कुछ और चाहिए तो बताइए।", [
    { label: "Search Another Item", value: "check_stock", action: promptSearchItem }
  ]);
}

// Process Selected Item and check stock
async function processSelectedItem(item) {
  addBotMessage("Wait, stock search ho raha hai...");
  showTypingIndicator();

  try {
    const res = await fetch(`/api/chatbot/stock/${item.itemCode}`, {
      headers: { 'x-api-key': apiKey }
    });
    const data = await res.json();
    const stock = data.stock;

    const stockCard = document.createElement('div');
    if (stock > 0) {
      stockCard.className = 'card stock-card';
      stockCard.innerHTML = `
        <div class="card-title">✅ Store me available hai!</div>
        <div class="card-content">
          Item: <strong>${item.itemName}</strong> (${item.itemCode})<br>
          Current Stock: <strong>${stock} ${item.um}</strong><br>
          Status: <strong>Available</strong>
        </div>
      `;
      addBotMessage(
        `स्टोर में <strong>${item.itemName}</strong> उपलब्ध है। स्टॉक: <strong>${stock} ${item.um}</strong>। आप इसे इश्यू करा सकते हैं। धन्यवाद!`,
        [
          { label: "Search Another Item", value: "check_stock", action: promptSearchItem }
        ],
        stockCard
      );
    } else {
      stockCard.className = 'card stock-card out-of-stock';
      stockCard.innerHTML = `
        <div class="card-title">ℹ️ Store me nahi hai!</div>
        <div class="card-content">
          Item: <strong>${item.itemName}</strong> (${item.itemCode})<br>
          Current Stock: <strong>0 ${item.um}</strong><br>
          Status: <strong>Out of Stock</strong>
        </div>
      `;
      addBotMessage(
        `स्टोर में स्टॉक उपलब्ध नहीं है (0)। क्या आप इंडेंट डालना चाहते हैं?`,
        [
          { label: "हाँ, इंडेंट डालें", value: item, action: renderIndentForm },
          { label: "नहीं, धन्यवाद", value: "no_thanks", action: sayThanks }
        ],
        stockCard
      );
    }
  } catch (err) {
    console.error(err);
    addBotMessage("⚠️ स्टॉक चेक करते समय त्रुटि हुई।");
  }
}

// Render Indent Form inside Chat bubble
function renderIndentForm(item) {
  const formCard = document.createElement('div');
  formCard.className = 'chat-form-card';
  
  // Create Options for Departments
  const deptOptions = departments.map(d => `<option value="${d}">${d}</option>`).join('');
  
  // Create Options for Series
  const seriesOptions = seriesList.map(s => `
    <option value="${s.series}">${s.series} - ${s.descr} (${s.entityCode})</option>
  `).join('');

  // Default Due Date: today + 30 days
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 30);
  const formattedDefaultDate = defaultDueDate.toISOString().split('T')[0];

  formCard.innerHTML = `
    <h4 class="card-title" style="color: var(--primary);">Raise Indent Form</h4>
    
    <div class="form-group">
      <label>Item Name</label>
      <input type="text" value="${item.itemName} (${item.itemCode})" disabled>
    </div>

    <div class="form-group">
      <label>Quantity Required (${item.um}) *</label>
      <input type="number" id="form-qty" placeholder="Enter quantity..." min="1" step="any" required>
    </div>

    <div class="form-group">
      <label>Department *</label>
      <select id="form-dept" required>
        <option value="" disabled selected>Select Department...</option>
        ${deptOptions}
      </select>
    </div>

    <div class="form-group">
      <label>Indent Series *</label>
      <select id="form-series" required>
        <option value="" disabled selected>Select Indent Series...</option>
        ${seriesOptions}
      </select>
    </div>

    <div class="form-group">
      <label>Preferred Make/Brand</label>
      <input type="text" id="form-make" placeholder="e.g. SKF, TATA...">
    </div>

    <div class="form-group">
      <label>Specifications / Details *</label>
      <textarea id="form-specs" placeholder="Enter procurement specifications..." required>${item.itemName}</textarea>
    </div>

    <div class="form-group">
      <label>Purpose of Procurement *</label>
      <textarea id="form-purpose" placeholder="What is this item being procured for?" required></textarea>
    </div>

    <div class="form-group">
      <label>Required By (Due Date) *</label>
      <input type="date" id="form-date" value="${formattedDefaultDate}" required>
    </div>

    <div class="form-actions">
      <button class="form-btn cancel" id="form-cancel-btn">Cancel</button>
      <button class="form-btn submit" id="form-submit-btn">Submit Indent</button>
    </div>
  `;

  addBotMessage(`कृपया नीचे दिए गए फॉर्म में इंडेंट विवरण भरें:`, null, formCard);

  // Bind Form Actions
  const cancelBtn = formCard.querySelector('#form-cancel-btn');
  const submitBtn = formCard.querySelector('#form-submit-btn');

  cancelBtn.onclick = () => {
    addUserMessage("Cancel");
    addBotMessage("इंडेंट प्रक्रिया रद्द कर दी गई है।", [
      { label: "Search Item Again", value: "check_stock", action: promptSearchItem }
    ]);
    formCard.style.pointerEvents = 'none';
    formCard.style.opacity = '0.5';
  };

  submitBtn.onclick = async () => {
    // Read values
    const qty = formCard.querySelector('#form-qty').value;
    const deptCode = formCard.querySelector('#form-dept').value;
    const series = formCard.querySelector('#form-series').value;
    const make = formCard.querySelector('#form-make').value;
    const specs = formCard.querySelector('#form-specs').value;
    const purpose = formCard.querySelector('#form-purpose').value;
    const dueDate = formCard.querySelector('#form-date').value;

    // Validate
    if (!qty || isNaN(qty) || Number(qty) <= 0) {
      alert("Please enter a valid positive quantity.");
      return;
    }
    if (!deptCode) {
      alert("Please select a Department.");
      return;
    }
    if (!series) {
      alert("Please select an Indent Series.");
      return;
    }
    if (!specs.trim()) {
      alert("Please enter specifications.");
      return;
    }
    if (!purpose.trim()) {
      alert("Please enter purpose of procurement.");
      return;
    }

    formCard.style.pointerEvents = 'none';
    formCard.style.opacity = '0.5';
    addUserMessage("Submit Indent Form");
    
    // Show summary card
    renderConfirmation({
      itemCode: item.itemCode,
      itemName: item.itemName,
      qty,
      um: item.um,
      deptCode,
      series,
      make,
      specs,
      purpose,
      dueDate
    });
  };
}

// Render summary confirmation card
function renderConfirmation(indentData) {
  const summaryCard = document.createElement('div');
  summaryCard.className = 'summary-card';
  summaryCard.innerHTML = `
    <div class="card-title" style="color: var(--secondary);">Verify Details</div>
    <div class="summary-list">
      <div class="summary-item"><span class="label">Item:</span><span class="value">${indentData.itemName}</span></div>
      <div class="summary-item"><span class="label">Quantity:</span><span class="value">${indentData.qty} ${indentData.um}</span></div>
      <div class="summary-item"><span class="label">Department:</span><span class="value">${indentData.deptCode}</span></div>
      <div class="summary-item"><span class="label">Indent Series:</span><span class="value">${indentData.series}</span></div>
      <div class="summary-item"><span class="label">Preferred Make:</span><span class="value">${indentData.make || 'N/A'}</span></div>
      <div class="summary-item"><span class="label">Specifications:</span><span class="value">${indentData.specs}</span></div>
      <div class="summary-item"><span class="label">Purpose:</span><span class="value">${indentData.purpose}</span></div>
      <div class="summary-item"><span class="label">Required By:</span><span class="value">${indentData.dueDate}</span></div>
    </div>
  `;

  addBotMessage(`कृपया विवरण सत्यापित करें और डेटाबेस में भेजने के लिए <strong>Confirm</strong> करें:`, [
    { label: "Confirm & Send to DB", value: indentData, action: submitIndentToDb },
    { label: "Edit / Cancel", value: "check_stock", action: promptSearchItem }
  ], summaryCard);
}

// API Post to submit Indent to database
async function submitIndentToDb(indentData) {
  showTypingIndicator();

  try {
    const response = await fetch('/api/chatbot/indent', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(indentData)
    });

    const result = await response.json();
    
    if (result.success) {
      const successCard = document.createElement('div');
      successCard.className = 'card';
      successCard.style.background = 'var(--success-bg)';
      successCard.style.border = '1px solid var(--success-border)';
      successCard.innerHTML = `
        <div class="card-title" style="color: var(--success);">🎉 Indent Raised Successfully!</div>
        <div class="card-content" style="color: var(--text-primary);">
          Voucher Number (VRNO): <strong>${result.vrNo}</strong><br>
          Status: <strong>Inserted in Oracle DB</strong>
        </div>
      `;
      addBotMessage(
        `बधाई हो! इंडेंट सफलतापूर्वक रेस (Raise) हो गया है और डेटाबेस में भेज दिया गया है।`,
        [
          { label: "Raise Another Indent", value: "check_stock", action: promptSearchItem }
        ],
        successCard
      );
    } else {
      addBotMessage(`❌ इंडेंट डालने में विफलता: ${result.error || 'अज्ञात त्रुटि'}`);
    }
  } catch (err) {
    console.error(err);
    addBotMessage("⚠️ डेटाबेस में इंडेंट डालते समय कोई त्रुटि हुई।");
  }
}

// Start application
init();
