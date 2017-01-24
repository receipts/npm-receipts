'use strict';

const moment = require('moment');
const validPhoneRegex = /^\+(\d{2})(\d{9})$/;
const emailValidator = require('email-validator');
const validPos01Regex = /^[a-zA-Z]{3}\d{8}(\d{2})?$/;
const validPos02Regex = /^[a-zA-Z]{2}\d{8}$/;
const identificationNumbers = require('identification-numbers');
const nip = identificationNumbers.nip;

const receiptsModel = require('receipts-model');
const InvalidPointOfSaleError = receiptsModel.error.InvalidPointOfSaleError;
const InvalidPurchaseOrderNumberError = receiptsModel.error.InvalidPurchaseOrderNumberError;
const InvalidDateError = receiptsModel.error.InvalidDateError;
const InvalidAmountError = receiptsModel.error.InvalidAmountError;
const InvalidTaxRegistrationNumberError = receiptsModel.error.InvalidTaxRegistrationNumberError;
const InvalidEmailError = receiptsModel.error.InvalidEmailError;
const InvalidPhoneError = receiptsModel.error.InvalidPhoneError;
const InvalidTradeError = receiptsModel.error.InvalidTradeError;

const validateAmount = function validateAmount(amount, next) {

  if (!amount.value) {
    return next(new InvalidAmountError('Invalid number amount.value value', 'Błędna kwota sprzedaży', 'amount.value'));
  }

  let value = amount.value.replace(',', '.');

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

const validateDate = function validateDate(date, next) {
  const value = moment(date);

  if (!value) {
    return next(new InvalidDateError('Invalid date value', 'Błędna data sprzedaży', 'date'));
  }

  const now = moment();

  if (value.month() !== now.month()) {
    return next(new InvalidDateError('Invalid date month - must be the same as current', 'Paragon musi być zgłoszony do loterii w miesiącu zakupu.', 'date'));
  }
};

const validateEmail = function validateEmail(email, next) {
  const valid = emailValidator.validate(email);

  if (!valid) {
    return next(new InvalidEmailError('Invalid email value', 'Błędny adres email', 'email'));
  }
};

const validatePhone = function validatePhone(phone, next) {
  const result = phone.match(validPhoneRegex);

  if (!result) {
    return next(new InvalidPhoneError('Invalid phone value', 'Błędny numer telefonu', 'phone'));
  }
  if (result[1] !== '48') {
    return next(new InvalidPhoneError('Phone number must be from poland (+48)', 'Numer telefonu musi zaczynać się od +48', 'phone'));
  }

  return result[2];
};

const validatePointOfSale = function validatePointOfSale(pos, next) {
  const result = pos.match(validPos01Regex) || pos.match(validPos02Regex);

  if (!result) {
    return next(new InvalidPointOfSaleError('Invalid pointOfSale value', 'Błędny numer kasy rejestrującej', 'pointOfSale'));
  }
};

const validateTaxRegistrationNumber = function validateTaxRegistrationNumber(tax, next) {
  if (tax.length !== 10) {
    return next(new InvalidTaxRegistrationNumberError('Invalid taxRegistrationNumber value', 'Prawidłowy numer NIP składa się z 10 znaków', 'taxRegistrationNumber'));
  }

  if (!nip(tax).isValid()) {
    return next(new InvalidTaxRegistrationNumberError('Invalid taxRegistrationNumber value', 'Błędny numer NIP', 'taxRegistrationNumber'));
  }
};

const validatePurchaseOrderNumber = function validatePurchaseOrderNumber(pos, next) {
  if (!pos) {
    return next(new InvalidPurchaseOrderNumberError('Invalid purchaseOrderNumber value', 'Błędny numer wydruku z paragonu ', 'purchaseOrderNumber'));
  }
};

const validateTrade = function validateTrade(trade, next) {
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
