"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendPasswordResetEmail = sendPasswordResetEmail;
var nodemailer_1 = require("nodemailer");
// Email configuration that can be easily changed for different providers
var getEmailConfig = function () {
    // Use environment variables with fallbacks for Gmail configuration
    var config = {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "465", 10),
        secure: process.env.SMTP_SECURE === 'true' || (process.env.SMTP_PORT === "465"), // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    };
    return config;
};
/**
 * Sends an email using the configured SMTP provider
 * @param options - Email options
 * @param options.to - Recipient email address
 * @param options.subject - Email subject
 * @param options.text - Plain text body
 * @param options.html - HTML body
 * @returns Transporter response
 */
function sendEmail(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var transporter, info, error_1;
        var to = _b.to, subject = _b.subject, text = _b.text, html = _b.html;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    // Validate required environment variables
                    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                        throw new Error('EMAIL_USER and EMAIL_PASS environment variables are required');
                    }
                    transporter = (0, nodemailer_1.createTransport)(getEmailConfig());
                    // Verify connection configuration
                    return [4 /*yield*/, transporter.verify()];
                case 1:
                    // Verify connection configuration
                    _c.sent();
                    return [4 /*yield*/, transporter.sendMail({
                            from: process.env.EMAIL_USER,
                            to: to,
                            subject: subject,
                            text: text,
                            html: html,
                        })];
                case 2:
                    info = _c.sent();
                    return [2 /*return*/, {
                            success: true,
                            messageId: info.messageId,
                        }];
                case 3:
                    error_1 = _c.sent();
                    console.error('Error sending email:', error_1);
                    throw new Error("Failed to send email: ".concat(error_1.message));
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Sends a password reset email
 * @param to - Recipient email address
 * @param resetUrl - Password reset URL
 */
function sendPasswordResetEmail(to, resetUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var subject, text, html;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    subject = "Password Reset Request";
                    text = "You requested a password reset. Click here to reset: ".concat(resetUrl, "\n\nIf you didn't request this, please ignore this email.");
                    html = "\n    <p>You requested a password reset.</p>\n    <p><a href=\"".concat(resetUrl, "\">Click here to reset your password</a></p>\n    <p>If you didn't request this, please ignore this email.</p>\n  ");
                    return [4 /*yield*/, sendEmail({ to: to, subject: subject, text: text, html: html })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
