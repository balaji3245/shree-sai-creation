import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { requireAdmin, logApiResponse } from "@/lib/middleware";

export const config = {
  api: {
    bodyParser: false,
  },
};

// POST /api/v1/admin/upload — Upload product image to public/uploads
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const authResult = requireAdmin(req);
  if ("error" in authResult) {
    logApiResponse(req, 403, startTime);
    return authResult.error;
  }

  try {
    const formData = await req.formData();
    const file = (formData.get("file") || formData.get("image")) as File | null;

    if (!file) {
      logApiResponse(req, 400, startTime);
      return NextResponse.json({ message: "No image file provided" }, { status: 400 });
    }

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      logApiResponse(req, 400, startTime);
      return NextResponse.json(
        { message: "Invalid file type. Only JPG, PNG, WEBP, GIF, AVIF, and SVG images are allowed." },
        { status: 400 }
      );
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      logApiResponse(req, 400, startTime);
      return NextResponse.json(
        { message: "File size too large. Maximum 10MB allowed." },
        { status: 400 }
      );
    }

    // Prepare upload directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(file.name) || ".jpg";
    const cleanName = path.basename(file.name, ext).toLowerCase().replace(/[^a-z0-9]/g, "-");
    const filename = `prod_${Date.now()}_${cleanName}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    // Save file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    logApiResponse(req, 201, startTime);
    return NextResponse.json(
      { message: "Image uploaded successfully", url: publicUrl },
      { status: 201 }
    );
  } catch (err) {
    const { logError } = await import("@/lib/logger");
    logError("admin/upload/POST", err);
    logApiResponse(req, 500, startTime);
    return NextResponse.json({ message: "Failed to upload image" }, { status: 500 });
  }
}
