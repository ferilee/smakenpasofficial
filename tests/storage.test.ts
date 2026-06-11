import { afterEach, describe, expect, test } from "bun:test";
import { storageMode, storageSetup } from "../src/lib/storage";
import { resolveGoogleSheetCsvUrl, socialProfileUrl } from "../src/lib/utils";

const originalEnv = {
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_PUBLIC_BASE_URL: process.env.S3_PUBLIC_BASE_URL,
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
  S3_SECRET_KEY: process.env.S3_SECRET_KEY,
  S3_BUCKET: process.env.S3_BUCKET,
  S3_REGION: process.env.S3_REGION,
  S3_FORCE_PATH_STYLE: process.env.S3_FORCE_PATH_STYLE
};

function resetS3Env() {
  process.env.S3_ENDPOINT = originalEnv.S3_ENDPOINT;
  process.env.S3_PUBLIC_BASE_URL = originalEnv.S3_PUBLIC_BASE_URL;
  process.env.S3_ACCESS_KEY = originalEnv.S3_ACCESS_KEY;
  process.env.S3_SECRET_KEY = originalEnv.S3_SECRET_KEY;
  process.env.S3_BUCKET = originalEnv.S3_BUCKET;
  process.env.S3_REGION = originalEnv.S3_REGION;
  process.env.S3_FORCE_PATH_STYLE = originalEnv.S3_FORCE_PATH_STYLE;
}

afterEach(() => {
  resetS3Env();
});

describe("storage setup", () => {
  test("falls back to local storage when S3 env is incomplete", () => {
    delete process.env.S3_ENDPOINT;
    delete process.env.S3_ACCESS_KEY;
    delete process.env.S3_SECRET_KEY;
    delete process.env.S3_BUCKET;

    expect(storageMode()).toBe("local");
    expect(storageSetup()).toEqual(expect.objectContaining({ mode: "local" }));
  });

  test("builds rustfs config when S3 env is provided", () => {
    process.env.S3_ENDPOINT = "http://global-storage:9000/";
    process.env.S3_PUBLIC_BASE_URL = "https://s3.example.com/";
    process.env.S3_ACCESS_KEY = "access";
    process.env.S3_SECRET_KEY = "secret";
    process.env.S3_BUCKET = "smakenpasofficial-assets";
    process.env.S3_REGION = "us-east-1";
    process.env.S3_FORCE_PATH_STYLE = "true";

    expect(storageMode()).toBe("rustfs");
    expect(storageSetup()).toEqual({
      mode: "rustfs",
      endpoint: "http://global-storage:9000",
      bucket: "smakenpasofficial-assets",
      publicBaseUrl: "https://s3.example.com",
      region: "us-east-1",
      forcePathStyle: true
    });
  });
});

describe("google sheets url resolution", () => {
  test("accepts partial google sheets path", () => {
    expect(resolveGoogleSheetCsvUrl("d/16RiJE6X-KpSZYGUBnRcS9L_y_wTXijnkAp_nwQK7EE/edit?gid=1125815999#gid=1125815999"))
      .toBe("https://docs.google.com/spreadsheets/d/16RiJE6X-KpSZYGUBnRcS9L_y_wTXijnkAp_nwQK7EE/export?format=csv&gid=1125815999");
  });

  test("accepts bare sheet id", () => {
    expect(resolveGoogleSheetCsvUrl("16RiJE6X-KpSZYGUBnRcS9L_y_wTXijnkAp_nwQK7EE"))
      .toBe("https://docs.google.com/spreadsheets/d/16RiJE6X-KpSZYGUBnRcS9L_y_wTXijnkAp_nwQK7EE/export?format=csv&gid=0");
  });
});

describe("social profile URL normalization", () => {
  test("normalizes messaging and video accounts", () => {
    expect(socialProfileUrl("whatsapp", "0812-3456-7890")).toBe("https://wa.me/6281234567890");
    expect(socialProfileUrl("telegram", "@alumni.test")).toBe("https://t.me/alumni.test");
    expect(socialProfileUrl("youtube", "@alumni.test")).toBe("https://www.youtube.com/@alumni.test");
  });

  test("keeps complete social URLs unchanged", () => {
    expect(socialProfileUrl("youtube", "https://youtube.com/channel/example")).toBe("https://youtube.com/channel/example");
  });
});
