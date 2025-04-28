/** @odoo-module **/
import { _t } from "@web/core/l10n/translation";
import { Component, useState, onRendered , onWillUpdateProps, onWillStart, useRef } from "@odoo/owl";
import { CONFIG } from "@my_saymon/config";

export class CustomPaymentLinesCustomization extends Component {
    static template = "my_saymon.Custom_payment_lines_customization";
    static components = {};
    // Define las propiedades que el componente espera recibir
    static props = {
     paymentLines: Array, // Asegúrate de que el tipo sea correcto
    };
    setup() {
        
      super.setup();
       // Estado para almacenar el resultado
       this.state = useState({
          result: 0,hasData:false, // Resultado inicial
      });

      
      
        console.log("********Payment lines recibidas:", this.props.paymentLines || []);

      
      onRendered(() => {
        if (this.props.paymentLines && this.props.paymentLines.length > 0) {
            this.updateHasData(this.props.paymentLines);
        }
    });
    
    
      
    onWillUpdateProps((nextProps) => {
        if (nextProps.paymentLines) {
            console.log("******************Props actualizadas:", nextProps);
            this.updateHasData(nextProps.paymentLines);
        } else {
            console.warn("No se recibieron nuevas líneas de pago.");
        }
    });
    
  }

  updateHasData(paymentLines = this.props.paymentLines || []) {
    this.state.hasData = paymentLines.length > 0;
    if (!this.state.hasData) {
        this.state.result = 0;
    }
}

async onInputChange(event) {
    const inputValue = parseFloat(event.target.value) || 0; // Captura el valor del input
    console.log("Valor ingresado:", inputValue);

    const fromCurrency = "VEF"; // Moneda de origen
    const toCurrency = "USD"; // Moneda de destino

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
            console.log("Precio convertido:", this.state.result);
        }
    } catch (error) {
        console.error("Error al convertir el precio:", error);
        this.state.result = 0; // Set a default value to avoid errors
    }
}


async onInputChangeXX(event) {
    const inputValue = parseFloat(event.target.value) || 0; // Captura el valor del input
    console.log("Valor ingresado:", inputValue);

    // Llamada al backend para convertir el precio
    const fromCurrency = "EUR"; // Ejemplo: Moneda de origen
    const toCurrency = "USD"; // Ejemplo: Moneda de destino

    try {
        const convertedPrice = await this.rpc({
            model: "sale.order",
            method: "convert_price_to_currency",
            args: [inputValue, fromCurrency, toCurrency],
        });

        this.state.result = convertedPrice; // Actualiza el estado con el precio convertido
        console.log("Precio convertido:", convertedPrice);
    } catch (error) {
        console.error("Error al convertir el precio:", error);
    }
}

  // Función para manejar el evento input
  onInputChangexx(event) {
    const inputValue = parseFloat(event.target.value) || 0; // Captura el valor del input
    this.state.result = inputValue * 62; // Multiplica el valor por 62
    console.log("Resultado actualizado:", this.state.result); // Muestra el resultado en la consola
}

// calculateAmountSaymon(line) {
//     // Lógica personalizada para calcular el campo en el frontend (si es necesario)
//     return line.get_amount() * 62; // Ejemplo: multiplicar por 1.5
// }

updateLastPaymentLine(newValue) {
    if (this.props.paymentLines && this.props.paymentLines.length > 0) {
        const lastLine = this.props.paymentLines[this.props.paymentLines.length - 1];
        lastLine.amount = newValue; // Update the value of the last element
        console.log("Última línea actualizada:", lastLine);
    } else {
        console.warn("No payment lines available to update.");
    }
}
// Sobrescribe el método addNewPaymentLine
async onClick() {
    console.log("Lineas...Custom button paymentScreen.");
    // Lógica adicional aquí
}

}
 