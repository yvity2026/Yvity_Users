import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { saveSelfieUrl, normalizeIndianMobile } from "@/lib/server/registration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SELFIE_DIR = path.join(process.cwd(), ".data", "selfies");

function ensureSelfieDir() {
  fs.mkdirSync(SELFIE_DIR, { recursive: true });
}

/** Registration selfie upload — persists JPEG to `.data/selfies` for profile photo. */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let mobile = "";
    let buffer: Buffer;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const image = formData.get("image");
      mobile = String(formData.get("mobile") || "");

      if (!image || typeof (image as Blob).arrayBuffer !== "function") {
        return NextResponse.json({ error: "Selfie image is required" }, { status: 400 });
      }

      buffer = Buffer.from(await (image as Blob).arrayBuffer());
    } else {
      const body = (await request.json()) as { imageBase64?: string; mobile?: string };
      mobile = String(body.mobile || "");
      if (!body.imageBase64) {
        return NextResponse.json({ error: "Image data is required" }, { status: 400 });
      }

      const base64 = body.imageBase64.replace(/^data:image\/\w+;base64,/, "");
      buffer = Buffer.from(base64, "base64");
    }

    const safeMobile = normalizeIndianMobile(mobile) || "guest";
    const fileKey = `${safeMobile}-${randomUUID().slice(0, 8)}.jpg`;
    const url = `/api/auth/selfie/${fileKey}`;

    ensureSelfieDir();
    fs.writeFileSync(path.join(SELFIE_DIR, fileKey), buffer);
    saveSelfieUrl(safeMobile, url);

    return NextResponse.json({
      success: true,
      url,
      key: url,
      backend: "local",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save your selfie" },
      { status: 500 },
    );
  }
}
