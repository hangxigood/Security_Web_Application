/**
 * @fileoverview Message signing and verification utility using node-forge
 */

import * as forge from 'node-forge';

// Generate a key pair for testing (in production, use proper key management)
const { privateKey, publicKey } = forge.pki.rsa.generateKeyPair({ bits: 2048 });

export class MessageSigner {
  /**
   * Signs a message using RSA-SHA256
   * @param message - The message to sign
   * @returns The base64-encoded signature
   */
  static signMessage(message: string): string {
    try {
      const md = forge.md.sha256.create();
      md.update(message, 'utf8');
      
      const signature = privateKey.sign(md);
      return forge.util.encode64(signature);
    } catch (error) {
      console.error('Error signing message:', error);
      throw new Error('Failed to sign message');
    }
  }

  /**
   * Verifies a message signature
   * @param message - The original message
   * @param signature - The base64-encoded signature
   * @returns True if signature is valid, false otherwise
   */
  static verifySignature(message: string, signature: string): boolean {
    try {
      const md = forge.md.sha256.create();
      md.update(message, 'utf8');
      
      const decodedSignature = forge.util.decode64(signature);
      return publicKey.verify(md.digest().bytes(), decodedSignature);
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }
}