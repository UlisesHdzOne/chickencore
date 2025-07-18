export class AddressValidator {
  static validatePostalCode(code: string): boolean {
    return /^[\d-]+$/.test(code);
  }

  static validateMexicanPostalCode(code: string): boolean {
    return /^\d{5}$/.test(code);
  }

  static validateMexicanState(state: string): boolean {
    const states = [
      'Aguascalientes',
      'Baja California',
      'Baja California Sur',
      'Campeche',
      'Chiapas',
      'Chihuahua',
      'Coahuila',
      'Colima',
      'Durango',
      'Guanajuato',
      'Guerrero',
      'Hidalgo',
      'Jalisco',
      'México',
      'Michoacán',
      'Morelos',
      'Nayarit',
      'Nuevo León',
      'Oaxaca',
      'Puebla',
      'Querétaro',
      'Quintana Roo',
      'San Luis Potosí',
      'Sinaloa',
      'Sonora',
      'Tabasco',
      'Tamaulipas',
      'Tlaxcala',
      'Veracruz',
      'Yucatán',
      'Zacatecas',
      'Ciudad de México',
    ];
    return states.some((valid) => valid.toLowerCase() === state.toLowerCase());
  }

  static hasInvalidCharacters(text: string): boolean {
    return !/^[a-zA-ZÁÉÍÓÚáéíóúÑñ0-9\s\-#.,]+$/.test(text);
  }
}
