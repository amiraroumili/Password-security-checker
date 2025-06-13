// Wait for the DOM to load
window.addEventListener('load', () => {
    // Find all password inputs on the page
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    if (passwordInputs.length === 0) return;
  
    // Process each password input
    passwordInputs.forEach(passwordInput => {
      setupPasswordChecker(passwordInput);
    });
  
    // Watch for dynamically added password fields
    observeDynamicFields();
  });
  
  // Set up MutationObserver to detect dynamically added password fields
  function observeDynamicFields() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node.nodeType === 1) { // ELEMENT_NODE
              const newPasswordFields = node.querySelectorAll('input[type="password"]');
              if (newPasswordFields.length > 0) {
                newPasswordFields.forEach(input => setupPasswordChecker(input));
              }
            }
          }
        }
      });
    });
  
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Create and setup the password checker for a specific input
  function setupPasswordChecker(passwordInput) {
    // Skip if already processed
    if (passwordInput.dataset.passwordCheckerInitialized) return;
    passwordInput.dataset.passwordCheckerInitialized = 'true';
  
    // Create floating checklist box
    const checklistBox = document.createElement('div');
    checklistBox.className = 'pw-checker-checklist';
    checklistBox.innerHTML = `
      <h4>Password Requirements</h4>
      <ul>
        <li id="length-${generateId()}" class="pw-checker-unmet">At least 8 characters</li>
        <li id="uppercase-${generateId()}" class="pw-checker-unmet">Include uppercase letter</li>
        <li id="lowercase-${generateId()}" class="pw-checker-unmet">Include lowercase letter</li>
        <li id="number-${generateId()}" class="pw-checker-unmet">Include a number</li>
        <li id="special-${generateId()}" class="pw-checker-unmet">Include a special character</li>
        <li id="common-${generateId()}" class="pw-checker-unmet">Not a common password</li>
      </ul>
      <div class="pw-checker-strength-meter">
        <div class="pw-checker-strength-indicator"></div>
      </div>
      <div class="pw-checker-strength-label">Weak</div>
      <div class="pw-checker-probability"></div>
      <div class="pw-checker-crack-info"></div>
    `;
    document.body.appendChild(checklistBox);
  
    // Store references to elements
    const elements = {
      length: checklistBox.querySelector(`#length-${checklistBox.querySelector('[id^="length-"]').id.split('-')[1]}`),
      uppercase: checklistBox.querySelector(`#uppercase-${checklistBox.querySelector('[id^="uppercase-"]').id.split('-')[1]}`),
      lowercase: checklistBox.querySelector(`#lowercase-${checklistBox.querySelector('[id^="lowercase-"]').id.split('-')[1]}`),
      number: checklistBox.querySelector(`#number-${checklistBox.querySelector('[id^="number-"]').id.split('-')[1]}`),
      special: checklistBox.querySelector(`#special-${checklistBox.querySelector('[id^="special-"]').id.split('-')[1]}`),
      common: checklistBox.querySelector(`#common-${checklistBox.querySelector('[id^="common-"]').id.split('-')[1]}`),
      meter: checklistBox.querySelector('.pw-checker-strength-meter'),
      indicator: checklistBox.querySelector('.pw-checker-strength-indicator'),
      label: checklistBox.querySelector('.pw-checker-strength-label'),
      probability: checklistBox.querySelector('.pw-checker-probability'),
      crackInfo: checklistBox.querySelector('.pw-checker-crack-info')
    };
  
    // Position near password input and hide initially
    checklistBox.style.display = 'none';
  
    // Show checklist on focus, hide on blur
    passwordInput.addEventListener('focus', () => {
      positionChecklist(checklistBox, passwordInput);
      checklistBox.style.display = 'block';
      setTimeout(() => {
        checklistBox.classList.add('visible');
      }, 10);
    });
  
    passwordInput.addEventListener('blur', () => {
      checklistBox.classList.remove('visible');
      setTimeout(() => {
        checklistBox.style.display = 'none';
      }, 300);
    });
  
    // Update on window resize
    window.addEventListener('resize', () => {
      if (document.activeElement === passwordInput) {
        positionChecklist(checklistBox, passwordInput);
      }
    });
  
    // Update checklist with debounce for API calls
    let debounceTimer;
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      // Check conditions
      const checks = {
        length: val.length >= 8,
        uppercase: /[A-Z]/.test(val),
        lowercase: /[a-z]/.test(val),
        number: /[0-9]/.test(val),
        special: /[\W_]/.test(val),
        common: val.length > 0 && !isCommonPassword(val)
      };
  
      // Update each item
      for (const key in checks) {
        updateChecklist(elements[key], checks[key]);
      }
  
      // Calculate strength
      const strengthScore = calculateStrength(val, checks);
      updateStrengthMeter(elements.meter, elements.indicator, elements.label, strengthScore);
      
      // Calculate crack probability
      const crackProbability = estimateCrackProbability(val);
      updateCrackInfo(elements.crackInfo, crackProbability);
    });
  }
  
  // Generate a random ID to ensure unique IDs for multiple password fields
  function generateId() {
    return Math.random().toString(36).substring(2, 10);
  }
  
  // Position the checklist relative to the password field
  function positionChecklist(checklistBox, passwordInput) {
    const rect = passwordInput.getBoundingClientRect();
    
    // Position below or above depending on space available
    const spaceBelow = window.innerHeight - rect.bottom - 10;
    const spaceNeeded = 240; // Approximate height of checklist
    
    if (spaceBelow >= spaceNeeded) {
      // Position below
      checklistBox.style.top = `${rect.bottom + window.scrollY + 10}px`;
    } else {
      // Position above
      checklistBox.style.top = `${rect.top + window.scrollY - 10 - spaceNeeded}px`;
    }
    
    // Horizontal positioning
    let leftPos = rect.left + window.scrollX;
    if (leftPos + 280 > window.innerWidth) {
      leftPos = window.innerWidth - 290;
    }
    checklistBox.style.left = `${leftPos}px`;
  }
  
  // Update checklist item status
  function updateChecklist(element, isMet) {
    if (isMet) {
      element.classList.remove('pw-checker-unmet');
      element.classList.add('pw-checker-met');
    } else {
      element.classList.add('pw-checker-unmet');
      element.classList.remove('pw-checker-met');
    }
  }
  
  // Calculate password strength score (0-100)
  function calculateStrength(password, checks) {
    if (!password) return 0;
    
    let score = 0;
    
    // Basic requirements (50%)
    if (checks.length) score += 10;
    if (checks.uppercase) score += 10;
    if (checks.lowercase) score += 10;
    if (checks.number) score += 10;
    if (checks.special) score += 10;
    
    // Length bonus (up to 25%)
    score += Math.min(25, password.length * 2);
    
    // Variety bonus (up to 25%)
    const uniqueChars = new Set(password).size;
    const varietyScore = (uniqueChars / password.length) * 25;
    score += varietyScore;
    
    // Not common password bonus
    if (checks.common) score += 10;
    
    // Cap at 100
    return Math.min(100, score);
  }
  
  // Update the strength meter UI
  function updateStrengthMeter(meterElement, indicatorElement, labelElement, score) {
    // Remove all classes first
    meterElement.classList.remove('pw-checker-strength-weak', 'pw-checker-strength-fair', 'pw-checker-strength-good', 'pw-checker-strength-strong');
    
    // Determine strength level
    let strengthClass, strengthText;
    
    if (score < 40) {
      strengthClass = 'pw-checker-strength-weak';
      strengthText = 'Weak';
    } else if (score < 60) {
      strengthClass = 'pw-checker-strength-fair';
      strengthText = 'Fair';
    } else if (score < 80) {
      strengthClass = 'pw-checker-strength-good';
      strengthText = 'Good';
    } else {
      strengthClass = 'pw-checker-strength-strong';
      strengthText = 'Strong';
    }
    
    // Update UI
    meterElement.classList.add(strengthClass);
    indicatorElement.style.width = `${score}%`;
    labelElement.textContent = strengthText;
    labelElement.className = `pw-checker-strength-label ${strengthClass}`;
  }
  
  // Check if a password is common
  function isCommonPassword(password) {
    // If commonPasswords global variable exists, use it
    if (typeof commonPasswords !== 'undefined') {
      return commonPasswords.includes(password.toLowerCase());
    }
    
    // Otherwise, fallback to a small list of very common passwords
    const mostCommonPasswords = [
      'password', '123456', 'qwerty', 'admin', 'welcome',
      'password123', '12345678', '123456789', 'abc123', '1234567890'
    ];
    
    return mostCommonPasswords.includes(password.toLowerCase());
  }
  
  // Estimate crack probability based on password features
  function estimateCrackProbability(password) {
    if (!password || password.length === 0) {
      return { strength: 0, probability: "N/A", message: "" };
    }
  
    // Calculate password features
    const features = {
      length: password.length,
      uppercase: (password.match(/[A-Z]/g) || []).length,
      lowercase: (password.match(/[a-z]/g) || []).length,
      digits: (password.match(/[0-9]/g) || []).length,
      special: (password.match(/[^a-zA-Z0-9]/g) || []).length,
      hasUpper: /[A-Z]/.test(password) ? 1 : 0,
      hasLower: /[a-z]/.test(password) ? 1 : 0,
      hasDigit: /[0-9]/.test(password) ? 1 : 0,
      hasSpecial: /[^a-zA-Z0-9]/.test(password) ? 1 : 0,
      variety: 0,
      entropy: 0
    };
  
    // Calculate character variety
    features.variety = features.hasUpper + features.hasLower + features.hasDigit + features.hasSpecial;
  
    // Calculate entropy
    const counts = {};
    for (const char of password) {
      counts[char] = (counts[char] || 0) + 1;
    }
    let entropy = 0;
    for (const char in counts) {
      const p = counts[char] / password.length;
      entropy -= p * Math.log2(p);
    }
    features.entropy = entropy;
  
    // Simple estimation model based on features
    let strengthScore = 0;
    
    // Length contributes up to 40 points
    strengthScore += Math.min(40, password.length * 2);
    
    // Character variety contributes up to 20 points
    strengthScore += features.variety * 5;
    
    // Presence of uppercase contributes 10 points
    strengthScore += features.hasUpper * 10;
    
    // Presence of digits contributes 10 points
    strengthScore += features.hasDigit * 10;
    
    // Presence of special chars contributes 20 points
    strengthScore += features.hasSpecial * 20;
    
    // Entropy bonus (up to 10 points)
    strengthScore += Math.min(10, entropy * 2);
  
    // Cap at 100
    strengthScore = Math.min(100, strengthScore);
  
    // Determine strength level and crack probability
    let strength, probability, message;
    
    if (strengthScore >= 80) {
      strength = 2; // Strong
      probability = "less than 25%";
      message = "Very difficult to crack - excellent password!";
    } else if (strengthScore >= 50) {
      strength = 1; // Medium
      probability = "more than 50%";
      message = "Could be stronger - consider adding more complexity";
    } else {
      strength = 0; // Weak
      probability = "more than 75%";
      message = "Easy to crack - please choose a stronger password";
    }
  
    return { strength, probability, message };
  }
  
  // Update crack probability information
  function updateCrackInfo(element, { probability, message }) {
    if (!element) return;
    
    if (probability === "N/A") {
      element.innerHTML = "";
      return;
    }
    
    element.innerHTML = `
      <div class="pw-checker-crack-probability">
        <strong>Crack Probability:</strong> ${probability}
      </div>
      <div class="pw-checker-crack-message">${message}</div>
    `;
  }