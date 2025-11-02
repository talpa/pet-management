"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRCodeService = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const qrDir = path_1.default.join(__dirname, '../../uploads/qrcodes');
if (!fs_1.default.existsSync(qrDir)) {
    fs_1.default.mkdirSync(qrDir, { recursive: true });
}
class QRCodeService {
    static async generateDataURL(text, options = {}) {
        const qrOptions = { ...this.DEFAULT_OPTIONS, ...options };
        try {
            const dataURL = await qrcode_1.default.toDataURL(text, qrOptions);
            return dataURL;
        }
        catch (error) {
            console.error('QR Code generation error:', error);
            throw new Error('Failed to generate QR code');
        }
    }
    static async generateFile(text, filename, options = {}) {
        const qrOptions = { ...this.DEFAULT_OPTIONS, ...options };
        const filePath = path_1.default.join(qrDir, filename);
        try {
            await qrcode_1.default.toFile(filePath, text, qrOptions);
            return filePath;
        }
        catch (error) {
            console.error('QR Code file generation error:', error);
            throw new Error('Failed to generate QR code file');
        }
    }
    static async generateAnimalQRCode(animalId, seoUrl, baseUrl = process.env.CLIENT_URL || 'http://localhost:8080') {
        const profileUrl = `${baseUrl}/animal/${seoUrl}`;
        const filename = `animal-${animalId}-${seoUrl}.png`;
        try {
            const [dataURL, filePath] = await Promise.all([
                this.generateDataURL(profileUrl, {
                    width: 300,
                    margin: 2,
                    errorCorrectionLevel: 'M'
                }),
                this.generateFile(profileUrl, filename, {
                    width: 300,
                    margin: 2,
                    errorCorrectionLevel: 'M'
                })
            ]);
            return {
                dataURL,
                filePath
            };
        }
        catch (error) {
            console.error('Animal QR code generation error:', error);
            throw new Error('Failed to generate animal QR code');
        }
    }
    static async generateWithLogo(text, logoPath, options = {}) {
        return this.generateDataURL(text, options);
    }
    static async generateBatch(animals) {
        const results = await Promise.allSettled(animals.map(async (animal) => {
            const result = await this.generateAnimalQRCode(animal.id, animal.seoUrl);
            return {
                animalId: animal.id,
                ...result
            };
        }));
        return results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            }
            else {
                return {
                    animalId: animals[index].id,
                    dataURL: '',
                    error: result.reason.message
                };
            }
        });
    }
    static deleteQRCodeFile(filename) {
        const filePath = path_1.default.join(qrDir, filename);
        try {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('QR code file deletion error:', error);
            return false;
        }
    }
    static async generateSharingQRCode(animal) {
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:8080';
        const shareUrl = `${baseUrl}/animal/${animal.seoUrl}?utm_source=qr&utm_medium=print&utm_campaign=animal_profile`;
        const qrResult = await this.generateAnimalQRCode(animal.id, animal.seoUrl, baseUrl);
        return {
            dataURL: qrResult.dataURL,
            shareUrl,
            filePath: qrResult.filePath
        };
    }
}
exports.QRCodeService = QRCodeService;
QRCodeService.DEFAULT_OPTIONS = {
    width: 300,
    margin: 2,
    color: {
        dark: '#000000',
        light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
};
exports.default = QRCodeService;
