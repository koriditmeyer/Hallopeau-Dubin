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
    // Computation of DryResidual according to conductivity
    let DryResidual_conduc = (conductivity) => {
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
    };
    // convert Resistivity to conductivity and conductivity to resistivity
    let Cond_Res = (parameter) => {
      return 1000000 / parameter;
    };

    // Calculation of Dry residual if not entered
    let DryResidual_ = (DryResidual, conductivity, resistivity) => {
      // Computation of DryResidual according to DryResidual, conductivity and resistivity
      let DryResidual_Final;
      if (DryResidual) {
        DryResidual_Final = DryResidual;
        //console.log("Residual" + DryResidual_Final);
      } else if (conductivity && !resistivity) {
        DryResidual_Final = DryResidual_conduc(conductivity);
        //console.log("cond" + DryResidual_Final);
      } else if (resistivity && !conductivity) {
        let conductivity_calc = Cond_Res(resistivity);
        DryResidual_Final = DryResidual_conduc(conductivity_calc);
        //console.log("res" + DryResidual_Final);
      }

      return DryResidual_Final;
    };

    // Calculation of EP from Ionic Force
    function EP(DryResidual) {
      var IonicForce = DryResidual * 25 * Math.pow(10, -6);
      var EP1 = Math.sqrt(IonicForce) / (1 + 1.4 * Math.sqrt(IonicForce));
      var EP2 = EP1 * 2;
      var EP4 = (4 * Math.sqrt(IonicForce)) / (1 + 3.9 * Math.sqrt(IonicForce));
      return { EP1, EP2, EP4 };
    }
    // Calculation of equilibrium constant pk1 - according to Larson & Boswell
    let pK1 = (temperature) => {
      return (
        6.583 -
        12.3 * (temperature / 1000) +
        163.5 * Math.pow(temperature / 1000, 2) -
        646 * Math.pow(temperature / 1000, 3)
      );
    };
    // Calculation of pk'1
    let pK_1 = (pK1, EP1) => {
      return pK1 - EP1;
    };

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
      return pK_2 - pK_s + 9.195; //view which is correct
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

    // Calculation of CO2
    let CO2 = (TAC, pK_1, ph, Lp) => {
      return Math.pow(10, 0.2 + pK_1 + Math.log10(TAC * 5.6) - ph - Lp);
    };
    // Calculation of Agressive Co2
    // Calculation of Equilibrium pH
    // Calculation of Co2 at equilibrium
    // Calculation of TAC at equilibrium
    // Calculation of CCPP at equilibrium

    // Invoke functions created
    let calc_DryResidual = DryResidual_(DryResidual, conductivity, resistivity);
    let calc_EP = EP(calc_DryResidual);
    let calc_EP1 = calc_EP.EP1;
    let calc_EP2 = calc_EP.EP2;
    let calc_EP4 = calc_EP.EP4;
    let calc_pK1 = pK1(temperature);
    let calc_pK_1 = pK_1(calc_pK1, calc_EP1);
    let calc_pK2 = pK2(temperature);
    let calc_pK_2 = pK_2(calc_pK2, calc_EP2);
    let calc_pKs = pKs(temperature);
    let calc_pK_s = pK_s(calc_pKs, calc_EP4);
    let calc_C_ = C_(calc_pK_2, calc_pK_s);
    let calc_Lp = Lp(pH, calc_pK_2);
    let calc_pHs = pHs(calc_C_, TAC, calcium, calc_Lp);
    let calc_LSI = LSI(pH, calc_pHs);
    let calc_IR = IR(pH, calc_pHs);
    let calc_CO2 = CO2(TAC, calc_pK_1, pH, calc_Lp);
    let calc_Lp_eq = Lp(calc_pHs, calc_pK_2);
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
      CO2: calc_CO2.toFixed(roundnumber),
      CO2eq: calc_CO2_eq.toFixed(roundnumber),
    };

    // Set the computed results as a property of the class
    this.computedResults = computedResults;

    return { inputValues, computedResults };
  }

  // Meaning o LSI
  LSI_Meaning_(LSI) {
    let riskValue;
    let Meaning;
    if (LSI < -0.1) {
      Meaning =
        "According to Langelier Index there is a risk of corrosion (to limestone)";
      riskValue = 2;
    } else if (LSI >= -0.1 && LSI <= 0.1) {
      Meaning =
        "According to Langelier Index the water is at the equilibrium point";
      riskValue = 0;
    } else if (LSI > 0.1) {
      Meaning = "According to Langelier Index there is a risk of inscrutation";
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
    if (IR <= 5) {
      Meaning =
        "According to Ryznar Index there is a high risk of incrustation";
      riskValue = 2;
    } else if (IR > 5 && IR <= 6) {
      Meaning =
        "According to Ryznar Index there is a risk of incrustation of heating pipes (Temperature> 60ºC)";
      riskValue = 1;
    } else if (IR > 6 && IR <= 6.5) {
      Meaning = "According to Ryznar Index there is a low risk of incrustation";
      riskValue = 0;
    } else if (IR > 6.5 && IR <= 7.2) {
      Meaning = "According to Ryznar Index there is a low risk of corrosion";
      riskValue = 0;
    } else if (IR > 7.2 && IR <= 7.8) {
      Meaning =
        "According to Ryznar Index there is a moderate risk of corrosion (high if Temperature> 60ºC)";
      riskValue = 1;
    } else if (IR > 7.8 && IR <= 8.5) {
      Meaning =
        "According to Ryznar Index there is a high risk of corrosion (very high if Temperature> 15ºC)";
      riskValue = 2;
    } else if (IR > 8.5) {
      Meaning =
        "According to Ryznar Index there is a very high risk of corrosion";
      riskValue = 3;
    } else {
      Meaning = "Error in calculating the Ryznar Index";
    }
    return { Meaning, riskValue };
  }

  PrintResults(LSI, IR) {
    let LSI_Meaning = this.LSI_Meaning_(LSI).Meaning;
    let IR_Meaning = this.IR_Meaning_(IR).Meaning;

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
allWaters = getDataFromLocalStorage("watersData");

// Populate the table when the DOM is loaded
$(document).ready(function () {
  allWaters = getDataFromLocalStorage("watersData");
  populateTableWithData("#tableHD", allWaters);
});

// check validity When typing in an input
document
  .getElementById("FormHallopeau")
  .addEventListener("keyup", function (event) {
    let targetId = event.target.id;
    checkElementValidity(targetId);
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

      let inputAndResults = {
        ...results.inputValues,
        ...results.computedResults,
      };
      allWaters.push(inputAndResults);
      waterSample.PrintResults(
        results.computedResults.LSI,
        results.computedResults.IR
      );
      console.log("Water results are computed");
      // Saving to LocalStorage
      localStorage.setItem("watersData", JSON.stringify(allWaters));
      console.log("Water results are saved");
      // Populate the Bootstrap Table after adding data
      populateTableWithData("#tableHD", allWaters);
      Toastify({
        text: "Water values computed and added to the table",
        duration: 3000,
      }).showToast();

      //Create curve pHs
      curvepHsData = [];
      for (let i = 1; i <= 1000; i++) {
        let resultTAC = waterSample.HallopeauDubin(
          WaterName,
          i / 10,
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

        let curvePoint = {
          TAC: resultTAC.inputValues.TAC,
          pHs: resultTAC.computedResults.pHs,
          temperature: resultTAC.inputValues.temperature,
          CO2eq: resultTAC.computedResults.CO2eq,
        };
        curvepHsData.push(curvePoint);
      }
      //console.log(curvepHsData);
      // Create curves CO2

      //-----------------------------------  Graph ---------------------------------------
      // Extract data for the graph from curveData
      const tacValues = curvepHsData.map((point) => point.TAC);
      const phsValues = curvepHsData.map((point) => point.pHs);
      const temperatureValues = curvepHsData.map((point) => point.temperature);
      const CO2eqValues = curvepHsData.map((point) => point.CO2eq);

      // Create trace for the curve line
      const curveTrace = {
        x: tacValues,
        y: phsValues,
        y2: CO2eqValues,
        mode: "lines",
        type: "scatter",
        name: `Saturation curve at ${temperatureValues[0]} °C`,
        line: {
          dash: "solid",
          color: "blue",
          width: 2,
        },
        fill: "tozeroy", // Fill the area below the line to the y-axis
        fillcolor: "rgba(0, 128, 0, 0.3)", // Specify the fill color below the line
        // Include Text label for line
        text: temperatureValues.map(
          (temp, index) =>
            `TAC: ${tacValues[index]} °F<br>
            pH: ${phsValues[index]}<br>
            CO2: ${CO2eqValues[index]} mg/l<br>
            Temp: ${temp} °C`
        ),
        hoverinfo: "text", // Show the text when hovering over the point
      };

      // Calculate the upper and lower error values (0.1 units from the line)
      const errorValues = phsValues.map((pHs) => 0.1);

      // Create trace for symmetric error bars
      const errorBandTrace = {
        x: [...tacValues, ...tacValues.slice().reverse()], // Create a closed loop
        y: [
          ...phsValues.map((ph, index) => ph + errorValues[index]),
          ...phsValues
            .slice()
            .reverse()
            .map((ph, index) => ph - errorValues[index]),
        ],
        fill: "tonextx", // Fill the area between the curves
        fillcolor: "rgba(0, 0, 255, 0.3)", // Blue with opacity
        line: { width: 1 }, // Hide the line
        name: "Error Band", // Legend name for the error band
        hoverinfo: "none",
        type: "scatter",
      };

      // Create trace for the input TAC and pH points
      const PointTrace = {
        x: [TAC],
        y: [pH],
        y2: [results.computedResults.CO2],
        mode: "markers",
        type: "scatter",
        name: "Input Value",
        marker: {
          size: 10,
          color: "green",
        },
        text: [
          `TAC: ${TAC}  °F<br> pH: ${pH} <br> CO2: ${results.computedResults.CO2} mg/l`,
        ], // Display both pH and CO2 values
        hoverinfo: "text", // Show the text when hovering over the point
      };

      // Create trace for the result pHs point
      const PointResultTrace = {
        x: [TAC],
        y: [results.computedResults.pHs],
        y2: [results.computedResults.CO2eq],
        mode: "markers",
        type: "scatter",
        name: "Result pHs",
        marker: {
          size: 10,
          color: "blue",
        },
        text: [
          `TAC: ${TAC} °F<br> pH: ${results.computedResults.pHs}<br> CO2eq: ${results.computedResults.CO2eq} mg/l`,
        ], // Display both pH and CO2 values
        hoverinfo: "text", // Show the text when hovering over the point
      };

      const traceLineBetweenPoints = {
        x: [TAC, TAC],
        y: [pH, results.computedResults.pHs],
        mode: "lines",
        type: "scatter",
        hoverinfo: "none",
        name: "From pH to pHs",
        line: {
          dash: "dash",
          color: "green",
        },
      };

      const arrowAnnotation = {
        x: Math.log10(TAC), // The x-coordinate where you want to place the arrow
        y: results.computedResults.pHs, // The y-coordinate where you want to place the arrow
        xref: "x", // Set to 'x' to specify that xCoordinate is in data coordinates
        yref: "y", // Set to 'y' to specify that yCoordinate is in data coordinates
        //text: "↑", // The text for the arrow (you can use a Unicode arrow character)
        showarrow: true, // Display the arrow
        arrowhead: 2, // Set arrowhead style to an upward arrow
        ax: 0, // No x-component of arrow tail
        ay: 30, // Adjust the y-component of arrow tail to control its position
        arrowcolor: "green", // Set the color of the arrow to green
      };
      const annotation2 = {
        x: Math.log10(15), // X-coordinate where you want to place the annotation
        y: 7, // Y-coordinate where you want to place the annotation
        text: "Corrosive Water", // Text label for the annotation
        showarrow: false, // Do not display an arrow
        font: {
          size: 14,
          color: "black", // Customize the font color
        },
      };
      const annotation3 = {
        x: Math.log10(15), // X-coordinate where you want to place the annotation
        y: 9.5, // Y-coordinate where you want to place the annotation
        text: "Incrustant Water", // Text label for the annotation
        showarrow: false, // Do not display an arrow
        font: {
          size: 14,
          color: "black", // Customize the font color
        },
      };

      function generateXAxisConfig(
        inTitle,
        minTAC,
        maxTAC,
        dtickVals,
        overlaying,
        side
      ) {
        const tickvals = [];
        const ticktext = [];

        for (let i = minTAC; i <= maxTAC; i += dtickVals) {
          tickvals.push(i);
          ticktext.push(i.toString());
        }
        // Define the x-axis configuration
        const xAxisConfig = {
          title: inTitle,
          type: "log",
          //range: [0, maxTAC],
          dtick: dtickVals, // Set the spacing between ticks
          tickvals: tickvals, // Specify the positions of ticks
          ticktext: ticktext, // Customize tick labels
          tickangle: -90,
          showline: true, // Display the x-axis line
          showgrid: true, // Display the x-axis grid lines
          gridcolor: "lightgray", // Grid color
          zeroline: false, // Hide the zero line
          rangemode: "tozero", // Ensure the x-axis starts from zero
          overlaying: overlaying, // "y" Overlay the second y-axis on top of the first
          side: side, //"right" Position the second y-axis on the right side
        };

        return xAxisConfig;
      }

      // Layout configuration
      const layout = {
        title: "Hallopeau And Dubin Graph",
        xaxis: generateXAxisConfig("Logarithmic TAC", 0, 100, 10, "y", "left"),
        yaxis: {
          title: "pH",
          range: [4, 11],
          type: "linear",
          dtick: 0.5,
          showline: true, // Display the y-axis line
          showgrid: true, // Display the y-axis grid lines
        },
        annotations: [arrowAnnotation, annotation2, annotation3], // Add the arrow annotation to the layout
        hovermode: "closest", // Show closest data on hover by default
      };
      // plot configuration
      const config = {
        displayModeBar: true, // Show the display mode bar (toolbar)
        displaylogo: false, // Hide the Plotly logo
      };

      // Combine traces and layout and plot the graph
      const data = [
        curveTrace,
        errorBandTrace,
        PointTrace,
        PointResultTrace,
        traceLineBetweenPoints,
      ];
      Plotly.newPlot("plotly-chart", data, layout, config);
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
