export class ImageGenerator {
  constructor() {
    this.pollinationsEndpoint = 'https://image.pollinations.ai/prompt/';
  }

  async generateImage(prompt) {
    const encodedPrompt = encodeURIComponent(prompt);
    
    const params = {
      width: 512,
      height: 512,
      seed: Math.floor(Math.random() * 1000000),
      nologo: true
    };
    
    const paramString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    const imageUrl = `${this.pollinationsEndpoint}${encodedPrompt}?${paramString}`;
    
    return imageUrl;
  }
}