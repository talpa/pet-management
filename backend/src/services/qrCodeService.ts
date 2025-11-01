import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

// Ensure QR code directory exists
const qrDir = path.join(__dirname, '../../uploads/qrcodes');
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
}

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export class QRCodeService {
  private static readonly DEFAULT_OPTIONS: QRCodeOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  };

  /**
   * Generate QR code as base64 data URL
   */
  static async generateDataURL(text: string, options: QRCodeOptions = {}): Promise<string> {
    const qrOptions = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      const dataURL = await QRCode.toDataURL(text, qrOptions);
      return dataURL;
    } catch (error) {
      console.error('QR Code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate QR code and save as file
   */
  static async generateFile(text: string, filename: string, options: QRCodeOptions = {}): Promise<string> {
    const qrOptions = { ...this.DEFAULT_OPTIONS, ...options };
    const filePath = path.join(qrDir, filename);
    
    try {
      await QRCode.toFile(filePath, text, qrOptions);
      return filePath;
    } catch (error) {
      console.error('QR Code file generation error:', error);
      throw new Error('Failed to generate QR code file');
    }
  }

  /**
   * Generate QR code for animal profile
   */
  static async generateAnimalQRCode(animalId: number, seoUrl: string, baseUrl: string = process.env.CLIENT_URL || 'http://localhost:8080'): Promise<{
    dataURL: string;
    filePath?: string;
  }> {
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
    } catch (error) {
      console.error('Animal QR code generation error:', error);
      throw new Error('Failed to generate animal QR code');
    }
  }

  /**
   * Generate QR code with custom logo overlay (for future enhancement)
   */
  static async generateWithLogo(text: string, logoPath: string, options: QRCodeOptions = {}): Promise<string> {
    // This could be implemented using canvas or sharp for logo overlay
    // For now, return basic QR code
    return this.generateDataURL(text, options);
  }

  /**
   * Batch generate QR codes for multiple animals
   */
  static async generateBatch(animals: Array<{ id: number; seoUrl: string; name: string }>): Promise<Array<{
    animalId: number;
    dataURL: string;
    filePath?: string;
    error?: string;
  }>> {
    const results = await Promise.allSettled(
      animals.map(async (animal) => {
        const result = await this.generateAnimalQRCode(animal.id, animal.seoUrl);
        return {
          animalId: animal.id,
          ...result
        };
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          animalId: animals[index].id,
          dataURL: '',
          error: result.reason.message
        };
      }
    });
  }

  /**
   * Delete QR code file
   */
  static deleteQRCodeFile(filename: string): boolean {
    const filePath = path.join(qrDir, filename);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('QR code file deletion error:', error);
      return false;
    }
  }

  /**
   * Generate QR code for animal sharing with metadata
   */
  static async generateSharingQRCode(animal: {
    id: number;
    name: string;
    seoUrl: string;
    species: string;
    owner: string;
  }): Promise<{
    dataURL: string;
    shareUrl: string;
    filePath?: string;
  }> {
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

export default QRCodeService;