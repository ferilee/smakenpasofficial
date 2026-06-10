import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export type StoredFile = {
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  url: string;
};

type S3Config = {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
  forcePathStyle: boolean;
  publicBaseUrl: string;
};

const uploadDir = process.env.UPLOAD_DIR ?? "./uploads";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizeS3Config(): S3Config | null {
  const endpoint = String(process.env.S3_ENDPOINT || "").trim();
  const accessKey = String(process.env.S3_ACCESS_KEY || "").trim();
  const secretKey = String(process.env.S3_SECRET_KEY || "").trim();
  const bucket = String(process.env.S3_BUCKET || "").trim();
  if (!endpoint || !accessKey || !secretKey || !bucket) return null;
  const publicBaseUrl = trimTrailingSlash(String(process.env.S3_PUBLIC_BASE_URL || endpoint).trim());
  return {
    endpoint: trimTrailingSlash(endpoint),
    accessKey,
    secretKey,
    bucket,
    region: String(process.env.S3_REGION || "us-east-1").trim() || "us-east-1",
    forcePathStyle: String(process.env.S3_FORCE_PATH_STYLE || "true").trim().toLowerCase() === "true",
    publicBaseUrl
  };
}

let s3Client: S3Client | null = null;

function getS3Client(config: S3Config) {
  if (!s3Client) {
    s3Client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey
      },
      forcePathStyle: config.forcePathStyle
    });
  }
  return s3Client;
}

function safeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function publicObjectUrl(config: S3Config, storageKey: string) {
  return `${config.publicBaseUrl}/${config.bucket}/${storageKey}`;
}

export function storageMode() {
  return normalizeS3Config() ? "rustfs" : "local";
}

export async function storeUploadedFile(input: File, folder = "uploads"): Promise<StoredFile> {
  const safeName = safeFileName(input.name);
  const storageKey = `${folder}/${Date.now()}-${crypto.randomUUID()}${extname(safeName)}`;
  const mimeType = input.type || "application/octet-stream";
  const size = input.size;
  const body = Buffer.from(await input.arrayBuffer());
  const s3 = normalizeS3Config();

  if (s3) {
    await getS3Client(s3).send(new PutObjectCommand({
      Bucket: s3.bucket,
      Key: storageKey,
      Body: body,
      ContentType: mimeType
    }));
    return {
      name: safeName,
      originalName: input.name,
      mimeType,
      size,
      storageKey,
      url: publicObjectUrl(s3, storageKey)
    };
  }

  await mkdir(uploadDir, { recursive: true });
  const localKey = storageKey.split("/").pop() || `${Date.now()}-${safeName}`;
  const path = join(uploadDir, localKey);
  await writeFile(path, body);
  return {
    name: safeName,
    originalName: input.name,
    mimeType,
    size,
    storageKey: localKey,
    url: `/uploads/${localKey}`
  };
}

export function storageSetup() {
  const s3 = normalizeS3Config();
  if (!s3) {
    return {
      mode: "local" as const,
      uploadDir
    };
  }
  return {
    mode: "rustfs" as const,
    endpoint: s3.endpoint,
    bucket: s3.bucket,
    publicBaseUrl: s3.publicBaseUrl,
    region: s3.region,
    forcePathStyle: s3.forcePathStyle
  };
}
