document.addEventListener('DOMContentLoaded', () => {
  const passwordInput = document.getElementById("password");
  const strengthMeter = document.getElementById("strength-meter");
  const strengthIndicator = document.getElementById("strength-indicator");
  const strengthLabel = document.getElementById("strength-label");
  const crackInfo = document.getElementById("crack-info");

  const checklistItems = {
    len: (pw) => pw.length >= 8,
    upper: (pw) => /[A-Z]/.test(pw),
    lower: (pw) => /[a-z]/.test(pw),
    number: (pw) => /[0-9]/.test(pw),
    special: (pw) => /[!@#\$%\^\&*\)\(+=._-]/.test(pw),
    space: (pw) => !/\s/.test(pw)
  };

  passwordInput.addEventListener("input", () => {
    const pw = passwordInput.value;
    let metCount = 0;
    const totalChecks = Object.keys(checklistItems).length;
    
    // Update each checklist item
    for (const id in checklistItems) {
      const element = document.getElementById(id);
      const valid = checklistItems[id](pw);
      
      if (valid) metCount++;
      
      // Update visuals with animation
      if (valid) {
        if (!element.classList.contains("checked")) {
          element.classList.add("checked");
          animateCheck(element);
        }
      } else {
        element.classList.remove("checked");
      }
    }
    
    // Calculate strength score
    const baseScore = Math.floor((metCount / totalChecks) * 100);
    const lengthBonus = Math.min(20, pw.length * 2);
    const uniqueChars = new Set(pw).size;
    const varietyBonus = pw.length > 0 ? Math.floor((uniqueChars / pw.length) * 20) : 0;
    
    let finalScore = Math.min(100, baseScore + lengthBonus + varietyBonus);
    if (pw.length === 0) finalScore = 0;
    
    // Update strength meter
    updateStrengthMeter(strengthMeter, strengthIndicator, strengthLabel, finalScore);
    
    // Update crack probability
    const crackProbability = estimateCrackProbability(pw);
    updateCrackInfo(crackInfo, crackProbability);
  });
  
  // Initial check
  passwordInput.dispatchEvent(new Event('input'));
  
  // Focus on password input
  passwordInput.focus();
});

// Animate the checkmark
function animateCheck(element) {
  element.style.transform = 'scale(1.2)';
  setTimeout(() => {
    element.style.transform = 'scale(1)';
  }, 200);
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
}

// Estimate crack probability based on password features
function estimateCrackProbability(password) {
  if (!password || password.length === 0) {
    return { probability: "N/A", message: "" };
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
  let probability, message;
  
  if (strengthScore >= 80) {
    probability = "less than 25%";
    message = "Very difficult to crack - excellent password!";
  } else if (strengthScore >= 50) {
    probability = "more than 50%";
    message = "Could be stronger - consider adding more complexity";
  } else {
    probability = "more than 75%";
    message = "Easy to crack - please choose a stronger password";
  }

  return { probability, message };
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