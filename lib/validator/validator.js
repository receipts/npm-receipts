var moment = require('moment');
var myRestifyApi = require('my-restify-api');
var BadRequestError = myRestifyApi.error.BadRequestError;
var validPhoneRegex = /^\+(\d{2})(\d{9})$/;
var emailValidator = require("email-validator");
var validPos01Regex = /^[a-zA-Z]{3}\d{8}(\d{2})?$/;
var validPos02Regex = /^[a-zA-Z]{2}\d{8}$/;
var identification_numbers = require('identification-numbers');
var nip = identification_numbers.nip;


var validateAmount = function validateAmount(amount, next) {
  var value = amount.value.replace(',', '.');

  try {
    value = parseFloat(value);
  }
  catch (e) {
    return next(new BadRequestError('Invalid number amount.value value', 'Błędna kwota sprzedaży'));
  }

  if (value < 10.0) {
    return next(new BadRequestError('Invalid minimum amount.value value (10.00)', 'Wymagana minimalna kwota sprzedaży 10 zł'));
  }

  return value;
};

var validateDate = function validateDate(date, next) {
  var value = moment(date);

  if (!value) {
    return next(new BadRequestError('Invalid date value', 'Błędna data sprzedaży'));
  }

  var now = moment();

  if (value.month() !== now.month()) {
    return next(new BadRequestError('Invalid date month - must be the same as current', 'Paragon musi być zgłoszony do loterii w miesiącu zakupu.'));
  }
};

var validateEmail = function validateEmail(email, next) {
  var valid = emailValidator.validate(email);

  if (!valid) {
    return next(new BadRequestError('Invalid email value', 'Błędny adres email'));
  }
};

var validatePhone = function validatePhone(phone, next) {
  var result = phone.match(validPhoneRegex);

  if (!result) {
    return next(new BadRequestError('Invalid phone value', 'Błędny numer telefonu'));
  }
  if (result[1] !== '48') {
    return next(new BadRequestError('Phone number must be from poland (+48)', 'Numer telefonu musi zaczynać się od +48'));
  }

  return result[2];
};

var validatePointOfSale = function validatePointOfSale(pos, next) {
  var result = pos.match(validPos01Regex) || pos.match(validPos02Regex);

  if (!result) {
    return next(new BadRequestError('Invalid pointOfSale value', 'Błędny numer kasy rejestrującej'));
  }
};

var validateTaxRegistrationNumber = function validateTaxRegistrationNumber(tax, next) {
  if (tax.length !== 10) {
    return next(new BadRequestError('Invalid taxRegistrationNumber value', 'Prawidłowy numer NIP składa się z 10 znaków'));
  }

  if (!nip(tax).isValid()) {
    return next(new BadRequestError('Invalid taxRegistrationNumber value', 'Błędny numer NIP'));
  }
};

module.exports = {
  validateAmount: validateAmount,
  validateDate: validateDate,
  validateEmail: validateEmail,
  validatePhone: validatePhone,
  validatePointOfSale: validatePointOfSale,
  validateTaxRegistrationNumber: validateTaxRegistrationNumber
};
