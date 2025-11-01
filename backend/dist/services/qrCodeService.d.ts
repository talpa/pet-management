export interface QRCodeOptions {
    width?: number;
    margin?: number;
    color?: {
        dark?: string;
        light?: string;
    };
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}
export declare class QRCodeService {
    private static readonly DEFAULT_OPTIONS;
    static generateDataURL(text: string, options?: QRCodeOptions): Promise<string>;
    static generateFile(text: string, filename: string, options?: QRCodeOptions): Promise<string>;
    static generateAnimalQRCode(animalId: number, seoUrl: string, baseUrl?: string): Promise<{
        dataURL: string;
        filePath?: string;
    }>;
    static generateWithLogo(text: string, logoPath: string, options?: QRCodeOptions): Promise<string>;
    static generateBatch(animals: Array<{
        id: number;
        seoUrl: string;
        name: string;
    }>): Promise<Array<{
        animalId: number;
        dataURL: string;
        filePath?: string;
        error?: string;
    }>>;
    static deleteQRCodeFile(filename: string): boolean;
    static generateSharingQRCode(animal: {
        id: number;
        name: string;
        seoUrl: string;
        species: string;
        owner: string;
    }): Promise<{
        dataURL: string;
        shareUrl: string;
        filePath?: string;
    }>;
}
export default QRCodeService;
//# sourceMappingURL=qrCodeService.d.ts.map