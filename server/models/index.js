/**
 * Import models here so Mongoose registers schemas before route handlers run.
 */
import User from './User.js';
import Prompt from './Prompt.js';

export { User, Prompt };
