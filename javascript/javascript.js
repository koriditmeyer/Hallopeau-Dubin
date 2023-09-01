console.log("Start");
alert("Welcome to this online tool to calculate if water is at equilibrium"
    + "\n according to Hallopeau-Dubin");
  

//  Numbers of decimals to round results displayed
const roundnumber = 3;

// Variable declarations
let WaterName, temperature, pH, TAC, calcium, DryResidual;

//------------------------------------------------------------------------------------------------
//--------------------------- CLASS AND FUNCTIONS DEFINITION -------------------------------------

// Declaration of class of one water and constructor
class water {
    constructor(WaterName, temperature, pH, TAC, calcium, DryResidual) {
        this.WaterName= WaterName;
        this.temperature = temperature;
        this.pH = pH;
        this.TAC = TAC;
        this.calcium = calcium;
        this.DryResidual = DryResidual;
    }
    Input(){
        //input function
        let i=0;
        do {
            
            if (i>0) {alert("Please enter valid Numerical Numbers");}

            this.WaterName = prompt("Input Name of Sample", "Water from well in March");
            this.temperature = parseFloat(prompt("Input Temperature (ºC)", 25));
            this.pH = parseFloat(prompt("Input pH between 5 to 10", 7.3));
            this.TAC = parseFloat(prompt("Input TAC (ºF) between 0.5 to 100", 30));
            this.calcium = parseFloat(prompt("Input Calcium (ºF) superior to 0", 65));
            this.DryResidual = parseFloat(prompt("Input Dry Residual (mg/l)", 986.11));
            i++;
        }
        while (
            // check if not number or infinite
            !Number.isFinite(this.temperature)
            || !Number.isFinite(this.pH)
            || !Number.isFinite(this.TAC)
            || !Number.isFinite(this.calcium)
            || !Number.isFinite(this.DryResidual)
        )
    }

    PrintInput(){
        alert("Input: \n -WaterName: " + this.WaterName
    + "\n -Temperature: " + this.temperature.toFixed(roundnumber)
    + "\n -pH: " + this.pH.toFixed(roundnumber)
    + "\n -TAC: " + this.TAC.toFixed(roundnumber)
    + "\n -Calcium: " + this.calcium.toFixed(roundnumber)
    + "\n -Dry Residual: " + this.DryResidual.toFixed(roundnumber));
    }

    ErrorCheck() {
        if ((this.pH < 5 || this.pH > 10)
            || (this.TAC < 0.5 || this.TAC > 100)
            || (this.calcium < 0)) {
            alert("☹️ Parameters outside of Hallopeau-Dubin boundaries")
            return false;
        }
        else {
            alert("😍 Parameters within Hallopeau-Dubin boundaries")
            return true;
        }
    }

    HallopeauDubin(){
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
        let pK2 = (temperature) => { return 10.627 - 15.04 * (temperature / 1000) + 135.3 * Math.pow((temperature / 1000), 2) - 328 * Math.pow((temperature / 1000), 3) };
        // Calculation of pk'2
        let pK_2 = (pK2, EP2) => { return pK2 - EP2 };
        // Calculation of equilibrium constant pks - according to Larson & Boswell
        let pKs = (temperature) => { return 8.022 + 14 * (temperature / 1000) - 61 * Math.pow((temperature / 1000), 2) + 444 * Math.pow((temperature / 1000), 3) };
        // Calculation of pK's
        let pK_s = (pKs, EP4) => { return pKs - EP4 };
        // Calculation of C' - according to Hallopeau
        let C_ = (pK_2, pK_s) => { return pK_2 - pK_s + 9.195 };
        // Calculation of p parameter - according to Hallopeau
        function Lp(pH, pK_2) {
            var H_ions = Math.pow(10, -pH);
            var K_2 = Math.pow(10, -pK_2);
            var p = 1 + (2 * K_2 / H_ions);
            var Lp = Math.log10(p);
            return Lp;
        }
        // Calculation of pHs
        let pHs = (C_, TAC, calcium, Lp) => { return C_ - (Math.log10(TAC * 5.6) + Math.log10(calcium * 5.6)) + Lp };
        // Calculation of LSI
        let LSI = (pH, pHs) => { return pH - pHs };
        // Calculation of Ryznar (IR)
        let IR = (pH, calc_pHs) => { return 2 * calc_pHs - pH };
    
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

        // Print Results
        console.log("EP1 " + calc_EP.EP1.toFixed(roundnumber));
        console.log("EP2 " + cal_EP2.toFixed(roundnumber));
        console.log("EP4 " + calc_EP4.toFixed(roundnumber));
        console.log("pK2 " + calc_pK2.toFixed(roundnumber));
        console.log("pK'2 " + calc_pK_2.toFixed(roundnumber));
        console.log("pKs " + calc_pKs.toFixed(roundnumber));
        console.log("pK's " + calc_pK_s.toFixed(roundnumber));
        console.log("C' " + calc_C_.toFixed(roundnumber));
        console.log("Lp " + calc_Lp.toFixed(roundnumber));
        console.log("pHs " + calc_pHs.toFixed(roundnumber));
        console.log("LSI " + calc_LSI.toFixed(roundnumber));
        console.log("IR " + calc_IR.toFixed(roundnumber));
        
        this.calc_pHs = calc_pHs;
        this.calc_LSI = calc_LSI;
        this.calc_IR = calc_IR;

        return {
            calc_pHs,
            calc_LSI,
            calc_IR
        }

            
    
    }

    // Meaning o LSI 
    LSI_Meaning_() {
        let Meaning;
        if (this.calc_LSI < -0.1) {
            Meaning = ("According to Langelier Index there is a risk of corrosion (to limestone)");
        }
        else if (this.calc_LSI >= -0.1 && this.calc_LSI <= 0.1) {
            Meaning = ("According to Langelier Index the water is at the equilibrium point");
        }
        else if (this.calc_LSI > 0.1) {
            Meaning = ("According to Langelier Index there is a risk of inscrutation");
        }
        else {
            Meaning = ("Error in calculating the Langelier Index");
        }
        return Meaning;
        
    }

    // Meaning of IR
   IR_Meaning_() {
        let Meaning;
        if (this.calc_IR <= 5) {
            Meaning = ("According to Ryznar Index there is a high risk of incrustation");
        }
        else if (this.calc_IR > 5 && this.calc_IR <= 6) {
            Meaning = ("According to Ryznar Index there is a risk of incrustation of heating pipes (Temperature> 60ºC)");
        }
        else if (this.calc_IR > 6 && this.calc_IR <= 6.5) {
            Meaning = ("According to Ryznar Index there is a low risk of incrustation");
        }
        else if (this.calc_IR > 6.5 && this.calc_IR <= 7.2) {
            Meaning = ("According to Ryznar Index there is a low risk of corrosion");
        }
        else if (this.calc_IR > 7.2 && this.calc_IR <= 7.8) {
            Meaning = ("According to Ryznar Index there is a moderate risk of corrosion (high if Temperature> 60ºC)");
        }
        else if (this.calc_IR > 7.8 && this.calc_IR <= 8.5) {
            Meaning = ("According to Ryznar Index there is a high risk of corrosion (very high if Temperature> 15ºC)");
        }
        else if (this.calc_IR > 8.5) {
            Meaning = ("According to Ryznar Index there is a very high risk of corrosion");
        }
        else {
            Meaning = ("Error in calculating the Ryznar Index");
        }
        return Meaning;
    }

    PrintResults(){
        let LSI_Meaning = this.LSI_Meaning_();
        let IR_Meaning = this.IR_Meaning_();
        
        //Display results
        let results = document.getElementById("Results");
        results.innerHTML=`
        <h4>Results:</h4>
        <p>pHs: ${(this.calc_pHs).toFixed(roundnumber)}</p>
        <p>LSI: ${(this.calc_LSI).toFixed(roundnumber)} <br>${LSI_Meaning}</p>
        <p>IR: ${(this.calc_IR).toFixed(roundnumber)}<br>${IR_Meaning}</p>
        `;
        document.body.append(results);
    }

    
}

// Class that hold all the waters caracteristics
class waters {
    constructor(){
        this.watersArray=[]
    }
    // create new water and save it in the array
    NewWater(){
        let w= new water();
        w.Input();
        w.PrintInput();
        //Check Error
        let isWithinBoundaries =w.ErrorCheck();
        if (isWithinBoundaries) {
            this.watersArray.push(w);
        }
        else {
            alert ("try again");
            // redo input function
            this.NewWater();
        }
    }
    ComputeAll(){
        // Iterate for each element
        this.watersArray.forEach(
            waterSample => {
                let results = waterSample.HallopeauDubin();
                console.log(results);
                waterSample.PrintResults();
            }
        );
       
    }
    PrintAll(){

    }
    // return all waters
    all_(){
        return this.waters
    }
    // other elements like statistics averages...
    // to implement in future
}
//------------------------------------------------------------------------------------------------
//--------------------------- CALL OF CLASS AND FUNCTIONS ----------------------------------------

// Create an instance of the waters class
let waterCollection = new waters();
// Number of water samples
let numberOfInputs = parseInt(prompt("How many water samples would you like to input?"));
// Call the new_ method on the instance
for(let i = 0; i < numberOfInputs; i++) {
    waterCollection.NewWater();
}
// Compute the results with Hallopeau-Dubin
waterCollection.ComputeAll();











