//-------------------------------------- WATER APP -----------------------------------------------

//--------------------------- CLASS AND FUNCTIONS DEFINITION -------------------------------------

// Declaration of class of one water and constructor
class water {
  constructor({
    validationName,
    validationTemp,
    validationpH,
    validationTAC,
    validationCalcium,
    validationResidual,
    validationConductivity,
    validationResistivity,
    validationSulfate,
    validationChloride,
    validationRound,
  }) {
    this.WaterName = validationName;
    this.temperature = validationTemp;
    this.pH = validationpH;
    this.TAC = validationTAC;
    this.calcium = validationCalcium;
    this.DryResidual = validationResidual;
    this.conductivity = validationConductivity;
    this.resistivity = validationResistivity;
    this.sulfate = validationSulfate;
    this.cloride = validationChloride;
    this.roundnumber = validationRound;
  }

  HallopeauDubin() {
    // Calculation
    // Calculation of EP2 from Ionic Force
    function EP(DryResidual) {
      var IonicForce = DryResidual * 25 * Math.pow(10, -6);
      var EP1 = Math.sqrt(IonicForce) / (1 + 1.4 * Math.sqrt(IonicForce));
      var EP2 = EP1 * 2;
      var EP4 = (4 * Math.sqrt(IonicForce)) / (1 + 3.9 * Math.sqrt(IonicForce));
      return { EP1, EP2, EP4 };
    }
    // Calculation of equilibrium constant pk2 - according to Larson & Boswell
    let pK2 = (temperature) => {
      return (
        10.627 -
        15.04 * (temperature / 1000) +
        135.3 * Math.pow(temperature / 1000, 2) -
        328 * Math.pow(temperature / 1000, 3)
      );
    };
    // Calculation of pk'2
    let pK_2 = (pK2, EP2) => {
      return pK2 - EP2;
    };
    // Calculation of equilibrium constant pks - according to Larson & Boswell
    let pKs = (temperature) => {
      return (
        8.022 +
        14 * (temperature / 1000) -
        61 * Math.pow(temperature / 1000, 2) +
        444 * Math.pow(temperature / 1000, 3)
      );
    };
    // Calculation of pK's
    let pK_s = (pKs, EP4) => {
      return pKs - EP4;
    };
    // Calculation of C' - according to Hallopeau
    let C_ = (pK_2, pK_s) => {
      return pK_2 - pK_s + 9.195;
    };
    // Calculation of p parameter - according to Hallopeau
    function Lp(pH, pK_2) {
      var H_ions = Math.pow(10, -pH);
      var K_2 = Math.pow(10, -pK_2);
      var p = 1 + (2 * K_2) / H_ions;
      var Lp = Math.log10(p);
      return Lp;
    }
    // Calculation of pHs
    let pHs = (C_, TAC, calcium, Lp) => {
      return C_ - (Math.log10(TAC * 5.6) + Math.log10(calcium * 5.6)) + Lp;
    };
    // Calculation of LSI
    let LSI = (pH, pHs) => {
      return pH - pHs;
    };
    // Calculation of Ryznar (IR)
    let IR = (pH, calc_pHs) => {
      return 2 * calc_pHs - pH;
    };

    // Invoke functions created
    let calc_EP = EP(this.DryResidual);
    let cal_EP2 = calc_EP.EP2;
    let calc_EP4 = calc_EP.EP4;
    let calc_pK2 = pK2(this.temperature);
    let calc_pK_2 = pK_2(calc_pK2, cal_EP2);
    let calc_pKs = pKs(this.temperature);
    let calc_pK_s = pK_s(calc_pKs, calc_EP4);
    let calc_C_ = C_(calc_pK_2, calc_pK_s);
    let calc_Lp = Lp(this.pH, calc_pK_2);
    let calc_pHs = pHs(calc_C_, this.TAC, this.calcium, calc_Lp);
    let calc_LSI = LSI(this.pH, calc_pHs);
    let calc_IR = IR(this.pH, calc_pHs);

    // Create an object to hold all input values
    let inputValues = {
      WaterName: this.WaterName,
      temperature: this.temperature,
      pH: this.pH,
      TAC: this.TAC,
      calcium: this.calcium,
      DryResidual: this.DryResidual,
      conductivity: this.conductivity,
      resistivity: this.resistivity,
      sulfate: this.sulfate,
      cloride: this.cloride,
      roundnumber: this.roundnumber,
    };

    // Create an object to hold all the computed results
    let computedResults = {
      EP1: calc_EP.EP1.toFixed(this.roundnumber),
      EP2: cal_EP2.toFixed(this.roundnumber),
      EP4: calc_EP4.toFixed(this.roundnumber),
      pK2: calc_pK2.toFixed(this.roundnumber),
      pK_2: calc_pK_2.toFixed(this.roundnumber),
      pKs: calc_pKs.toFixed(this.roundnumber),
      pK_s: calc_pK_s.toFixed(this.roundnumber),
      C_: calc_C_.toFixed(this.roundnumber),
      Lp: calc_Lp.toFixed(this.roundnumber),
      pHs: calc_pHs.toFixed(this.roundnumber),
      LSI: calc_LSI.toFixed(this.roundnumber),
      IR: calc_IR.toFixed(this.roundnumber),
    };

    // Set the computed results as a property of the class
    this.computedResults = computedResults;

    return { inputValues, computedResults };
  }

  // Meaning o LSI
  LSI_Meaning_() {
    let riskValue;
    let Meaning;
    if (this.computedResults.LSI < -0.1) {
      Meaning =
        "According to Langelier Index there is a risk of corrosion (to limestone)";
      riskValue = 2;
    } else if (
      this.computedResults.LSI >= -0.1 &&
      this.computedResults.LSI <= 0.1
    ) {
      Meaning =
        "According to Langelier Index the water is at the equilibrium point";
      riskValue = 0;
    } else if (this.computedResults.LSI > 0.1) {
      Meaning = "According to Langelier Index there is a risk of inscrutation";
      riskValue = 2;
    } else {
      Meaning = "Error in calculating the Langelier Index";
    }
    return { Meaning, riskValue };
  }

  // Meaning of IR
  IR_Meaning_() {
    let riskValue;
    let Meaning;
    if (this.computedResults.IR <= 5) {
      Meaning =
        "According to Ryznar Index there is a high risk of incrustation";
      riskValue = 2;
    } else if (this.computedResults.IR > 5 && this.computedResults.IR <= 6) {
      Meaning =
        "According to Ryznar Index there is a risk of incrustation of heating pipes (Temperature> 60ºC)";
      riskValue = 1;
    } else if (this.computedResults.IR > 6 && this.computedResults.IR <= 6.5) {
      Meaning = "According to Ryznar Index there is a low risk of incrustation";
      riskValue = 0;
    } else if (
      this.computedResults.IR > 6.5 &&
      this.computedResults.IR <= 7.2
    ) {
      Meaning = "According to Ryznar Index there is a low risk of corrosion";
      riskValue = 0;
    } else if (
      this.computedResults.IR > 7.2 &&
      this.computedResults.IR <= 7.8
    ) {
      Meaning =
        "According to Ryznar Index there is a moderate risk of corrosion (high if Temperature> 60ºC)";
      riskValue = 1;
    } else if (
      this.computedResults.IR > 7.8 &&
      this.computedResults.IR <= 8.5
    ) {
      Meaning =
        "According to Ryznar Index there is a high risk of corrosion (very high if Temperature> 15ºC)";
      riskValue = 2;
    } else if (this.computedResults.IR > 8.5) {
      Meaning =
        "According to Ryznar Index there is a very high risk of corrosion";
      riskValue = 3;
    } else {
      Meaning = "Error in calculating the Ryznar Index";
    }
    return { Meaning, riskValue };
  }

  PrintResults() {
    let LSI_Meaning = this.LSI_Meaning_().Meaning;
    let IR_Meaning = this.IR_Meaning_().Meaning;

    //Display results
    let results = document.getElementById("Results");
    results.innerHTML = `
        <p>pHs: ${this.computedResults.pHs}</p>
        <p>LSI: ${this.computedResults.LSI} <br>${LSI_Meaning}</p>
        <p>IR: ${this.computedResults.IR}<br>${IR_Meaning}</p>
        `;
  }
}

//------------------------------------------------------------------------------------------------
//------------------------------------ FORM VALIDATION -------------------------------------------

//----------------------------------- FUNCTIONS DEFINITION ---------------------------------------
// check if greater than a value
function isGreaterThan(x, min) {
  return x > min;
}
// check if within a certain range
function inRange(x, min, max) {
  return (x - min) * (x - max) <= 0;
}

// check validity of elements from form
function checkElementValidity(elementId) {
  let element = document.getElementById(elementId);
  if (!element) return true; // Skip if the element does not exist

  let value = parseFloat(element.value);
  let condition;

  // Check validity for optional fields
  let optionalFields = [
    "validationResidual",
    "validationConductivity",
    "validationResistivity",
    "validationSulfate",
    "validationChloride",
  ];
  if (optionalFields.includes(elementId)) {
    // For optional elements if empty or positive, it's valid.
    if (element.value.trim() === "" || isGreaterThan(value, 0)) {
      return Validate(element, true);
    } else {
      return Validate(element, false);
    }
  }
  // Check validity for the other fields based on the conditions below
  switch (elementId) {
    case "validationName":
      condition = element.value.trim() !== "";
      break;
    case "validationTemp":
      condition = isGreaterThan(value, 0);
      break;
    case "validationpH":
      condition = inRange(value, 5, 10);
      break;
    case "validationCalcium":
      condition = isGreaterThan(value, 0);
      break;
    case "validationTAC":
      condition = inRange(value, 0.5, 100);
      break;
    case "validationRound":
      condition = inRange(value, 1, 4);
      break;
    default:
      condition = element.value.trim() !== "" && isFinite(value); //remove spaces before checking that is not empty and then if they are finite values.
      break;
  }
  // Use the validate function for the element
  Validate(element, condition);
  return condition;
}

// Function to change css based on validation
function Validate(FormItem, condition) {
  validationText = FormItem.closest(".col-md-6").querySelector(".form-text");
  if (condition) {
    FormItem.classList.remove("is-invalid");
    FormItem.classList.add("is-valid");
    validationText && validationText.classList.remove("text-danger");
    validationText && validationText.classList.add("text-muted");
  } else {
    FormItem.classList.remove("is-valid");
    FormItem.classList.add("is-invalid");
    validationText && validationText.classList.remove("text-muted");
    validationText && validationText.classList.add("text-danger");
  }
  return condition;
}
// Function to retrieve data from localStorage
function getDataFromLocalStorage(dataName) {
  return JSON.parse(localStorage.getItem(dataName)) || [];
}
//Function to populate the Bootstrap table with data - Need JQUERY
function populateTableWithData(idTable, data) {
  $(idTable).bootstrapTable("load", data);
}


//----------------------------------- APPLY FUNCTIONS ---------------------------------------
// Declare allWaters variable
let allWaters = [];
//allWaters = getDataFromLocalStorage("watersData");

// Populate the table when the DOM is loaded
$(document).ready(function () {
  allWaters = getDataFromLocalStorage("watersData");
  populateTableWithData("#tableHD", allWaters);
});

// On submit check the validity of all the inputs
document
  .getElementById("FormHallopeau")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    let form = document.getElementById("FormHallopeau");
    let inputElements = form.querySelectorAll("input");
    let allValid = true;

    for (let input of inputElements) {
      let isValid = checkElementValidity(input.id);
      allValid = allValid && isValid;
    }

    if (allValid) {
      console.log("Form is valid!");
      // Retrieve and parse the form data from numerical and text value
      let formData = {};
      inputElements.forEach((input) => {
        formData[input.id] = isNaN(parseFloat(input.value))
          ? input.value.trim()
          : parseFloat(input.value);
      });
      //console.log(formData);

      // Create an instance of the water class
      let waterSample = new water(formData);
      // Call HallopeauDubin and PrintResults
      let results = waterSample.HallopeauDubin();
      waterSample.PrintResults();
      console.log("Water results are computed");
      let inputAndResults = {
        ...results.inputValues,
        ...results.computedResults,
      };

      allWaters.push(inputAndResults);
      // Saving to LocalStorage
      localStorage.setItem("watersData", JSON.stringify(allWaters));
      // Populate the Bootstrap Table after adding data
      populateTableWithData("#tableHD", allWaters);

      Toastify({
        text: "Water values computed and added to the table",
        duration: 3000,
      }).showToast();
    } else {
      console.log("Form is invalid. Correct the errors.");
    }
  });

// check validity When typing in an input
document
  .getElementById("FormHallopeau")
  .addEventListener("keyup", function (event) {
    let targetId = event.target.id;
    checkElementValidity(targetId);
  });

//----------------------------------- APPLY FUNCTIONS FOR BS TABLE ---------------------------------------
// From boostrap custom sort JS
function customSort(sortName, sortOrder, data) {
  var order = sortOrder === "desc" ? -1 : 1;
  data.sort(function (a, b) {
    var aa = +(a[sortName] + "").replace(/[^\d]/g, "");
    var bb = +(b[sortName] + "").replace(/[^\d]/g, "");
    if (aa < bb) {
      return order * -1;
    }
    if (aa > bb) {
      return order;
    }
    return 0;
  });
}

// icons for table from box icon
window.icons = {
  detailOpen: "bx bx-plus",
  detailClose: "bx bx-minus",
  refresh: "bx bx-refresh",
  columns: "bx bx-list-check",
  fullscreen: "bx bx-expand",
};
// From boostrap custom expand row with all values
function detailFormatter(index, row) {
  var html = [];
  $.each(row, function (key, value) {
    html.push('<p class="m-0"><b>' + key + ":</b> " + value + "</p>");
  });
  return html.join("");
}
