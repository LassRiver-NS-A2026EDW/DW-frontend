import type { Gender } from "../api/auth";
import type { Book } from "../mocks/mockData";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HTTP_URL_RE = /^https?:\/\/\S+$/i;
const GENDERS: Gender[] = ["F", "M", "OTHER", "NR"];
export const MINIMUM_REGISTER_AGE_YEARS = 13;

export function localDateIso(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function maxBirthDateForMinimumAge(minimumAge = MINIMUM_REGISTER_AGE_YEARS): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - minimumAge);
  return localDateIso(date);
}

export function firstError(errors: string[]): string | null {
  return errors[0] ?? null;
}

function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

function isPastLocalDate(value: string): boolean {
  return Boolean(value) && value < localDateIso();
}

function isAtLeastMinimumAge(value: string): boolean {
  return Boolean(value) && value <= maxBirthDateForMinimumAge();
}

function isPositiveInteger(value: unknown): boolean {
  return Number.isInteger(Number(value)) && Number(value) > 0;
}

function pushIf(errors: string[], condition: boolean, message: string) {
  if (condition) errors.push(message);
}

export function validateLogin(input: { email: string; password: string }): string[] {
  const errors: string[] = [];
  pushIf(errors, !input.email.trim(), "El correo es obligatorio");
  pushIf(errors, Boolean(input.email.trim()) && !isEmail(input.email), "El correo no tiene un formato valido");
  pushIf(errors, !input.password, "La contrasena es obligatoria");
  return errors;
}

export function validateRegister(input: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: Gender;
  birthDate: string;
  passwordIsStrong: boolean;
}): string[] {
  const errors: string[] = [];
  const name = input.name.trim();

  pushIf(errors, !name, "El nombre es obligatorio");
  pushIf(errors, Boolean(name) && (name.length < 3 || name.length > 50), "El nombre debe tener entre 3 y 50 caracteres");
  pushIf(errors, !input.email.trim(), "El correo es obligatorio");
  pushIf(errors, Boolean(input.email.trim()) && !isEmail(input.email), "El correo no tiene un formato valido");
  pushIf(errors, !input.password, "La contrasena es obligatoria");
  pushIf(errors, Boolean(input.password) && input.password.length < 8, "La contrasena debe tener al menos 8 caracteres");
  pushIf(errors, Boolean(input.password) && !input.passwordIsStrong, "La contrasena no cumple los criterios de seguridad");
  pushIf(errors, input.password !== input.confirmPassword, "Las contrasenas no coinciden");
  pushIf(errors, !GENDERS.includes(input.gender), "Selecciona un genero valido");
  pushIf(errors, !input.birthDate, "La fecha de nacimiento es obligatoria");
  pushIf(errors, Boolean(input.birthDate) && !isPastLocalDate(input.birthDate), "La fecha de nacimiento debe ser anterior a hoy");
  pushIf(
    errors,
    Boolean(input.birthDate) && isPastLocalDate(input.birthDate) && !isAtLeastMinimumAge(input.birthDate),
    `La fecha de nacimiento debe indicar una edad minima de ${MINIMUM_REGISTER_AGE_YEARS} anos`
  );

  return errors;
}

export function validateProfile(input: { name: string; email: string }): string[] {
  const errors: string[] = [];
  const name = input.name.trim();

  pushIf(errors, !name, "El nombre es obligatorio");
  pushIf(errors, Boolean(name) && (name.length < 3 || name.length > 50), "El nombre debe tener entre 3 y 50 caracteres");
  pushIf(errors, !input.email.trim(), "El correo es obligatorio");
  pushIf(errors, Boolean(input.email.trim()) && !isEmail(input.email), "El correo no tiene un formato valido");

  return errors;
}

export function validatePasswordChange(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  passwordIsStrong: boolean;
}): string[] {
  const errors: string[] = [];
  pushIf(errors, !input.currentPassword, "La contrasena actual es obligatoria");
  pushIf(errors, !input.newPassword, "La nueva contrasena es obligatoria");
  pushIf(errors, Boolean(input.newPassword) && input.newPassword.length < 8, "La nueva contrasena debe tener al menos 8 caracteres");
  pushIf(errors, Boolean(input.newPassword) && !input.passwordIsStrong, "La nueva contrasena no cumple los criterios de seguridad");
  pushIf(errors, input.newPassword !== input.confirmPassword, "Las contrasenas no coinciden");
  pushIf(errors, Boolean(input.currentPassword) && input.currentPassword === input.newPassword, "La nueva contrasena debe ser diferente a la actual");
  return errors;
}

export function validateReview(input: { bookId: string | number; rating: number; comment: string }): string[] {
  const errors: string[] = [];
  const comment = input.comment.trim();

  pushIf(errors, !isPositiveInteger(input.bookId), "El libro es obligatorio");
  pushIf(errors, !Number.isInteger(Number(input.rating)) || input.rating < 1 || input.rating > 5, "La calificacion debe estar entre 1 y 5");
  pushIf(errors, !comment, "El comentario es obligatorio");
  pushIf(errors, comment.length > 2000, "El comentario no puede superar 2000 caracteres");

  return errors;
}

export function validateLoan(input: { bookId: string | number; durationMinutes?: number }): string[] {
  const errors: string[] = [];
  pushIf(errors, !isPositiveInteger(input.bookId), "El libro es obligatorio");
  if (input.durationMinutes !== undefined) {
    pushIf(errors, !Number.isInteger(Number(input.durationMinutes)), "La duracion debe ser un numero entero");
    pushIf(errors, Number(input.durationMinutes) < 5, "La duracion minima del prestamo es 5 minutos");
    pushIf(errors, Number(input.durationMinutes) > 10080, "La duracion maxima del prestamo es una semana");
  }
  return errors;
}

export function validateBook(input: Omit<Book, "id"> | Book): string[] {
  const errors: string[] = [];
  const coverUrl = input.coverUrl?.trim();

  pushIf(errors, !input.title.trim(), "El titulo es obligatorio");
  pushIf(errors, input.title.trim().length > 255, "El titulo no puede superar 255 caracteres");
  pushIf(errors, !input.author.trim(), "El autor es obligatorio");
  pushIf(errors, input.author.trim().length > 255, "El autor no puede superar 255 caracteres");
  pushIf(errors, !input.isbn.trim(), "El ISBN es obligatorio");
  pushIf(errors, input.isbn.trim().length > 20, "El ISBN no puede superar 20 caracteres");
  pushIf(errors, input.category.trim().length > 100, "La categoria no puede superar 100 caracteres");
  pushIf(errors, input.language.trim().length > 10, "El idioma no puede superar 10 caracteres");
  pushIf(errors, Boolean(coverUrl) && !HTTP_URL_RE.test(coverUrl), "La URL de portada debe iniciar con http:// o https://");
  pushIf(errors, Boolean(coverUrl) && coverUrl.length > 2000, "La URL de portada no puede superar 2000 caracteres");
  pushIf(errors, input.publisher.trim().length > 255, "La editorial no puede superar 255 caracteres");
  pushIf(errors, Boolean(input.pages) && !isPositiveInteger(input.pages), "El numero de paginas debe ser positivo");
  pushIf(errors, input.description.length > 5000, "La descripcion no puede superar 5000 caracteres");

  return errors;
}
