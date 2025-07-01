let selectedFood = null;
let foodLog = JSON.parse(localStorage.getItem('foodLog')) || [];

function switchTab(tabId) {
  document.querySelectorAll('main > section').forEach(section => {
    section.classList.toggle('active', section.id === tabId);
  });
   // Stop scanner when switching away from log tab
  if (tabId !== 'log' && window.Quagga && Quagga.stop) {
    Quagga.stop();
  }
}

function calculateMacros() {
  const age = parseInt(document.getElementById('age').value);
  const weight = parseFloat(document.getElementById('weight').value);
  const height = parseInt(document.getElementById('height').value);
  const gender = document.getElementById('gender').value;
  const goal = document.getElementById('goal').value;
  const activity = document.getElementById('activity').value;

  if (!age || !weight || !height || !gender || !goal || !activity) {
    alert('Please fill all fields.');
    return;
  }

  let bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  const activityFactor = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9
  }[activity];

  let calories = bmr * activityFactor;

  if (goal === 'lose') calories -= 500;
  else if (goal === 'gain') calories += 300;

  const protein = Math.round(weight * 2);
  const fat = Math.round((calories * 0.25) / 9);
  const proteinCals = protein * 4;
  const fatCals = fat * 9;
  const carbs = Math.round((calories - proteinCals - fatCals) / 4);

  document.getElementById('macroResult').textContent = `Daily Target: ${Math.round(calories)} kcal | Protein: ${protein}g | Carbs: ${carbs}g | Fat: ${fat}g`;

  const macroData = {
    calories: Math.round(calories),
    protein,
    carbs,
    fat
  };
  localStorage.setItem('macroGoals', JSON.stringify(macroData));

  updateDashboard();
}

function updateLoggedMeals() {
  const container = document.getElementById('loggedMeals');
  if (foodLog.length === 0) {
    container.innerHTML = '<p>No meals logged yet.</p>';
    return;
  }
  container.innerHTML = foodLog.map(item =>
    `<div style="border-bottom: 1px solid #ddd; padding: 0.5rem 0;">
      <strong>${item.name}</strong><br>
      Calories: ${item.calories} | Protein: ${item.protein}g | Carbs: ${item.carbs}g | Fat: ${item.fat}g
    </div>`
  ).join('');
}

function addFoodToLog() {
  if (!selectedFood) {
    alert('Please select a food item first.');
    return;
  }
  foodLog.push(selectedFood);
  localStorage.setItem('foodLog', JSON.stringify(foodLog));
  updateLoggedMeals();
  updateDashboard();
  alert(`Added ${selectedFood.name} to your log!`);
  selectedFood = null;
  document.getElementById('foodSearch').value = '';
  document.getElementById('foodResults').innerHTML = '';
}

function addManualFood() {
  const name = document.getElementById('manualName').value.trim();
  const calories = parseFloat(document.getElementById('manualCalories').value);
  const protein = parseFloat(document.getElementById('manualProtein').value);
  const carbs = parseFloat(document.getElementById('manualCarbs').value);
  const fat = parseFloat(document.getElementById('manualFat').value);

  if (!name || isNaN(calories) || isNaN(protein) || isNaN(carbs) || isNaN(fat)) {
    alert('Please enter valid values for all fields.');
    return;
  }

  const foodItem = { name, calories, protein, carbs, fat };

  // Add to manualFoods in localStorage
  const manualFoods = JSON.parse(localStorage.getItem('manualFoods')) || [];
  manualFoods.push(foodItem);
  localStorage.setItem('manualFoods', JSON.stringify(manualFoods));

  // Add to log and update UI
  foodLog.push(foodItem);
  localStorage.setItem('foodLog', JSON.stringify(foodLog));
  updateLoggedMeals();
  updateDashboard();
  
  alert(`Added ${name} to your log.`);

  // Clear form
  document.getElementById('manualName').value = '';
  document.getElementById('manualCalories').value = '';
  document.getElementById('manualProtein').value = '';
  document.getElementById('manualCarbs').value = '';
  document.getElementById('manualFat').value = '';
}


function clearLog() {
  if (confirm('Are you sure you want to clear the food log?')) {
    foodLog = [];
    localStorage.removeItem('foodLog');
    updateLoggedMeals();
    updateDashboard();
  }
}

const foodDB = [
  { name: 'Banana (medium)', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
  { name: 'Apple (medium)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: 'Orange (medium)', calories: 62, protein: 1.2, carbs: 15.4, fat: 0.2 },
  { name: 'Bread (1 slice)', calories: 80, protein: 3, carbs: 15, fat: 1 },
  { name: 'Rice (1 cup cooked)', calories: 206, protein: 4.3, carbs: 45, fat: 0.4 },
  { name: 'Oats (1 cup cooked)', calories: 158, protein: 6, carbs: 27, fat: 3.2 },
  { name: 'Milk (1 cup)', calories: 103, protein: 8, carbs: 12, fat: 2.4 },
  { name: 'Egg (large)', calories: 78, protein: 6, carbs: 0.6, fat: 5 },
  { name: 'Chicken Breast (100 g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Beef (100 g, cooked)', calories: 250, protein: 26, carbs: 0, fat: 15 },
  { name: 'Pork Chop (100 g)', calories: 231, protein: 27, carbs: 0, fat: 12 },
  { name: 'Fish (100 g, cooked)', calories: 206, protein: 22, carbs: 0, fat: 12 },
  { name: 'Shrimp (100 g)', calories: 99, protein: 24, carbs: 0, fat: 0.3 },
  { name: 'Cheddar Cheese (1 oz)', calories: 113, protein: 7, carbs: 0.4, fat: 9 },
  { name: 'Yogurt, plain (100 g)', calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3 },
  { name: 'Peanut Butter (2 tbsp)', calories: 190, protein: 8, carbs: 6, fat: 16 },
  { name: 'Almonds (1 oz)', calories: 164, protein: 6, carbs: 6, fat: 14 },
  { name: 'Avocado (half)', calories: 120, protein: 1.5, carbs: 6, fat: 10 },
  { name: 'Broccoli (1 cup cooked)', calories: 55, protein: 4, carbs: 11, fat: 0.6 },
  { name: 'Carrot (1 cup chopped)', calories: 52, protein: 1.2, carbs: 12, fat: 0.3 },
  { name: 'Lettuce (1 cup)', calories: 5, protein: 0.5, carbs: 1, fat: 0.1 },
  { name: 'Tomato (medium)', calories: 22, protein: 1.1, carbs: 4.8, fat: 0.2 },
  { name: 'Potato (medium, baked)', calories: 161, protein: 4.3, carbs: 37, fat: 0.2 },
  { name: 'Plantain (1 cup cooked)', calories: 215, protein: 2, carbs: 57, fat: 0.3 },
  { name: 'Ackee & Saltfish (1 cup)', calories: 340, protein: 20, carbs: 10, fat: 25 },
  { name: 'Fried Dumpling (1 med)', calories: 80, protein: 2, carbs: 15, fat: 1 },
  { name: 'Callaloo (1 cup cooked)', calories: 50, protein: 3, carbs: 6, fat: 1 },
  { name: 'Jerk Chicken (1 serving)', calories: 250, protein: 30, carbs: 2, fat: 12 },
  { name: 'Stew Peas (1 cup)', calories: 300, protein: 18, carbs: 30, fat: 10 },
  { name: 'Fried Plantain (1 slice)', calories: 68, protein: 0.5, carbs: 12, fat: 2 },
  { name: 'Rice & Peas (1 cup)', calories: 272, protein: 5, carbs: 50, fat: 7 },
  { name: 'Roti (1 piece)', calories: 210, protein: 4, carbs: 30, fat: 7 },
  { name: 'Coconut Water (1 cup)', calories: 46, protein: 0.2, carbs: 9, fat: 0.2 },
  { name: 'Coconut Milk (1 cup)', calories: 552, protein: 5, carbs: 13, fat: 57 },
  { name: 'Sugar (1 tsp)', calories: 16, protein: 0, carbs: 4, fat: 0 },
  { name: 'Honey (1 tbsp)', calories: 64, protein: 0.1, carbs: 17, fat: 0 },
  { name: 'Olive Oil (1 tbsp)', calories: 119, protein: 0, carbs: 0, fat: 13.5 },
  { name: 'Butter (1 tbsp)', calories: 102, protein: 0.1, carbs: 0, fat: 11.5 },
  { name: 'Rice Cakes (1 cake)', calories: 35, protein: 0.7, carbs: 7.3, fat: 0.3 },
  { name: 'Popcorn (1 cup popped)', calories: 31, protein: 1.0, carbs: 6.2, fat: 0.4 },
  { name: 'Coke (1 can)', calories: 140, protein: 0, carbs: 39, fat: 0 },
  { name: 'Beer (12 oz)', calories: 153, protein: 1.6, carbs: 13, fat: 0 },
  { name: 'Coffee (black, 8 oz)', calories: 2, protein: 0.3, carbs: 0, fat: 0 },
  { name: 'Tea (unsweetened)', calories: 2, protein: 0.1, carbs: 0, fat: 0 },
  { name: 'Orange Juice (1 cup)', calories: 112, protein: 1.7, carbs: 21, fat: 0.5 },
  { name: 'Yam (1 cup mashed)', calories: 177, protein: 2, carbs: 41, fat: 0.2 },
  { name: 'Sweet Potato (1 medium)', calories: 112, protein: 2, carbs: 26, fat: 0.1 },
  { name: 'Corn (1 cup cooked)', calories: 143, protein: 5.1, carbs: 31, fat: 2.2 },
  { name: 'Beans (1 cup cooked)', calories: 240, protein: 15, carbs: 43, fat: 1 },
  { name: 'Kidney Beans (1 cup)', calories: 225, protein: 15.3, carbs: 40.4, fat: 0.9 },
  { name: 'Lentils (1 cup cooked)', calories: 230, protein: 18, carbs: 40, fat: 0.8 },
  { name: 'Split Peas (1 cup cooked)', calories: 231, protein: 16, carbs: 40, fat: 0.8 },
  { name: 'Chickpeas (1 cup cooked)', calories: 269, protein: 14.5, carbs: 45, fat: 4.3 }
];

function selectFoodFromSearch(jsonStr) {
  selectedFood = JSON.parse(JSON.parse(jsonStr)); // Double-parse due to escaping
  document.getElementById('foodSearch').value = selectedFood.name;
  document.getElementById('foodResults').innerHTML = '';
}

function getCombinedFoodDB() {
  const manualFoods = JSON.parse(localStorage.getItem('manualFoods')) || [];
  return [...foodDB, ...manualFoods];
}

function searchFood() {
  const input = document.getElementById('foodSearch').value.trim().toLowerCase();
  const resultsContainer = document.getElementById('foodResults');

  if (!input) {
    resultsContainer.innerHTML = '';
    return;
  }

  fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(input)}&search_simple=1&action=process&json=1`)
    .then(res => res.json())
    .then(data => {
      const products = data.products.slice(0, 10); // Limit to top 10 results
      if (products.length === 0) {
      // API returned no results – fallback to combined local + manual food list
      const localResults = getCombinedFoodDB().filter(item =>
       item.name.toLowerCase().includes(input)
      );

      if (localResults.length === 0) {
        resultsContainer.innerHTML = '<p>No matching foods found.</p>';
        return;
      }

      resultsContainer.innerHTML = localResults.map(food =>
        `<div onclick="selectFood('${food.name}')" style="padding: 0.5rem; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 0.5rem;">
          <strong>${food.name}</strong><br>
          Calories: ${food.calories} | P: ${food.protein}g | C: ${food.carbs}g | F: ${food.fat}g
        </div>`
      ).join('');
      return;
    }


      resultsContainer.innerHTML = products.map(product => {
        const name = product.product_name || 'Unknown Product';
        const calories = parseFloat(product.nutriments['energy-kcal_100g']) || 0;
        const protein = parseFloat(product.nutriments.proteins_100g) || 0;
        const carbs = parseFloat(product.nutriments.carbohydrates_100g) || 0;
        const fat = parseFloat(product.nutriments.fat_100g) || 0;

        const foodItem = {
          name, calories, protein, carbs, fat
        };

        return `
          <div onclick='selectFoodFromSearch(${JSON.stringify(JSON.stringify(foodItem))})'
            style="padding: 0.5rem; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 0.5rem;">
            <strong>${name}</strong><br>
            Calories: ${calories} | P: ${protein}g | C: ${carbs}g | F: ${fat}g
          </div>`;
      }).join('');
    })
    .catch(err => {
      console.error(err);
      resultsContainer.innerHTML = '<p>Error fetching food data.</p>';
    });
}


function selectFood(name) {
  selectedFood = foodDB.find(f => f.name === name);
  document.getElementById('foodSearch').value = selectedFood.name;
  document.getElementById('foodResults').innerHTML = '';
}

// Barcode scanner setup
function loadQuagga(callback) {
  if (window.Quagga) {
    callback();
  } else {
    const quaggaScript = document.createElement('script');
    quaggaScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js';
    quaggaScript.onload = callback;
    document.body.appendChild(quaggaScript);
  }
}

function startScanner() {
  switchTab('log');
  const resultElement = document.getElementById('barcodeResult');
  const video = document.getElementById('barcodeScanner');

  Quagga.stop(); // Stop previous instance if any

  Quagga.init({
    inputStream: {
      name: 'Live',
      type: 'LiveStream',
      target:  document.querySelector('#barcodeScanner'),
      constraints: {
        facingMode: "environment",
        width: { ideal: 640 },
        height: { ideal: 360 }
      }
    },
    decoder: {
      readers:
       ['ean_reader',     // European Article Number (EAN-13)
      'upc_reader',       // UPC-A
      'upc_e_reader',     // UPC-E
      'code_128_reader',  // Code 128
      'code_39_reader'    // Code 39
      ]
    }
  }, function(err) {
    if (err) {
      console.error(err);
      resultElement.textContent = 'Scanner error.';
      return;
    }

    Quagga.start();
    resultElement.textContent = 'Scanning...';
  });

  Quagga.offDetected(); // Clear previous listener if any
  Quagga.onDetected(data => {
    const code = data.codeResult.code;
    resultElement.textContent = `Barcode Detected: ${code}`;
    Quagga.stop();

    fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 1) {
          const product = data.product;
          const foodItem = {
            name: product.product_name || 'Unknown Product',
            calories: parseFloat(product.nutriments['energy-kcal_100g']) || 0,
            protein: parseFloat(product.nutriments.proteins_100g) || 0,
            carbs: parseFloat(product.nutriments.carbohydrates_100g) || 0,
            fat: parseFloat(product.nutriments.fat_100g) || 0
          };

          selectedFood = foodItem;
          document.getElementById('foodSearch').value = foodItem.name;
          resultElement.textContent += `\nFound: ${foodItem.name}`;
        } else {
          resultElement.textContent += '\nProduct not found.';
        }
      })
      .catch(err => {
        console.error(err);
        resultElement.textContent += '\nError fetching product data.';
      });
  });
}
function stopScanner() {
  if (window.Quagga) {
    Quagga.stop();
    document.getElementById('barcodeResult').textContent = 'Scanner stopped.';
  }
}

function updateDashboard() {
  const macroGoals = JSON.parse(localStorage.getItem('macroGoals')) || {};

  document.getElementById('caloriesRemaining').textContent = 'Loading...';
  document.getElementById('proteinRemaining').textContent = 'Loading...';
  document.getElementById('carbsRemaining').textContent = 'Loading...';
  document.getElementById('fatRemaining').textContent = 'Loading...';

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  foodLog.forEach(item => {
    totalCalories += item.calories;
    totalProtein += item.protein;
    totalCarbs += item.carbs;
    totalFat += item.fat;
  });

  if (macroGoals.calories !== undefined) {
    document.getElementById('caloriesRemaining').textContent = `${Math.max(0, macroGoals.calories - totalCalories)} kcal (Consumed: ${totalCalories} kcal)`;
  } else {
    document.getElementById('caloriesRemaining').textContent = 'N/A';
  }
  if (macroGoals.protein !== undefined) {
    document.getElementById('proteinRemaining').textContent = `${Math.max(0, macroGoals.protein - totalProtein)} g (Consumed: ${totalProtein} g)`;
  } else {
    document.getElementById('proteinRemaining').textContent = 'N/A';
  }
  if (macroGoals.carbs !== undefined) {
    document.getElementById('carbsRemaining').textContent = `${Math.max(0, macroGoals.carbs - totalCarbs)} g (Consumed: ${totalCarbs} g)`;
  } else {
    document.getElementById('carbsRemaining').textContent = 'N/A';
  }
  if (macroGoals.fat !== undefined) {
    document.getElementById('fatRemaining').textContent = `${Math.max(0, macroGoals.fat - totalFat)} g (Consumed: ${totalFat} g)`;
  } else {
    document.getElementById('fatRemaining').textContent = 'N/A';
  }

  updateProgressChart();
}

let progressChart = null;
function updateProgressChart() {
  const canvas = document.getElementById('progressChart');
  if (!canvas) return; // safely exit if the element doesn't exist
  
  const ctx = canvas.getContext('2d');
  const macroGoals = JSON.parse(localStorage.getItem('macroGoals')) || {};

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  foodLog.forEach(item => {
    totalCalories += item.calories;
    totalProtein += item.protein;
    totalCarbs += item.carbs;
    totalFat += item.fat;
  });

  const consumedData = [
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat
  ];

  const goalData = [
    macroGoals.calories || 0,
    macroGoals.protein || 0,
    macroGoals.carbs || 0,
    macroGoals.fat || 0
  ];

  if (progressChart) {
    progressChart.data.datasets[0].data = consumedData;
    progressChart.data.datasets[1].data = goalData;
    progressChart.update();
  } else {
    progressChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)'],
        datasets: [
          {
            label: 'Consumed',
            data: consumedData,
            backgroundColor: 'rgba(54, 162, 235, 0.7)'
          },
          {
            label: 'Goal',
            data: goalData,
            backgroundColor: 'rgba(255, 99, 132, 0.7)'
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  updateLoggedMeals();
  updateDashboard();
});

function saveDailyHistory() {
  const today = new Date().toISOString().split('T')[0]; // e.g., "2025-07-01"
  const dailyData = {
    date: today,
    foodLog,
    totals: calculateTotals()
  };

  let history = JSON.parse(localStorage.getItem('dailyHistory')) || [];
  const alreadySaved = history.some(entry => entry.date === today);
  
  if (!alreadySaved) {
    history.push(dailyData);
    localStorage.setItem('dailyHistory', JSON.stringify(history));
    console.log('Daily history saved for:', today);
  }
}

function calculateTotals() {
  let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
  foodLog.forEach(item => {
    totalCalories += item.calories;
    totalProtein += item.protein;
    totalCarbs += item.carbs;
    totalFat += item.fat;
  });
  return { calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fat: totalFat };
}

window.addEventListener('beforeunload', () => {
  saveDailyHistory();
});

function displayHistoryLog() {
  const history = JSON.parse(localStorage.getItem('dailyHistory')) || [];
  const historyDiv = document.getElementById('historyLog');
  historyDiv.innerHTML = history.map(entry => `
    <div style="padding: 0.5rem; border-bottom: 1px solid #ccc;">
      <strong>${entry.date}</strong><br>
      Calories: ${entry.totals.calories}, Protein: ${entry.totals.protein}g, Carbs: ${entry.totals.carbs}g, Fat: ${entry.totals.fat}g
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', displayHistoryLog);
