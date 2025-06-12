import { S3 } from "../factories/s3.factory";
import {
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  NoSuchKey,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getSignedUrl as getCloudfrontSignedUrl } from "@aws-sdk/cloudfront-signer";
import dotenv from "dotenv";
import fs from "fs";
import { sign } from "crypto";
import { BadRequestError } from "../errors/badRequest.error";

dotenv.config();

const bucketName = process.env.AWS_BUCKET;

const cloudfrontDistributionDomain = process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN;
const privateKey = fs.readFileSync("./private_key.pem", "utf-8");
const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;

const allowedContentTypesForAudio = ["audio/m4a"];

const allowedContentTypesForAttachments = [
  "image/png",
  "image/gif",
  "image/jpeg",
  "image/svg+xml",
  "text/plain",
  "text/markdown",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/x-patch",
  "application/pdf",
  "application/zip",
  "application/gzip",
  "application/x-gzip",
  "application/x-tar",
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

async function getPresignedUploadUrlForAudio(
  filename: string,
  contentType: string,
  ACL: boolean,
  purpose: string
): Promise<{ url: string; keyName: string }> {
  try {
    console.log("getPresignedUploadUrlForAudio called", { filename, contentType, ACL, purpose }, "S3Service");
    if (!allowedContentTypesForAudio.includes(contentType)) {
      throw new BadRequestError(`Content type ${contentType} is not allowed`);
    }

    filename = filename.replace(/\s/g, "");
    const keyName = `${Date.now()}${filename}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: `${purpose}/${keyName}`,
      ACL: "private",
      ContentType: contentType,
    });

    const url = await getSignedUrl(S3, command, { expiresIn: 3600 }); // expires in 1 hour

    return { url, keyName: `${purpose}/${keyName}` };
  } catch (error) {
    console.log("Error in getPresignedUrlForAudio", { error, filename, contentType, ACL, purpose }, "S3Service");

    throw error;
  }
}

async function getPresignedUploadUrlForAttachments(
  filename: string,
  contentType: string,
  ACL: boolean,
  purpose: string
): Promise<{ url: string; keyName: string }> {
  try {
    console.log("getPresignedUploadUrlForAttachments called", { filename, contentType, ACL, purpose }, "S3Service");

    if (!allowedContentTypesForAttachments.includes(contentType)) {
      throw new BadRequestError(`Content type ${contentType} is not allowed`);
    }

    filename = filename.replace(/\s/g, "");
    const keyName = `${Date.now()}${filename}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: `${purpose}/${keyName}`,
      ACL: "private",
      ContentType: contentType,
    });

    const url = await getSignedUrl(S3, command, { expiresIn: 3600 }); // expires in 1 hour

    return { url, keyName: `${purpose}/${keyName}` };
  } catch (error) {
    console.log(
      "Error in getPresignedUploadUrlForAttachments",
      { error, filename, contentType, ACL, purpose },
      "S3Service"
    );

    throw error;
  }
}

async function getPresignedGetUrl(key: string, duration: number = 1): Promise<string> {
  try {
    console.log("getPresignedGetUrl called", { key }, "S3Service");

    const url = `${cloudfrontDistributionDomain}/${key}`;
    const dateLessThan = new Date(Date.now() + 60 * 60 * 1000 * duration).toUTCString(); // 60 minutes from now

    const signedUrl = getCloudfrontSignedUrl({
      url,
      keyPairId,
      dateLessThan,
      privateKey,
    });

    const signedUrlString = signedUrl.split(`${cloudfrontDistributionDomain}/`)[1];
    return signedUrlString;
  } catch (error) {
    console.log("Error in getPresignedGetUrl", { error, key }, "S3Service");

    throw error;
  }
}

async function getPresignedDownloadUrl(key: string): Promise<string> {
  try {
    console.log("getPresignedDownloadUrl called", { key }, "S3Service");

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
      ResponseContentDisposition: `attachment; filename=\"${key}\"`,
    });

    const url = await getSignedUrl(S3, command);

    return url;
  } catch (error) {
    console.log("Error in getPresignedDownloadUrl", { error, key }, "S3Service");

    throw error;
  }
}

async function deleteObject(key: string, retry = 0) {
  try {
    console.log("deleteObject called", { key }, "S3Service");

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await S3.send(command);

    // recheck if the object exists
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const file = await S3.send(getObjectCommand);

    if (file) {
      if (retry > 2) {
        throw new BadRequestError("Failed to delete file");
      }

      await deleteObject(key, retry + 1);
    }

    return { message: "File deleted successfully" };
  } catch (error) {
    console.error("Error in deleteObject", { error, key }, "S3Service");

    if (error instanceof NoSuchKey) {
      return { message: "File has already been deleted" };
    }

    if (retry > 2) {
      await deleteObject(key, retry + 1);
    }

    console.error("Failed to delete object", { error, key }, "S3Service");
  }
}

async function duplicateObject(key: string): Promise<string> {
  try {
    console.log("duplicateObject called", { key }, "S3Service");

    // remove the first 13 characters from the key
    const [purpose, filename] = key.split("/");
    const slicedObjectName = filename.slice(13);
    const newKey = purpose + "/" + Date.now() + slicedObjectName;

    const command = new CopyObjectCommand({
      Bucket: bucketName,
      CopySource: `${bucketName}/${key}`,
      ACL: "private",
      Key: newKey,
    });

    await S3.send(command);

    return newKey;
  } catch (error) {
    console.error("Error in duplicateObject", { error, key }, "S3Service");

    throw error;
  }
}

export default {
  getPresignedUploadUrlForAudio,
  getPresignedGetUrl,
  getPresignedDownloadUrl,
  deleteObject,
  getPresignedUploadUrlForAttachments,
  duplicateObject,
};
