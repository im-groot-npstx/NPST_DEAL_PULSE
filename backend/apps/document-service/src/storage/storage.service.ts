import {

  Injectable,

  InternalServerErrorException,

  NotFoundException,

  OnModuleInit,

  ServiceUnavailableException,

} from '@nestjs/common';

import {

  S3Client,

  CreateBucketCommand,

  HeadBucketCommand,

  PutObjectCommand,

  GetObjectCommand,

  DeleteObjectCommand,

} from '@aws-sdk/client-s3';

@Injectable()

export class StorageService implements OnModuleInit {

  private readonly bucket = process.env.MINIO_BUCKET || 'dealplus-documents';

  private readonly s3 = new S3Client({

    endpoint: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}`,

    region: 'us-east-1',

    credentials: {

      accessKeyId: process.env.MINIO_ACCESS_KEY || 'dealplus_admin',

      secretAccessKey: process.env.MINIO_SECRET_KEY || 'LocalMinio@2026',

    },

    forcePathStyle: true,

  });

  async onModuleInit() {

    await this.ensureBucketExists();

  }

  private async ensureBucketExists() {

    try {

      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));

    } catch {

      try {

        await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));

        console.log(`MinIO bucket "${this.bucket}" created`);

      } catch (error) {

        console.error('MinIO bucket initialization failed:', error);

      }

    }

  }

  async uploadFile(

    key: string,

    file: Buffer,

    contentType: string,

  ): Promise<void> {

    try {

      await this.s3.send(

        new PutObjectCommand({

          Bucket: this.bucket,

          Key: key,

          Body: file,

          ContentType: contentType,

        }),

      );

    } catch (error) {

      console.error('MinIO upload failed:', error);

      throw new InternalServerErrorException('Failed to upload document to storage');

    }

  }

  async getFile(key: string) {

    try {

      return await this.s3.send(

        new GetObjectCommand({

          Bucket: this.bucket,

          Key: key,

        }),

      );

    } catch (error) {
      const err = error as { name?: string; $metadata?: { httpStatusCode?: number } };
      if (
        err?.name === 'NoSuchKey' ||
        err?.$metadata?.httpStatusCode === 404
      ) {
        throw new NotFoundException('Document file not found in storage');
      }
      throw new ServiceUnavailableException('Storage service is unavailable');
    }

  }

  async deleteFile(key: string): Promise<void> {

    try {

      await this.s3.send(

        new DeleteObjectCommand({

          Bucket: this.bucket,

          Key: key,

        }),

      );

    } catch (error) {

      console.error('MinIO delete failed:', error);

      throw new InternalServerErrorException('Failed to delete document');

    }

  }

}
 