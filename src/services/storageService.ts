import { api } from './api';
import { PresignedUrlResponse } from '@/types/api.types';

export class PresignedUrlError extends Error {}
export class S3UploadError extends Error {}

export const storageService = {
  getPresignedUrl: async (
    folder: string,
    filename: string,
    contentType: string,
  ): Promise<PresignedUrlResponse> => {
    try {
      const response = await api.get<PresignedUrlResponse>('/storage/presigned-url', {
        params: { folder, filename, contentType },
      });
      return response.data;
    } catch (error) {
      throw new PresignedUrlError('No se pudo preparar la subida de la imagen.');
    }
  },

  // Uploads directly to S3 using the presigned URL. Uses a bare `fetch`, not the shared
  // `api` axios instance: S3 presigned PUT URLs are signed against a specific, minimal
  // set of headers — sending the Cognito bearer token or a default JSON content-type
  // would invalidate the signature and the PUT would fail.
  uploadToS3: async (presignedUrl: string, file: File, contentType: string): Promise<void> => {
    let response: Response;
    try {
      response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: file,
      });
    } catch (error) {
      throw new S3UploadError('No se pudo subir la imagen al almacenamiento (error de red).');
    }

    if (!response.ok) {
      throw new S3UploadError('No se pudo subir la imagen al almacenamiento.');
    }
  },
};
