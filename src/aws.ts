import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  GetObjectCommand,
  NotFound,
  BucketLocationConstraint,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { PassThrough } from "stream";

class S3Bucket {
  private s3: S3Client;
  private bucketName: string;
  private region: BucketLocationConstraint;

  constructor(
    bucketName: string,
    region: BucketLocationConstraint,
    accessKeyId: string,
    secretAccessKey: string
  ) {
    this.s3 = new S3Client({
      region: region,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    this.bucketName = bucketName;
    this.region = region;
  }

  async initBucket() {
    console.log("Initializing bucket...");
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      console.log("Bucket already exists.");
    } catch (err) {
      if (err instanceof NotFound) {
        await this.createBucket();
      } else {
        throw err;
      }
    }
  }

  private async createBucket() {
    try {
      await this.s3.send(
        new CreateBucketCommand({
          Bucket: this.bucketName,
          CreateBucketConfiguration: {
            LocationConstraint: this.region as BucketLocationConstraint,
          },
        })
      );
      console.log("Bucket created.");
    } catch (err) {
      console.log("Error creating the bucket: ", err);
      throw err;
    }
  }

  uploadFileStream(key: string): {
    s3UploadStream: PassThrough;
    upload: Upload;
  } {
    const pass = new PassThrough();
    try {
      const upload = new Upload({
        client: this.s3,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: pass,
          ContentType: "text/plain",
        },
      });

      return {
        s3UploadStream: pass,
        upload,
      };
    } catch (err) {
      console.error(`Error uploading data to a bucket ${key}`, err);
      throw err;
    }
  }

  async getFileContent(key: string): Promise<string> {
    try {
      const data = await this.s3.send(
        new GetObjectCommand({ Bucket: this.bucketName, Key: key })
      );

      const dataString = await data.Body?.transformToString();

      if (!dataString) {
        throw new Error(`Empty or undefined data in ${key}`);
      }

      return dataString;
    } catch (error) {
      console.error(`Error loading data from S3 bucket ${key}: `, error);
      throw error;
    }
  }
}

export default S3Bucket;
