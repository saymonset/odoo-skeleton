// currencyConverter.js
import { CONFIG } from "@my_saymon/config";

export async function convertCurrency(inputValue, fromCurrency) {
    let toCurrency = "VEF"; // Siempre convertimos a VEF

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
        const { result } = data;
        if (data.error) {
            console.error("Error en la conversión:", data.error);
            return 0; // Valor predeterminado en caso de error
        } else {
            return parseFloat(result.converted_price) || 0; // Asegura que el resultado sea un número válido
        }
    } catch (error) {
        console.error("Error al convertir el precio:", error);
        return 0; // Valor predeterminado en caso de error
    }
}
