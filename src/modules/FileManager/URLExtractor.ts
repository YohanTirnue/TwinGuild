export class URLExtractor {
  private static readonly URL_REGEX = /(https?:\/\/[^\s]+)/g;

  /**
   * Extract all URLs from text
   */
  static extractUrls(text: string): string[] {
    if (!text) return [];

    const matches = text.match(this.URL_REGEX);
    if (!matches) return [];

    // Remove duplicates and clean URLs
    const urls = [...new Set(matches)].map(url => this.cleanUrl(url));

    return urls;
  }

  /**
   * Clean URL by removing trailing punctuation and markdown
   */
  private static cleanUrl(url: string): string {
    // Remove trailing punctuation
    url = url.replace(/[.,;:!?)\]}>]+$/, '');

    // Remove markdown formatting
    url = url.replace(/^[*_~`]+|[*_~`]+$/g, '');

    return url;
  }

  /**
   * Check if URL is a direct file link
   */
  static isDirectFileLink(url: string, allowedExtensions: string[]): boolean {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.toLowerCase();

      return allowedExtensions.some(ext => pathname.endsWith(ext.toLowerCase()));
    } catch {
      return false;
    }
  }

  /**
   * Check if URL is likely an image
   */
  static isImageUrl(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    return this.isDirectFileLink(url, imageExtensions);
  }

  /**
   * Check if URL is likely a video
   */
  static isVideoUrl(url: string): boolean {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv'];
    return this.isDirectFileLink(url, videoExtensions);
  }

  /**
   * Check if URL is likely an audio file
   */
  static isAudioUrl(url: string): boolean {
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'];
    return this.isDirectFileLink(url, audioExtensions);
  }

  /**
   * Check if URL is likely a document
   */
  static isDocumentUrl(url: string): boolean {
    const docExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'];
    return this.isDirectFileLink(url, docExtensions);
  }

  /**
   * Check if URL is likely an archive
   */
  static isArchiveUrl(url: string): boolean {
    const archiveExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz'];
    return this.isDirectFileLink(url, archiveExtensions);
  }

  /**
   * Get URL category
   */
  static categorizeUrl(url: string): string {
    if (this.isImageUrl(url)) return 'image';
    if (this.isVideoUrl(url)) return 'video';
    if (this.isAudioUrl(url)) return 'audio';
    if (this.isDocumentUrl(url)) return 'document';
    if (this.isArchiveUrl(url)) return 'archive';
    return 'other';
  }
}
