var moment = require('moment');
var myRestifyApi = require('my-restify-api');
var BadRequestError = myRestifyApi.error.BadRequestError;
var validPhoneRegex = /^\+(\d{2})(\d{9})$/;
var emailValidator = require("email-validator");
var validPos01Regex = /^[a-zA-Z]{3}\d{8}(\d{2})?$/;
var validPos02Regex = /^[a-zA-Z]{2}\d{8}$/;
var identification_numbers = require('identification-numbers');
var nip = identification_numbers.nip;

var receiptsModel = require('receipts-model');
var InvalidPointOfSaleError = receiptsModel.error.InvalidPointOfSaleError;
var InvalidPurchaseOrderNumberError = receiptsModel.error.InvalidPurchaseOrderNumberError;
var InvalidDateError = receiptsModel.error.InvalidDateError;
var InvalidAmountError = receiptsModel.error.InvalidAmountError;
var InvalidTaxRegistrationNumberError = receiptsModel.error.InvalidTaxRegistrationNumberError;
var InvalidEmailError = receiptsModel.error.InvalidEmailError;
var InvalidPhoneError = receiptsModel.error.InvalidPhoneError;
var InvalidTradeError = receiptsModel.error.InvalidTradeError;

var validateAmount = function validateAmount(amount, next) {

  if (!amount.value) {
    return next(new InvalidAmountError('Invalid number amount.value value', 'Błędna kwota sprzedaży', 'amount.value'));
  }

  var value = amount.value.replace(',', '.');

  try {
    value = parseFloat(value);
  }
  catch (e) {
    return next(new InvalidAmountError('Invalid number amount.value value', 'Błędna kwota sprzedaży', 'amount.value'));
  }

  if (value < 10.0) {
    return next(new InvalidAmountError('Invalid minimum amount.value value (10.00)', 'Wymagana minimalna kwota sprzedaży 10 zł', 'amount.value'));
  }
};

var validateDate = function validateDate(date, next) {
  var value = moment(date);

  if (!value) {
    return next(new InvalidDateError('Invalid date value', 'Błędna data sprzedaży', 'date'));
  }

  var now = moment();

  if (value.month() !== now.month()) {
    return next(new InvalidDateError('Invalid date month - must be the same as current', 'Paragon musi być zgłoszony do loterii w miesiącu zakupu.', 'date'));
  }
};

var validateEmail = function validateEmail(email, next) {
  var valid = emailValidator.validate(email);

  if (!valid) {
    return next(new InvalidEmailError('Invalid email value', 'Błędny adres email', 'email'));
  }
};

var validatePhone = function validatePhone(phone, next) {
  var result = phone.match(validPhoneRegex);

  if (!result) {
    return next(new InvalidPhoneError('Invalid phone value', 'Błędny numer telefonu', 'phone'));
  }
  if (result[1] !== '48') {
    return next(new InvalidPhoneError('Phone number must be from poland (+48)', 'Numer telefonu musi zaczynać się od +48', 'phone'));
  }

  return result[2];
};

var validatePointOfSale = function validatePointOfSale(pos, next) {
  var result = pos.match(validPos01Regex) || pos.match(validPos02Regex);

  if (!result) {
    return next(new InvalidPointOfSaleError('Invalid pointOfSale value', 'Błędny numer kasy rejestrującej', 'pointOfSale'));
  }
};

var validateTaxRegistrationNumber = function validateTaxRegistrationNumber(tax, next) {
  if (tax.length !== 10) {
    return next(new InvalidTaxRegistrationNumberError('Invalid taxRegistrationNumber value', 'Prawidłowy numer NIP składa się z 10 znaków', 'taxRegistrationNumber'));
  }

  if (!nip(tax).isValid()) {
    return next(new InvalidTaxRegistrationNumberError('Invalid taxRegistrationNumber value', 'Błędny numer NIP', 'taxRegistrationNumber'));
  }
};

var validatePurchaseOrderNumber = function validatePurchaseOrderNumber(pos, next) {
  if (!pos) {
    return next(new InvalidPurchaseOrderNumberError('Invalid purchaseOrderNumber value', 'Błędny numer wydruku z paragonu ', 'purchaseOrderNumber'));
  }
};

var validateTrade = function validateTrade(trade, next) {
  if (!trade) {
    return next(new InvalidTradeError('Invalid trade value', 'Wybrana branża jest jeszcze niedostępna', 'trade'));
  }
};


module.exports = {
  validateAmount: validateAmount,
  validateDate: validateDate,
  validateEmail: validateEmail,
  validatePhone: validatePhone,
  validatePointOfSale: validatePointOfSale,
  validateTaxRegistrationNumber: validateTaxRegistrationNumber,
  validatePurchaseOrderNumber: validatePurchaseOrderNumber,
  validateTrade: validateTrade
};
