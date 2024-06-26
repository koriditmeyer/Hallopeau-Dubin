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

  // Computation of DryResidual according to conductivity
  DryResidual_conduc(conductivity) {
    let DryResidual_cond;
    if (inRange(conductivity, 0, 50)) {
      DryResidual_cond = conductivity * 1.365079;
    } else if (inRange(conductivity, 50, 166)) {
      DryResidual_cond = conductivity * 0.947658;
    } else if (inRange(conductivity, 166, 333)) {
      DryResidual_cond = conductivity * 0.769574;
    } else if (inRange(conductivity, 333, 833)) {
      DryResidual_cond = conductivity * 0.71592;
    } else if (inRange(conductivity, 833, 10000)) {
      DryResidual_cond = conductivity * 0.758544;
    } else if (isGreaterThan(conductivity, 10000)) {
      DryResidual_cond = conductivity * 0.850432;
    }
    return DryResidual_cond;
  }
  // convert Resistivity to conductivity and conductivity to resistivity
  Cond_Res(parameter) {
    return 1000000 / parameter;
  }

  // Calculation of Dry residual if not entered
  DryResidual_(DryResidual, conductivity, resistivity) {
    // Computation of DryResidual according to DryResidual, conductivity and resistivity
    let DryResidual_Final;
    if (DryResidual) {
      DryResidual_Final = DryResidual;
      //console.log("Residual" + DryResidual_Final);
    } else if (conductivity && !resistivity) {
      DryResidual_Final = this.DryResidual_conduc(conductivity);
      //console.log("cond" + DryResidual_Final);
    } else if (resistivity && !conductivity) {
      let conductivity_calc = this.Cond_Res(resistivity);
      DryResidual_Final = this.DryResidual_conduc(conductivity_calc);
      //console.log("res" + DryResidual_Final);
    }

    return DryResidual_Final;
  }

  // Calculation of EP from Ionic Force
  EP(DryResidual) {
    var IonicForce = DryResidual * 25 * Math.pow(10, -6);
    var EP1 = Math.sqrt(IonicForce) / (1 + 1.4 * Math.sqrt(IonicForce));
    var EP2 = EP1 * 2;
    var EP4 = (4 * Math.sqrt(IonicForce)) / (1 + 3.9 * Math.sqrt(IonicForce));
    return { EP1, EP2, EP4 };
  }
  // Calculation of equilibrium constant pk1 - according to Larson & Boswell
  pK1(temperature) {
    return (
      6.583 -
      12.3 * (temperature / 1000) +
      163.5 * Math.pow(temperature / 1000, 2) -
      646 * Math.pow(temperature / 1000, 3)
    );
  }
  // Calculation of pk'1
  pK_1(pK1, EP1) {
    return pK1 - EP1;
  }

  // Calculation of equilibrium constant pk2 - according to Larson & Boswell
  pK2(temperature) {
    return (
      10.627 -
      15.04 * (temperature / 1000) +
      135.3 * Math.pow(temperature / 1000, 2) -
      328 * Math.pow(temperature / 1000, 3)
    );
  }
  // Calculation of pk'2
  pK_2(pK2, EP2) {
    return pK2 - EP2;
  }
  // Calculation of equilibrium constant pks - according to Larson & Boswell
  pKs = (temperature) => {
    return (
      8.022 +
      14 * (temperature / 1000) -
      61 * Math.pow(temperature / 1000, 2) +
      444 * Math.pow(temperature / 1000, 3)
    );
  };
  // Calculation of pK's
  pK_s(pKs, EP4) {
    return pKs - EP4;
  }
  // Calculation of p parameter - according to Hallopeau

  Lp(pH, pK_2) {
    var H_ions = Math.pow(10, -pH);
    var K_2 = Math.pow(10, -pK_2);
    var p = 1 + (2 * K_2) / H_ions;
    var Lp = Math.log10(p);
    return Lp;
  }

  // Calculation of C' - according to Hallopeau
  C_(pK_2, pK_s) {
    return pK_2 - pK_s + 9.195; //view which is correct
  }

  HallopeauDubin(
    WaterName,
    TAC,
    temperature,
    pH,
    calcium,
    DryResidual,
    conductivity,
    resistivity,
    sulfate,
    cloride,
    roundnumber
  ) {
    // Calculation
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

    // Calculation of CO2
    let CO2 = (TAC, pK_1, pH, Lp) => {
      return Math.pow(10, 0.2 + pK_1 + Math.log10(TAC * 5.6) - pH - Lp);
    };

    // Calculation of LR
    let LR = (cloride, sulfate, TAC) => {
      return (
        (cloride / 1000 / 35.5 + (2 * (sulfate / 1000)) / 96) /
        ((TAC * 12.2) / 1000 / 61)
      );
    };
    // Calculation of Equilibrium pH

    // Calculation of CO2 at equilibrium
    // Calculation of TAC at equilibrium
    // Calculation of CCPP at equilibrium

    // Invoke functions created
    let calc_DryResidual = this.DryResidual_(
      DryResidual,
      conductivity,
      resistivity
    );
    let calc_EP = this.EP(calc_DryResidual);
    let calc_EP1 = calc_EP.EP1;
    let calc_EP2 = calc_EP.EP2;
    let calc_EP4 = calc_EP.EP4;
    let calc_pK1 = this.pK1(temperature);
    let calc_pK_1 = this.pK_1(calc_pK1, calc_EP1);
    let calc_pK2 = this.pK2(temperature);
    let calc_pK_2 = this.pK_2(calc_pK2, calc_EP2);
    let calc_pKs = this.pKs(temperature);
    let calc_pK_s = this.pK_s(calc_pKs, calc_EP4);
    let calc_C_ = this.C_(calc_pK_2, calc_pK_s);
    let calc_Lp = this.Lp(pH, calc_pK_2);
    let calc_pHs = pHs(calc_C_, TAC, calcium, calc_Lp);
    let calc_LSI = LSI(pH, calc_pHs);
    let calc_IR = IR(pH, calc_pHs);
    let calc_LR = LR(cloride, sulfate, TAC);
    let calc_CO2 = CO2(TAC, calc_pK_1, pH, calc_Lp);
    let calc_Lp_eq = this.Lp(calc_pHs, calc_pK_2);
    let calc_CO2_eq = CO2(TAC, calc_pK_1, calc_pHs, calc_Lp_eq);

    // Create an object to hold all input values
    let inputValues = {
      WaterName: WaterName,
      temperature: temperature,
      pH: pH,
      TAC: TAC,
      calcium: calcium,
      DryResidual: DryResidual,
      conductivity: conductivity,
      resistivity: resistivity,
      sulfate: sulfate,
      cloride: cloride,
      roundnumber: roundnumber,
    };

    //Special for LR
    let calc_LR_save;
    if (cloride.length === 0 || sulfate.length === 0) {
      calc_LR_save = "";
    } else {
      calc_LR_save = calc_LR.toFixed(roundnumber);
    }

    // Create an object to hold all the computed results
    let computedResults = {
      EP1: calc_EP1.toFixed(roundnumber),
      EP2: calc_EP2.toFixed(roundnumber),
      EP4: calc_EP4.toFixed(roundnumber),
      pK1: calc_pK1.toFixed(roundnumber),
      pK_1: calc_pK_1.toFixed(roundnumber),
      pK2: calc_pK2.toFixed(roundnumber),
      pK_2: calc_pK_2.toFixed(roundnumber),
      pKs: calc_pKs.toFixed(roundnumber),
      pK_s: calc_pK_s.toFixed(roundnumber),
      C_: calc_C_.toFixed(roundnumber),
      Lp: calc_Lp.toFixed(roundnumber),
      pHs: calc_pHs.toFixed(roundnumber),
      LSI: calc_LSI.toFixed(roundnumber),
      IR: calc_IR.toFixed(roundnumber),
      LR: calc_LR_save,
      CO2: calc_CO2.toFixed(roundnumber),
      CO2eq: calc_CO2_eq.toFixed(roundnumber),
    };

    // Set the computed results as a property of the class
    this.computedResults = computedResults;

    return { inputValues, computedResults };
  }

  HallopeauDubin_(TAC, temperature, calcium, DryResidual, roundnumber) {
    // Calculation
    // Calculation of pHs simplified
    let pHs_ = (C_, TAC, calcium) => {
      return C_ - (Math.log10(TAC * 5.6) + Math.log10(calcium * 5.6)); // ignore Lp value
    };

    // Invoke functions created
    let calc_EP = this.EP(DryResidual);
    let calc_EP2 = calc_EP.EP2;
    let calc_EP4 = calc_EP.EP4;
    let calc_pK2 = this.pK2(temperature);
    let calc_pK_2 = this.pK_2(calc_pK2, calc_EP2);
    let calc_pKs = this.pKs(temperature);
    let calc_pK_s = this.pK_s(calc_pKs, calc_EP4);
    let calc_C_ = this.C_(calc_pK_2, calc_pK_s);
    let calc_pHs_ = pHs_(calc_C_, TAC, calcium);

    // console.log(calc_EP2);
    // console.log(calc_EP4);
    // console.log(calc_pK2);
    // console.log(calc_pK_2);
    // console.log(calc_pKs);
    // console.log(calc_pK_s);
    // console.log(calc_C_);
    // console.log(calc_pHs_);
    // Create an object to hold all the computed results
    let pHs_Results = {
      temperature: temperature.toFixed(roundnumber),
      TAC: TAC.toFixed(roundnumber),
      pHs_: calc_pHs_.toFixed(roundnumber),
    };

    // Set the computed results as a property of the class
    this.pHs_Results = pHs_Results;
    return { pHs_Results };
  }

  CO2pHcurves(
    temperature,
    TAC,
    CO2,
    DryResidual,
    conductivity,
    resistivity,
    roundnumber
  ) {
    // Calculation of pH according to fixed CO2 value and variable TAC
    let pHf = (CO2, TAC, pK_1) => {
      return 0.2 + pK_1 + Math.log10(TAC * 5.6) - Math.log10(CO2); // ignore the LP value
    };
    // Invoke functions created
    let calc_DryResidual = this.DryResidual_(
      DryResidual,
      conductivity,
      resistivity
    );
    let calc_EP = this.EP(calc_DryResidual);
    let calc_EP1 = calc_EP.EP1;
    let calc_pK1 = this.pK1(temperature);
    let calc_pK_1 = this.pK_1(calc_pK1, calc_EP1);
    let calc_pH = pHf(CO2, TAC, calc_pK_1);

    // console.log(calc_DryResidual);
    // console.log(calc_EP1);
    // console.log(calc_pK1);
    // console.log(calc_pK_1);
    // console.log(calc_pH);
    // Create an object to hold all the computed results
    let CO2pHCurve = {
      temperature: temperature.toFixed(roundnumber),
      CO2: CO2,
      TAC: TAC.toFixed(roundnumber),
      pH: calc_pH.toFixed(roundnumber),
    };

    // Set the computed results as a property of the class
    this.CO2pHCurve = CO2pHCurve;

    return { CO2pHCurve };
  }

  CO2TACcurves(
    temperature,
    CO2,
    pH,
    DryResidual,
    conductivity,
    resistivity,
    roundnumber
  ) {
    // Calculation of TAC according to fixed CO2 value and variable pH
    let TAC = (CO2, pH, pK_1, Lp) => {
      return Math.pow(10, -0.2 - pK_1 + pH + Lp + Math.log10(CO2)) / 5.6;
    };
    // Invoke functions created
    let calc_DryResidual = this.DryResidual_(
      DryResidual,
      conductivity,
      resistivity
    );
    let calc_EP = this.EP(calc_DryResidual);
    let calc_EP1 = calc_EP.EP1;
    let calc_EP2 = calc_EP.EP2;
    let calc_pK1 = this.pK1(temperature);
    let calc_pK_1 = this.pK_1(calc_pK1, calc_EP1);
    let calc_pK2 = this.pK2(temperature);
    let calc_pK_2 = this.pK_2(calc_pK2, calc_EP2);
    let calc_Lp = this.Lp(pH, calc_pK_2);
    let calc_TAC = TAC(CO2, pH, calc_pK_1, calc_Lp);

    // console.log(calc_DryResidual);
    // console.log(calc_EP1);
    // console.log(calc_EP2);
    // console.log(calc_pK1);
    // console.log(calc_pK_1);
    // console.log(calc_pK2);
    // console.log(calc_pK_2);
    // console.log(calc_Lp);
    // console.log(calc_TAC);
    // Create an object to hold all the computed results
    let CO2TACCurve = {
      temperature: temperature.toFixed(roundnumber),
      CO2: CO2,
      pH: pH.toFixed(roundnumber),
      TAC: calc_TAC.toFixed(roundnumber),
    };

    // Set the computed results as a property of the class
    this.CO2TACCurve = CO2TACCurve;

    return { CO2TACCurve };
  }
  // Meaning o LSI
  LSI_Meaning_(LSI) {
    let riskValue;
    let Meaning;
    if (LSI < -0.1) {
      Meaning = "Risk of corrosion (to limestone)";
      riskValue = 2;
    } else if (LSI >= -0.1 && LSI <= 0.1) {
      Meaning = "Water is at the equilibrium point";
      riskValue = 0;
    } else if (LSI > 0.1) {
      Meaning = "Risk of inscrutation";
      riskValue = 2;
    } else {
      Meaning = "Error in calculating the Langelier Index";
    }
    return { Meaning, riskValue };
  }

  LSI_Meaning_Carrier_(LSI) {
    let Meaning;
    let riskValue;
    if (LSI >= 0.5) {
      Meaning = "Scale forming but non corrosive.";
      riskValue = 2;
    } else if (LSI < 0.5 && LSI > 0) {
      Meaning = "Slightly scale forming and corrosive.";
      riskValue = 1;
    } else if (LSI == 0) {
      Meaning = "Balanced but pitting corrosion possible.";
      riskValue = 0;
    } else if (LSI < 0 && LSI >= -0.5) {
      Meaning = "Slightly corrosive but non-scale forming.";
      riskValue = 1;
    } else if (LSI < -0.5) {
      Meaning = "Serious corrosion.";
      riskValue = 2;
    } else {
      Meaning = "Error in calculating the Langelier Index";
    }
    return { Meaning, riskValue };
  }

  // Meaning of IR
  IR_Meaning_(IR) {
    let riskValue;
    let Meaning;
    if (IR <= 5.5) {
      Meaning = "High risk of incrustation";
      riskValue = 2;
    } else if (IR > 5.5 && IR <= 6.2) {
      Meaning = "Risk of incrustation";
      riskValue = 1;
    } else if (IR > 6.2 && IR <= 6.8) {
      Meaning = "Low risk of incrustation or corrosion";
      riskValue = 0;
    } else if (IR > 6.8 && IR <= 8.5) {
      Meaning = "Moderate risk of corrosion";
      riskValue = 1;
    } else if (IR > 8.5) {
      Meaning = "High risk of corrosion";
      riskValue = 2;
    } else {
      Meaning = "Error in calculating the Ryznar Index";
    }
    return { Meaning, riskValue };
  }

  // Meaning of IR Carrier
  IR_Meaning_Carrier_(IR) {
    let riskValue;
    let Meaning;
    if (IR <= 5) {
      Meaning = "High risk of incrustation";
      riskValue = 2;
    } else if (IR > 5 && IR <= 6) {
      Meaning = "Risk of incrustation of heating pipes (Temperature> 60ºC)";
      riskValue = 1;
    } else if (IR > 6 && IR <= 7.0) {
      Meaning = "Low risk of incrustation or corrosion";
      riskValue = 0;
    } else if (IR > 7.0 && IR <= 7.5) {
      Meaning = "Moderate risk of corrosion (high if Temperature> 60ºC)";
      riskValue = 1;
    } else if (IR > 7.5 && IR <= 9.0) {
      Meaning = "High risk of corrosion (very high if Temperature> 15ºC)";
      riskValue = 2;
    } else if (IR > 9.0) {
      Meaning = "Very high risk of corrosion";
      riskValue = 2;
    } else {
      Meaning = "Error in calculating the Ryznar Index";
    }
    return { Meaning, riskValue };
  }

  // Meaning of LR
  LR_Meaning_(LR) {
    let riskValue;
    let Meaning;
    if (LR.length === 0) {
      Meaning =
        "Error in calculating the Larson Ratio <br>(please input sulfate, cloride and TAC)";
    } else if (LR <= 0.2) {
      Meaning = "No tendency to metal corrosion";
      riskValue = 0;
    } else if (LR >= 0.2 && LR < 0.4) {
      Meaning = "Low tendency to metal corrosion";
      riskValue = 0;
    } else if (LR >= 0.4 && LR < 1.0) {
      Meaning = "Moderate tendency to metal corrosion";
      riskValue = 1;
    } else if (LR >= 1) {
      Meaning = "High tendency to metal corrosion";
      riskValue = 2;
    } else {
      Meaning = "Error in calculating the Larson Ratio";
    }
    return { Meaning, riskValue };
  }

  //Badge color
  Badge_color(risk) {
    let badgeCss;
    let color = {
      colorNormal: "text-bg-light",
      colorSucess: "text-bg-success",
      colorWarning: "text-bg-warning",
      colorDanger: "text-bg-danger",
    };
    switch (risk) {
      case 0:
        badgeCss = color.colorSucess;
        break;
      case 1:
        badgeCss = color.colorWarning;
        break;
      case 2:
        badgeCss = color.colorDanger;
        break;
      default:
        badgeCss = color.colorNormal;
    }
    return badgeCss;
  }

  Badge_value(ElementId, BadgeColorComputation, BadgeValue) {
    let element = document.getElementById(ElementId);
    let BadgeCss = this.Badge_color(BadgeColorComputation);
    element.classList.remove(
      "text-bg-light",
      "text-bg-success",
      "text-bg-warning",
      "text-bg-danger"
    );
    element.classList.add(BadgeCss);
    element.innerHTML = `${BadgeValue}`;
  }
  //LSI-result-badge
  //LSI-meaning-Langelier-badge
  //LSI-meaning-Carrier-badge
  PrintResults(LSI, IR, LR) {
    //let {Meaning:LSI_Meaning_Carrier , riskValue:LSI_Carrier_Risk } = this.LSI_Meaning_Carrier(LSI).Meaning;
    //let IR_Meaning = this.IR_Meaning_(IR).Meaning;
    //Display results
    // LSI
    let { Meaning: LSI_Meaning, riskValue: LSI_Risk } = this.LSI_Meaning_(LSI);
    let { Meaning: LSI_Meaning_Carrier, riskValue: LSI_Risk_Carrier } =
      this.LSI_Meaning_Carrier_(LSI);
    this.Badge_value("LSI-result-badge", LSI_Risk, this.computedResults.LSI);
    this.Badge_value("LSI-meaning-Langelier-badge", LSI_Risk, LSI_Meaning);
    this.Badge_value(
      "LSI-meaning-Carrier-badge",
      LSI_Risk_Carrier,
      LSI_Meaning_Carrier
    );
    // Riznar
    let { Meaning: RI_Meaning, riskValue: RI_Risk } = this.IR_Meaning_(IR);
    let { Meaning: RI_Meaning_Carrier, riskValue: RI_Risk_Carrier } =
      this.IR_Meaning_Carrier_(IR);
    this.Badge_value("RI-result-badge", RI_Risk, this.computedResults.IR);
    this.Badge_value("RI-meaning-badge", RI_Risk, RI_Meaning);
    this.Badge_value(
      "RI-meaning-Carrier-badge",
      RI_Risk_Carrier,
      RI_Meaning_Carrier
    );
    // Larson
    let { Meaning: LR_Meaning, riskValue: LR_Risk } = this.LR_Meaning_(LR);
    this.Badge_value("LR-result-badge", LR_Risk, this.computedResults.LR);
    this.Badge_value("LR-meaning-badge", LR_Risk, LR_Meaning);
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
      condition = inRange(value, 0, 81);
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
  validationText =
    FormItem.closest(".js-input-val").querySelector(".form-text");
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

// function to save data to json file
function saveJSON(data) {
  // Convert the array to a JSON string
  const jsonData = JSON.stringify(data);

  // Create a Blob object with the JSON data
  const blob = new Blob([jsonData], { type: "application/json" });

  // Create a URL for the Blob
  const url = window.URL.createObjectURL(blob);

  // Create a link element to trigger the download
  const a = document.createElement("a");
  a.href = url;
  a.download = "output.json";

  // Trigger the click event to start the download
  a.click();

  // Clean up resources
  window.URL.revokeObjectURL(url);
}

//function to retreive data from json file with Fetch
function GetJson(location) {
  // Return the promise created by the fetch call
  return fetch(location)
    .then((resp) => {
      if (!resp.ok) {
        throw new Error("Network response was not ok");
      }
      return resp.json();
    })
    .catch((error) => {
      console.error("Error fetching JSON: ", error);
    });
}

//function to find intersection of two curves
function findIntersection(curve1, curve2, tolerance, property1, property2) {
  let intersectionPoint = null;

  // for (let i = 0; i < curve1.length; i++) {
  //   const x = +curve1[i][property1];
  //   const y1 = +curve1[i][property2];
  //   const y2 = +curve2[i][property2];
  //   const diff = Math.abs(y1 - y2);
  //   if (diff <= tolerance) {
  //     intersectionPoint = {};
  //     intersectionPoint[property1] = x;
  //     intersectionPoint[property2] = (y1 + y2) / 2;
  //     return intersectionPoint;
  //   }
  // }
  // with interpolation
  for (let i = 1; i < curve1.length; i++) {
    const x1 = +curve1[i - 1][property1];
    const y1_1 = +curve1[i - 1][property2];
    const y1_2 = +curve1[i][property2];

    for (let j = 1; j < curve2.length; j++) {
      const x2_1 = +curve2[j - 1][property1];
      const y2_1 = +curve2[j - 1][property2];
      const x2_2 = +curve2[j][property1];
      const y2_2 = +curve2[j][property2];

      // Calculate the bounding boxes
      const minX1 = Math.min(x1, x1);
      const maxX1 = Math.max(x1, x1);
      const minX2 = Math.min(x2_1, x2_2);
      const maxX2 = Math.max(x2_1, x2_2);

      // Check if the bounding boxes overlap
      if (maxX1 >= minX2 && maxX2 >= minX1) {
        // Interpolate to estimate the y-values at the intersection
        const t1 = (x2_1 - x1) / (x1 - x2_2);
        const t2 = (x1 - x2_1) / (x2_2 - x2_1);
        const y1_interp = y1_1 * t1 + y1_2 * (1 - t1);
        const y2_interp = y2_1 * t2 + y2_2 * (1 - t2);

        // Calculate the absolute difference between y-values
        const diff = Math.abs(y1_interp - y2_interp);

        if (diff <= tolerance) {
          intersectionPoint = {};
          intersectionPoint[property1] = (x1 + x2_1) / 2;
          intersectionPoint[property2] = (y1_interp + y2_interp) / 2;
          return intersectionPoint;
        }
      }
    }
  }

  return intersectionPoint;
}

//----------------------------------- APPLY FUNCTIONS ---------------------------------------
// Declare allWaters variable
let allWaters = [];
let maxId = 0;
allWaters = getDataFromLocalStorage("watersData");
// Populate the table and create graphic when the DOM is loaded
$(document).ready(function () {
  //allWaters = getDataFromLocalStorage("watersData");

  if (!allWaters.length) {
    GetJson("assets/json/input.json").then((dataJSON) => {
      // Handle the fetched data here
      populateTableWithData("#tableHD", dataJSON);
      allWaters == dataJSON;
    });
    console.log(allWaters);
  } // else {
  //   allWaters=dataLS;
  //   populateTableWithData("#tableHD", dataJSON);
  // }
  populateTableWithData("#tableHD", allWaters);
  // get the max Id of array so to have next Id
  maxId = Math.max(...allWaters.map((o) => o.id));
  console.log(maxId);
  // Create the initial chart
  // X axis configuration
  const valuesTAC = [
    0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    20, 30, 40, 50, 60, 70, 80, 90, 100,
  ];
  function generateXAxisConfig(inTitle, minTAC, maxTAC, overlaying, side) {
    const tickvals = [];
    const ticktext = [];

    for (const i of valuesTAC) {
      tickvals.push(i);
      ticktext.push(i.toString());
    }
    // Define the x-axis configuration
    const xAxisConfig = {
      title: inTitle,
      type: "log",
      range: [Math.log(minTAC), Math.log(maxTAC)],
      autorange: "fixed",
      //dtick: dtickVals, // Set the spacing between ticks
      tickvals: tickvals, // Specify the positions of ticks
      ticktext: ticktext, // Customize tick labels
      tickangle: -90,
      showline: true, // Display the x-axis line
      showgrid: true, // Display the x-axis grid lines
      gridcolor: "lightgray", // Grid color
      zeroline: false, // Hide the zero line
      //rangemode: "tozero", // Ensure the x-axis starts from zero
      overlaying: overlaying, // "y" Overlay the second y-axis on top of the first
      side: side, //"right" Position the second y-axis on the right side
    };

    return xAxisConfig;
  }

  // General Layout configuration
  const layout = {
    title: "Hallopeau And Dubin Graph",
    xaxis: generateXAxisConfig("Logarithmic TAC", 0.5, 7.5, "y", "left"),

    yaxis: {
      title: "pH",
      range: [4, 11],
      type: "linear",
      dtick: 0.5,
      showline: true, // Display the y-axis line
      showgrid: true, // Display the y-axis grid lines
    },
    legend: {
      //x: 0, // Adjust the x position as needed
      //y: -0.7, // Adjust the y position to move it below the graph
    },
    hovermode: "closest", // Show closest data on hover by default
  };
  // plot configuration
  const config = {
    displayModeBar: true, // Show the display mode bar (toolbar)
    displaylogo: false, // Hide the Plotly logo
    responsive: true, // Enable responsiveness
    //displayModeBar: false, // Disable the mode bar if desired
  };

  // Combine traces and layout and plot the graph
  const data = [];
  Plotly.newPlot("plotly-chart", data, layout, config);
});

// check validity When typing in an input
document
  .getElementById("FormHallopeau")
  .addEventListener("keyup", function (event) {
    let targetId = event.target.id;
    checkElementValidity(targetId);
  });

// On submit check the validity of all the inputs,
// compute and create graphic data, save data to json.
// Load json, update table and graphic
document
  .getElementById("FormHallopeau")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    let form = document.getElementById("FormHallopeau");
    let inputElements = form.querySelectorAll("input");
    let allValid = true;
    // get form input elements and check validity
    for (let input of inputElements) {
      let isValid = checkElementValidity(input.id);
      allValid = allValid && isValid;
    }
    // if form valid retreive data from form
    if (allValid) {
      console.log("Form is valid!");
      // Retrieve and parse the form data from numerical and text value
      let formData = {};
      inputElements.forEach((input) => {
        formData[input.id] = isNaN(parseFloat(input.value))
          ? input.value.trim()
          : parseFloat(input.value);
      });
      // Create an instance of the water class
      let waterSample = new water(formData);
      // Destructure form data object so it can be used at function parameters
      const {
        WaterName,
        TAC,
        temperature,
        pH,
        calcium,
        DryResidual,
        conductivity,
        resistivity,
        sulfate,
        cloride,
        roundnumber,
      } = waterSample;
      // Call HallopeauDubin function
      let results = waterSample.HallopeauDubin(
        WaterName,
        TAC,
        temperature,
        pH,
        calcium,
        DryResidual,
        conductivity,
        resistivity,
        sulfate,
        cloride,
        roundnumber
      );
      console.log("Water results are computed");
      //create id
      maxId++;
      // Save input and results in an object
      let inputAndResults = {
        id: maxId,
        ...results.inputValues,
        ...results.computedResults,
      };
      // Push object into allwaters array
      allWaters.push(inputAndResults);
      // Update DOM results
      waterSample.PrintResults(
        results.computedResults.LSI,
        results.computedResults.IR,
        results.computedResults.LR
      );
      // Saving results to Json file
      //saveJSON(allWaters);
      localStorage.setItem("watersData", JSON.stringify(allWaters)); //save to local storage
      console.log("Water results are saved in JSON format in local storage");

      //----------------------------------- Create Table ---------------------------------------

      // Populate the Bootstrap Table after adding data
      populateTableWithData("#tableHD", allWaters);
      Toastify({
        text: "Water values computed and added to the table",
        duration: 3000,
      }).showToast();

      //----------------------------------- Create Curve Data ---------------------------------------
      //---------------  CONSTANTS ---------------------------------------
      const maxGraph = 100; // From 0F to 100F
      //---------------    CURVE   ---------------------------------------

      ////////////////////   SATURATION   ////////////////////////////////////////////////////
      //Create curve pHs
      let curvepHsData = [];
      const TACincrement = 0.01;
      let TACtemps = TAC;
      let CAtemps = calcium;
      let DryResidualtemps = DryResidual;
      // right part of graph
      for (let i = 1; i <= maxGraph / TACincrement; i++) {
        let TACold = TACtemps;
        let CAtold = CAtemps;
        let resultTAC = waterSample.HallopeauDubin(
          WaterName,
          TACtemps,
          temperature,
          pH,
          CAtemps,
          DryResidualtemps,
          conductivity,
          resistivity,
          sulfate,
          cloride,
          roundnumber
        );
        TACtemps = TACtemps + TACincrement;
        CAtemps = CAtemps + TACincrement;
        DryResidualtemps =
          (TACtemps - TACold) * 12.2 +
          (CAtemps - CAtold) * (4 / 10) +
          DryResidualtemps;

        let curvePoint = {
          TAC: resultTAC.inputValues.TAC,
          pH: resultTAC.computedResults.pHs,
          temperature: resultTAC.inputValues.temperature,
          CO2eq: resultTAC.computedResults.CO2eq,
        };
        curvepHsData.push(curvePoint);
      }
      // Reset values for the second part of the curve
      TACtemps = TAC; // Reset TAC value
      CAtemps = calcium; // Reset CAtemp value
      DryResidualtemps = DryResidual; // Reset DryResidual value

      for (let i = 1; i <= TAC / TACincrement; i++) {
        let TACold = TACtemps;
        let CAtold = CAtemps;
        
        // Calculate resultTAC using your waterSample.HallopeauDubin function
        let resultTAC = waterSample.HallopeauDubin(
          WaterName,
          TACtemps,
          temperature,
          pH,
          CAtemps,
          DryResidualtemps,
          conductivity,
          resistivity,
          sulfate,
          cloride,
          roundnumber
        );

        TACtemps = TACtemps - TACincrement;
        CAtemps = CAtemps - TACincrement;
        DryResidualtemps =
          -((TACtemps - TACold) * 12.2) -
          (CAtemps - CAtold) * (4 / 10) -
          DryResidualtemps;

        let curvePoint = {
          TAC: resultTAC.inputValues.TAC,
          pH: resultTAC.computedResults.pHs,
          temperature: resultTAC.inputValues.temperature,
          CO2eq: resultTAC.computedResults.CO2eq,
        };
        curvepHsData.push(curvePoint);
      }

      // Sort the curve data by TAC values
      curvepHsData.sort((a, b) => a.TAC - b.TAC);

      console.log(curvepHsData);

      ////////////////////   NEUTRALISATION WITH LIMESTONE   ///////////////////////////////////
      // to increase mineralization TAC of 1F , need to bring 4.4mg/l of co2 and 10 mg/l of Limestone (CaCo3)
      let curveSaturation = [];
      let curveNeutraDataLimestone = [];
      let TACtemp = TAC;
      let CAtemp = calcium;
      let DryResidualtemp = DryResidual;
      let CO2temp = results.computedResults.CO2;
      const co2decrement = 0.01;
      const increaseTAC_Ca = 1 / 4.4;

      for (let i = 1; i <= maxGraph / co2decrement; i++) {
        let TACold = TACtemp;
        let CAtold = CAtemp;
        /////// To find intersectionPoint we plot again the saturation curve but at same steps as the other curves
        let resultSaturation = waterSample.HallopeauDubin_(
          TACtemp,
          temperature,
          CAtemp,
          DryResidualtemp,
          roundnumber
        );

        let curvePointSaturation = {
          TAC: resultSaturation.pHs_Results.TAC,
          pH: resultSaturation.pHs_Results.pHs_,
          temperature: resultSaturation.pHs_Results.temperature,
        };
        curveSaturation.push(curvePointSaturation);
        /////// To find Neutralisation with Limestone
        let resultNeutraLimeStone = waterSample.CO2pHcurves(
          temperature,
          TACtemp,
          CO2temp,
          DryResidualtemp,
          "",
          "",
          roundnumber
        );

        let curvePointLimeStone = {
          TAC: resultNeutraLimeStone.CO2pHCurve.TAC,
          pH: resultNeutraLimeStone.CO2pHCurve.pH,
          CO2: resultNeutraLimeStone.CO2pHCurve.CO2,
          temperature: resultNeutraLimeStone.CO2pHCurve.temperature,
        };
        curveNeutraDataLimestone.push(curvePointLimeStone);

        TACtemp = TACtemp + increaseTAC_Ca * co2decrement;
        CAtemp = CAtemp + increaseTAC_Ca * co2decrement;
        CO2temp = CO2temp - co2decrement;
        DryResidualtemp =
          (TACtemp - TACold) * 12.2 +
          (CAtemp - CAtold) * (4 / 10) +
          DryResidualtemp;
      }
      //Find the Equilibrium point for neutralization with limestone
      const tolerance = co2decrement; // Adjust the tolerance if needed
      const intersection = findIntersection(
        curveSaturation,
        curveNeutraDataLimestone,
        tolerance,
        "TAC",
        "pH"
      );
      if (intersection) {
        console.log("Closest intersection point:", intersection);
      } else {
        console.log("No intersection point within tolerance found.");
      }

      ////////////////////   NEUTRALISATION WITH LIME   ///////////////////////////////////
      // to increase mineralization TAC of 1F , need to bring 8.8mg/l of co2 and 7.4 mg/l of hidrated lime (Ca(OH)2)
      let curveSaturation_2 = [];
      let curveNeutraDataLime = [];
      let TACtempLime = TAC;
      let CAtempLime = calcium;
      let DryResidualtempLime = DryResidual;
      let CO2tempLime = results.computedResults.CO2;
      const increaseTAC_CaLime = 1 / 8.8;

      for (let i = 1; i <= maxGraph / co2decrement; i++) {
        let TACold = TACtempLime;
        let CAtold = CAtempLime;
        /////// To find intersectionPoint we plot again the saturation curve but at same steps as the other curves
        let resultSaturation = waterSample.HallopeauDubin_(
          TACtempLime,
          temperature,
          CAtempLime,
          DryResidualtempLime,
          roundnumber
        );

        let curvePointSaturation = {
          TAC: resultSaturation.pHs_Results.TAC,
          pH: resultSaturation.pHs_Results.pHs_,
          temperature: resultSaturation.pHs_Results.temperature,
        };
        curveSaturation_2.push(curvePointSaturation);
        /////// To find Neutralisation with Lime
        let resultNeutraLimeStone = waterSample.CO2pHcurves(
          temperature,
          TACtempLime,
          CO2tempLime,
          DryResidualtempLime,
          "",
          "",
          roundnumber
        );

        let curvePointLime = {
          TAC: resultNeutraLimeStone.CO2pHCurve.TAC,
          pH: resultNeutraLimeStone.CO2pHCurve.pH,
          CO2: resultNeutraLimeStone.CO2pHCurve.CO2,
          temperature: resultNeutraLimeStone.CO2pHCurve.temperature,
        };
        curveNeutraDataLime.push(curvePointLime);

        TACtempLime = TACtempLime + increaseTAC_CaLime * co2decrement;
        CAtempLime = CAtempLime + increaseTAC_CaLime * co2decrement;
        CO2tempLime = CO2tempLime - co2decrement;
        DryResidualtempLime =
          (TACtempLime - TACold) * 12.2 +
          (CAtempLime - CAtold) * (4 / 10) +
          DryResidualtempLime;
      }
      console.log(curveNeutraDataLime);
      //Find the Equilibrium point for neutralization with limestone
      const intersection_2 = findIntersection(
        curveSaturation,
        curveNeutraDataLime,
        tolerance,
        "TAC",
        "pH"
      );
      if (intersection_2) {
        console.log("Closest intersection point:", intersection_2);
      } else {
        console.log("No intersection point within tolerance found.");
      }

      ////////////////////   CO2   ///////////////////////////////////////////////////
      // Create curves CO2
      let curvesCO2Data = [];
      const valuesCO2 = [
        0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700,
        800, 1000,
      ];
      //Push the CO2 values at equilibrium and free CO2
      valuesCO2.push(results.computedResults.CO2eq);
      valuesCO2.push(results.computedResults.CO2);

      for (const j of valuesCO2) {
        let curveCO2Data = [];
        for (let i = 30; i <= 110; i++) {
          let resultCO2 = waterSample.CO2TACcurves(
            temperature,
            j, //results.computedResults.CO2eq,
            i / 10,
            DryResidual,
            conductivity,
            resistivity,
            roundnumber
          );

          let curvePoint = {
            temperature: resultCO2.CO2TACCurve.temperature,
            CO2: resultCO2.CO2TACCurve.CO2,
            TAC: resultCO2.CO2TACCurve.TAC,
            pH: resultCO2.CO2TACCurve.pH,
          };
          curveCO2Data.push(curvePoint);
        }
        curvesCO2Data.push(curveCO2Data);
      }

      /////////////////////////////////////////////////////////////////////////////////////////////////
      //----------------------------------- Create Curve points ---------------------------------------
      // Create trace input point
      const PointTrace = {
        x: [TAC],
        y: [pH],
        y2: [results.computedResults.CO2],
        mode: "markers",
        type: "scatter",
        name: "Input Value",
        marker: {
          size: 10,
          color: "#48ff00",
        },
        text: [
          `TAC: ${TAC}  °F<br> pH: ${pH} <br> CO2: ${results.computedResults.CO2} mg/l`,
        ], // Display both pH and CO2 values
        hoverinfo: "text", // Show the text when hovering over the point
      };

      ////////////////////   SATURATION   ////////////////////////////////////////////////////
      // Extract data for the graph from curveData
      const tacValues = curvepHsData.map((point) => point.TAC);
      const phsValues = curvepHsData.map((point) => point.pH);
      const temperatureValues = curvepHsData.map((point) => point.temperature);
      const CO2eqValues = curvepHsData.map((point) => point.CO2eq);

      // Create trace for the saturation line
      const curveTrace = {
        x: tacValues,
        y: phsValues,
        y2: CO2eqValues,
        mode: "lines",
        type: "scatter",
        name: `Saturation curve at ${temperatureValues[0]} °C`,
        line: {
          dash: "solid",
          color: "#02ADF3",
          width: 2,
        },
        fill: "tozeroy", // Fill the area below the line to the y-axis
        fillcolor: "rgba(33, 208, 248, 0.3)", // Specify the fill color below the line
        // Include Text label for line
        text: temperatureValues.map(
          (temp, index) =>
            `TACeq: ${tacValues[index]} °F<br>
            pHs: ${phsValues[index]}<br>
            CO2eq: ${CO2eqValues[index]} mg/l<br>
            Temp: ${temp} °C`
        ),
        hoverinfo: "text", // Show the text when hovering over the point
      };

      ////////////////////   NEUTRALISATION WITH LIMESTONE   ///////////////////////////////////
      // Extract data for the graph from curveData
      const NeutraLimestone_tacValues = curveNeutraDataLimestone.map((point) => point.TAC);
      const NeutraLimestone_phValues = curveNeutraDataLimestone.map((point) => point.pH);
      const NeutraLimestone_CO2Values = curveNeutraDataLimestone.map((point) => point.CO2);
      const NeutraLimestone_temperatureValues = curveNeutraDataLimestone.map(
        (point) => point.temperature
      );
      // Create trace for the Neutralization line
      const NeutraTraceLimestone = {
        x: NeutraLimestone_tacValues,
        y: NeutraLimestone_phValues,
        mode: "lines",
        type: "scatter",
        name: `Neutralization with Limestone at ${NeutraLimestone_temperatureValues[0]} °C`,
        line: {
          dash: "dash",
          color: "#CD09F7",
          width: 2,
        },
        //fill: "tozeroy", // Fill the area below the line to the y-axis
        //fillcolor: "rgba(0, 128, 0, 0.3)", // Specify the fill color below the line
        // Include Text label for line
        text: NeutraLimestone_temperatureValues.map(
          (temp, index) =>
            `TAC: ${NeutraLimestone_tacValues[index]} °F<br>
                  pH: ${NeutraLimestone_phValues[index]}<br>
                  CO2: ${NeutraLimestone_CO2Values[index]} mg/l<br>
                  Temp: ${temp} °C`
        ),
        hoverinfo: "text", // Show the text when hovering over the point
      };

      // Create Limestone equilibrium point
      const PointLimestone = {
        x: [intersection.TAC],
        y: [intersection.pH],
        mode: "markers",
        type: "scatter",
        name: "Limestone Equilibrium",
        marker: {
          size: 10,
          color: "#CD09F7",
        },
        text: [
          `TACeq: ${intersection.TAC} °F<br> pHeq: ${intersection.pH}<br> CO2eq: ${results.computedResults.CO2eq} mg/l`,
        ], // Display both pH and CO2 values
        hoverinfo: "text", // Show the text when hovering over the point
      };
      // Create a horizontal trace between pH point and the limestone equilibrium point
      const traceLineLimestone = {
        x: [TAC, intersection.TAC],
        y: [4, 4],
        mode: "lines",
        type: "scatter",
        hoverinfo: "none",
        name: `Limestone (CaCo3) addition (${intersection.TAC - TAC}°F or ${
          (intersection.TAC - TAC) * 10
        }mg/l)`,
        line: {
          dash: "solid",
          width: 10,
          color: "#cb09f775",
        },
      };

      ///////////////////////   NEUTRALISATION WITH LIME       ///////////////////////////////////
      // Extract data for the graph from curveData
      const NeutraLime_tacValues = curveNeutraDataLime.map((point) => point.TAC);
      const NeutraLime_phValues = curveNeutraDataLime.map((point) => point.pH);
      const NeutraLime_CO2Values = curveNeutraDataLime.map((point) => point.CO2);
      const NeutraLime_temperatureValues = curveNeutraDataLime.map(
        (point) => point.temperature
      );
      // Create trace for the Neutralization line
      const NeutraTraceLime = {
        x: NeutraLime_tacValues,
        y: NeutraLime_phValues,
        mode: "lines",
        type: "scatter",
        name: `Neutralization with Lime at ${NeutraLime_temperatureValues[0]} °C`,
        line: {
          dash: "dash",
          color: "#ff00c8",
          width: 2,
        },
        //fill: "tozeroy", // Fill the area below the line to the y-axis
        //fillcolor: "rgba(0, 128, 0, 0.3)", // Specify the fill color below the line
        // Include Text label for line
        text: NeutraLime_temperatureValues.map(
          (temp, index) =>
            `TAC: ${NeutraLime_tacValues[index]} °F<br>
                  pH: ${NeutraLime_phValues[index]}<br>
                  CO2: ${NeutraLime_CO2Values[index]} mg/l<br>
                  Temp: ${temp} °C`
        ),
        hoverinfo: "text", // Show the text when hovering over the point
      };

      // Create Limestone equilibrium point
      const PointLime = {
        x: [intersection_2.TAC],
        y: [intersection_2.pH],
        mode: "markers",
        type: "scatter",
        name: "Lime Equilibrium",
        marker: {
          size: 10,
          color: "#ff00c8",
        },
        text: [
          `TACeq: ${intersection_2.TAC} °F<br> pHeq: ${intersection_2.pH}<br> CO2eq: ${results.computedResults.CO2eq} mg/l`,
        ], // Display both pH and CO2 values
        hoverinfo: "text", // Show the text when hovering over the point
      };
      // Create a horizontal trace between pH point and the limestone equilibrium point
      const traceLineLime = {
        x: [TAC, intersection_2.TAC],
        y: [4.2, 4.2],
        mode: "lines",
        type: "scatter",
        hoverinfo: "none",
        name: `Hidrated Lime Ca(OH)2 addition (${(intersection_2.TAC - TAC)*7.4}°F or ${
          ((intersection_2.TAC - TAC) * 10)*7.4
        }mg/l)`,
        line: {
          dash: "solid",
          width: 10,
          color: "#ff00c875",
        },
      };

      ////////////////////   CO2   ////////////////////////////////////////////////////
      // Create an array to store trace objects
      const traceData = [];

      // Loop through curvesCO2Data and create a trace for each curve
      for (let curve of curvesCO2Data) {
        const TACData = curve.map((point) => point.TAC);
        const pHData = curve.map((point) => point.pH);
        const CO2Data = curve.map((point) => point.CO2);
        const tempData = curve.map((point) => point.temperature);
        const CO2Value = CO2Data[0]; // Get the CO2 value from the first data point
        // Create a trace for the curve without a legend entry
        const trace = {
          x: TACData,
          y: pHData,
          mode: "lines", // You can change the mode to 'lines+markers' or 'markers' for different visualizations
          name: "", // Empty name to exclude from the legend
          showlegend: false,
          line: {
            dash: "solid",
            color: "rgba(124, 124, 124, 0.3)",
            width: 1,
          },
          text: tempData.map(
            (temp, index) =>
              `CO2eq: ${CO2Data[index]} mg/l<br>
                TAC: ${TACData[index]} °F<br>
                pH: ${pHData[index]}<br>
                Temp: ${temp} °C`
          ),
          hoverinfo: "text", // Exclude from hover information
        };
        traceData.push(trace);
      }

      // Create result pHs point
      const PointResultTrace = {
        x: [TAC],
        y: [results.computedResults.pHs],
        y2: [results.computedResults.CO2eq],
        mode: "markers",
        type: "scatter",
        name: "Result pHs",
        marker: {
          size: 10,
          color: "black",
        },
        text: [
          `TACeq: ${TAC} °F<br> pHs: ${results.computedResults.pHs}<br> CO2eq: ${results.computedResults.CO2eq} mg/l`,
        ], // Display both pH and CO2 values
        hoverinfo: "text", // Show the text when hovering over the point
      };
      // Create a vertical trace between pH point and the result pHs point representing Co2 stripping
      const traceLineBetweenPoints = {
        x: [TAC, TAC],
        y: [pH, results.computedResults.pHs],
        mode: "lines",
        type: "scatter",
        hoverinfo: "none",
        name: `Co2 Stripping (${
          results.computedResults.CO2 - results.computedResults.CO2eq
        }mg/l)`,
        line: {
          dash: "dash",
          color: "black",
        },
      };
      // Add arrow to the vertical trace showing the Co2 stripping
      let arrowposition = results.computedResults.LSI >= 0 ? -30 : 30;
      const arrowAnnotation = {
        x: Math.log10(TAC), // The x-coordinate where you want to place the arrow
        y: results.computedResults.pHs, // The y-coordinate where you want to place the arrow
        xref: "x", // Set to 'x' to specify that xCoordinate is in data coordinates
        yref: "y", // Set to 'y' to specify that yCoordinate is in data coordinates
        //text: "↑", // The text for the arrow (you can use a Unicode arrow character)
        showarrow: true, // Display the arrow
        arrowhead: 2, // Set arrowhead style to an upward arrow
        ax: 0, // No x-component of arrow tail
        ay: arrowposition, // Adjust the y-component of arrow tail to control its position
        arrowcolor: "black", // Set the color of the arrow to green
      };

      ////////////////////   ANNOTATIONS   ////////////////////////////////////////////////////

      // Add anotation on the graph
      const annotation2 = {
        x: Math.log10(TAC), // X-coordinate where you want to place the annotation
        y: +results.computedResults.pHs - 2, // Y-coordinate where you want to place the annotation
        text: "Corrosive Water", // Text label for the annotation
        showarrow: false, // Do not display an arrow
        font: {
          size: 14,
          color: "black", // Customize the font color
        },
      };
      const annotation3 = {
        x: Math.log10(TAC), // X-coordinate where you want to place the annotation
        y: +results.computedResults.pHs + 1, // Y-coordinate where you want to place the annotation // need to look why pHs is not number
        text: "Incrustant Water", // Text label for the annotation
        showarrow: false, // Do not display an arrow
        font: {
          size: 14,
          color: "black", // Customize the font color
        },
      };

      // Update the Chart
      // General Layout configuration
      const layout = {
        annotations: [arrowAnnotation, annotation2, annotation3], // Add the arrow annotation to the layout
      };
      // Combine traces and layout and plot the graph
      const datas = [
        PointTrace,
        curveTrace,
        PointResultTrace,
        traceLineBetweenPoints,
        NeutraTraceLimestone,
        PointLimestone,
        traceLineLimestone,
        NeutraTraceLime,
        PointLime,
        traceLineLime,
      ];

      // Combine the new traceData with the other data array
      const combinedData = [
        ...datas, // Add your existing traces
        ...traceData, // Add the new traces and annotations
      ];

      // Add the new trace to the existing chart
      Plotly.addTraces("plotly-chart", combinedData);
      // Update the layout
      Plotly.update("plotly-chart", {}, layout);
      // Redraw the chart
      Plotly.redraw("plotly-chart");
    } else {
      console.log("Form is invalid. Correct the errors.");
    }
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

// Get the selected rows

// Get a reference to the table element
var $table = $("#tableHD");

// Initialize an array to store selected rows
var selectedRows = [];
var maxSelectedRows = 3;
// Add an event listener to capture row selections
$table.on("check.bs.table", function (e, row) {
  // 'check.bs.table' is triggered when a row is selected
  //console.log("Row selected:", row);
  // You can access the row data, including the 'id' field
  //console.log("Row ID:", row.LSI);
  if (selectedRows.length >= maxSelectedRows) {
    // If the maximum selected rows limit is reached, uncheck the first selected row
    var removedRow = selectedRows.shift();
    $table.bootstrapTable("uncheck", [removedRow]);
    console.log(selectedRows.length);
  } else {
    // if (!selectedRows.includes(row)) {
    //   selectedRows.push(row);
    // }
    selectedRows.push(row.options.data["id"]);
    console.log(selectedRows.length);
    //console.log(selectedRowsCount);
  }
  // Add the selected row to the array if it's not already present
  // if (!selectedRows.includes(row)) {
  //   selectedRows.push(row);
  // }

  // Now 'selectedRows' contains all selected rows
  console.log("Selected Rows:", selectedRows);
});

// Add an event listener to capture deselected rows
$table.on("uncheck.bs.table", function (e, row) {
  // 'uncheck.bs.table' is triggered when a row is deselected
  console.log("Row deselected:", row);
  var removedRowId = row.options.data["unique-id"];
  // Find the index of the deselected row in the 'selectedRows' array
  var index = selectedRows.indexOf(removedRowId);

  // If the row is found in the array, remove it using splice
  if (index !== -1) {
    selectedRows.splice(index, 1);
  }

  // Now 'selectedRows' does not contain the deselected row
  console.log("Selected Rows:", selectedRows);
});

// // Add an event listener to capture all selected rows
// $table.on("check-all.bs.table", function (e) {
//   // 'check-all.bs.table' is triggered when all rows are selected
//   console.log("All rows selected");
// });

// // Add an event listener to capture all deselected rows
// $table.on("uncheck-all.bs.table", function (e) {
//   // 'uncheck-all.bs.table' is triggered when all rows are deselected
//   console.log("All rows deselected");
// });
