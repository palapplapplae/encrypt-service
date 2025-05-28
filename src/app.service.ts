import { Injectable } from '@nestjs/common';
import { createCipheriv, randomBytes, scrypt, createDecipheriv, publicDecrypt, publicEncrypt } from 'crypto';
import { promisify } from 'util';

@Injectable()
export class AppService {
  private readonly publicKey: string;
  private readonly privateKey: string;
  private aesKey: string;

  constructor() {
    this.publicKey = `MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgFZ0eOF/gwpcI7v8VxVHJwFYZ1KKXsfJKn8eHFHaa9ED8iN9OEHyF1ZQeNwFSesMMutYwtu4TfqYDmBeAeVr1XllbxwIEt8d8Vl5O/RbEEqLpJ4Q5DozILaIPqqW58ezav+wtY6OOfAxKvW4/psd5f+gBMHaWo4U2/d6djJXn2l5AgMBAAE=`;
    this.privateKey = `MIICWgIBAAKBgFZ0eOF/gwpcI7v8VxVHJwFYZ1KKXsfJKn8eHFHaa9ED8iN9OEHyF1ZQeNwFSesMMutYwtu4TfqYDmBeAeVr1XllbxwIEt8d8Vl5O/RbEEqLpJ4Q5DozILaIPqqW58ezav+wtY6OOfAxKvW4/psd5f+gBMHaWo4U2/d6djJXn2l5AgMBAAECgYAyEhrAXt1B7sMzaJ320NKiUNTmVQU3qCZYoNO+BEZVM3fVXfxrFQ63Crw0kUuSOepzq2CPaFqhO9d3sHpgqOdlTXdo0h21PZ7wII178NFsYZwVZL6tWiiX8xPV0esSh9MZDZ514svDkzMrHe1IpAQtqRiMjJtueoTZ8Mh9UDMwAQJBAKsyEluNsL2Z2kX+gRRiugGtEAaFOu/dXSybRZWb7/lC8rBM+//WkBNeEs+zOoI9uxiXS8LBE4D3QZGbQmnn9vkCQQCBSCM2XSY00vdW3i99hCvcfc6fKFnupSHdfNzwq+Is4q7Qf208fzp2FTNM18G45YZZJPVsZLb/I0xAFnAZayaBAkBjGVQZHVcvGg2JMP8lftTvvW+mZp8sVLbn6GYKab8rSj7UIWxKt7ilDXLUOorm87cHUCVx8nRI1lhlYju6tKV5AkB2GUvxcY5hWwcPl9CSPJdEyLhjtBzTYI5bIqFCSgJHNpyzYnSLez4QeLVwUPhqy2G7NYPtDOQOllQlh1nIHpYBAkAyFgjAUY6ZZr0z+SKaYCf72ZvAS0kF3i7tvoaJ/aNt1rnm6Zy8aD+m8KP8+xfHesYBgIBqKHcEEbJ8rb9jD6lN`;
  }

  generateAESKey(): string {
    const aesKey = randomBytes(32).toString('hex')
    this.aesKey = aesKey;
    return randomBytes(32).toString('hex');
  }

  async encryptWithAES(data: string): Promise<string> {
    const iv = randomBytes(16);
    const key = (await promisify(scrypt)(data, 'salt', 32)) as Buffer;
    const cipher = createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + encrypted;
  }

  decryptWithAES(encryptedData: string, key: string): string {
    const iv = Buffer.from(encryptedData.slice(0, 32), 'hex');
    const encryptedText = encryptedData.slice(32);
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('hex');
    return decrypted;
  }

  encryptWithRSA(data: string): string {
    const buffer = Buffer.from(data, 'utf8');
    const encrypted = publicEncrypt(this.privateKey, buffer);
    return encrypted.toString();
  }

  decryptWithRSA(data: string): string {
    const buffer = Buffer.from(data);
    const decrypted = publicDecrypt(this.publicKey, buffer);
    return decrypted.toString();
  }

  async encryptData(payload: string) {
    try {
      const aesKey = this.generateAESKey();
      const data2 = await this.encryptWithAES(payload);
      const data1 = await this.encryptWithRSA(aesKey);

      return {
        successful: true,
        error_code: '',
        data: { data1, data2 },
      };
    } catch (error) {
      return {
        successful: false,
        error_code: `${error.code}`,
        data: null,
      };
    }
  }

  decryptData(data1: string, data2: string) {
    try {
      if (!this.aesKey || this.aesKey.length <= 0) {
        const error = new Error("Please set payload before decrypted.");
        (error as any).code = 'AES_KEY_NOT_INITIALIZED';
        throw error;
      }

      const aesKey = this.decryptWithRSA(data1);
      const payload = this.decryptWithAES(data2, aesKey);

      return {
        successful: true,
        error_code: '',
        data: {
          payload: payload,
        },
      };
    } catch (error) {
      return {
        successful: false,
        error_code: `${error.code}`,
        data: null,
      };
    }
  }
}
