/** @odoo-module **/
import { _t } from "@web/core/l10n/translation";
import { Component, useState, onRendered, onWillUpdateProps, useRef } from "@odoo/owl";
import { CONFIG } from "@my_saymon/config";
import {  paymentService } from "@my_saymon/app/screens/conversion_service";

export class CustomPaymentLinesCustomization extends Component {
    static template = "my_saymon.Custom_payment_lines_customization";
    static components = {};
    
    static props = {
        paymentLines: {
            type: Array,
            optional: true
        },
        order: {
            type: Object,
            optional: true,
            shape: {
                payment_ids: Array
            }
        },
        deleteLine: {
            type: Function,
            optional: true,
        },
    };

    setup() {
      //  debugger
        super.setup();
    
      
        this.numberInputRef = useRef("numberInput");
        const hasData = this.props.paymentLines && this.props.paymentLines.length > 0;
      //  const paymentMethodName = paymentService.getPaymentMethodName();
        this.state = useState({
            result: 0,
            hasData,
            inputValue: 0,
            ref_label: CONFIG.REF_LABEL,
            selectedCurrency: "USD",
            paymentMethodName: paymentService.getPaymentMethodName()
        });

        console.log("********Payment lines recibidas:", this.props.paymentLines || []);

       

        onRendered(() => {
            if (this.props.paymentLines && this.props.paymentLines.length > 0) {
                this.updateHasData(this.props.paymentLines);
            }
            this.state.paymentMethodName = paymentService.getPaymentMethodName();
        });

        onWillUpdateProps((nextProps) => {
            if (nextProps.paymentLines) {
                this.updateHasData(nextProps.paymentLines);
            } else {
                console.warn("No se recibieron nuevas líneas de pago.");
            }

            // Escuchar cambios en el nombre del método de pago
        const newPaymentMethodName = paymentService.getPaymentMethodName();
        if (newPaymentMethodName !== this.state.paymentMethodName) {
            this.state.paymentMethodName = newPaymentMethodName; // Actualiza el estado
           // this.updateLastPaymentLine(this.state.result); // Llama a updateLastPaymentLine si ha cambiado
        }
        });
    }

// Método para manejar el cambio de moneda
async onCurrencyChange(event) {
    const newCurrency = event.target.value; // Captura la moneda seleccionada
    // Actualiza el estado
    this.state.selectedCurrency = newCurrency;
    let fromCurrency =  this.state.selectedCurrency ==="USD"? "USD" :"VEF"; // Moneda de origen
    this.calculo(this.state.inputValue, fromCurrency)
}
onBlur(event){
    const inputElement = this.numberInputRef.el; // Accede al elemento del DOM
    if (inputElement) {
        inputElement.value = 0; // Inicializa el valor en 0
        this.state.inputValue = 0; // Actualiza el estado
        this.state.result = 0; // Reinicia el resultado
        console.log("El campo se ha inicializado en 0.");
    }
}

async onInputChange(event) {
    const inputValue = parseFloat(event.target.value) || 0; // Captura el valor del input
    this.state.inputValue=inputValue;
    let fromCurrency =  this.state.selectedCurrency ==="USD"? "USD" :"VEF"; // Moneda de origen
    this.calculo( this.state.inputValue, fromCurrency);
}

async calculo(inputValue, fromCurrency){
    //No vamos a llevar de VEF a USD
    let toCurrency   =  fromCurrency ==="VEF"?  "USD":"VEF"; // Moneda de destino
    //Siempore la vamos a llevar en VEF
    toCurrency ="VEF"
    try {
        const response = await fetch(`${CONFIG.API_URL}/convert_price`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                price_unit: inputValue,
                from_currency: fromCurrency,
                to_currency: toCurrency,
            }),
        });

        if (!response.ok) {
            throw new Error(`Error en la solicitud: ${response.statusText}`);
        }

        const data = await response.json();
        const {result} =data;
        if (data.error) {
            console.error("Error en la conversión:", data.error);
            this.state.result = 0; // Set a default value to avoid errors
        } else {
            this.state.result = parseFloat(result.converted_price) || 0; // Ensure the result is a valid number
            this.updateLastPaymentLine(this.state.result); // Manually trigger the update
            console.log("Precio convertido:", this.state.result);
        }
    } catch (error) {
        console.error("Error al convertir el precio:", error);
        this.state.result = 0; // Set a default value to avoid errors
    }
}

updateLastPaymentLine(newValue) {
    if (this.props.paymentLines && this.props.paymentLines.length > 0) {
        const lastLine = this.props.paymentLines[this.props.paymentLines.length - 1];
        //Secaldula el igtf
      //  debugger
        const igtf = Number(CONFIG.IGTF);
        if (this.state.paymentMethodName.toUpperCase() === 'IGTF') {
          //  lastLine.amount = ((igtf / 100) * lastLine.amount ) * -1 // Update the value of the last element
        }else{
            lastLine.amount = newValue; // Update the value of the last element
        }
        console.log("Última línea actualizada:", lastLine);
    } else {
        console.warn("No payment lines available to update.");
    }
}
   
  // Método sobrescrito para eliminar una línea y actualizar el estado
  deleteLineWithStateUpdate(uuid) {
    console.log('Llamando a deleteLine con UUID:', uuid);

    // Verifica si deleteLine está definido antes de llamarlo
   // if (typeof this.props.deleteLine === "function") {
     //   this.props.deleteLine(uuid); // Llama al método original

        // Actualiza el estado de hasData
        const hasData = this.props.paymentLines && this.props.paymentLines.length > 0;
        this.state.hasData = hasData;
    // } else {
    //     console.error("deleteLine no está definido en las propiedades del componente.");
    // }
}
    updateHasData(paymentLines = this.props.paymentLines || []) {
        this.state.hasData = paymentLines.length > 0;
        if (!this.state.hasData) {
            this.state.result = 0;
        }
    }

    // Otros métodos de tu clase...
}
