import { NextRequest, NextResponse } from "next/server";
import getDb from "@/lib/db";
import { requireAdmin, logApiResponse } from "@/lib/middleware";

// GET /api/v1/admin/users — list all registered users
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const authResult = requireAdmin(req);
  if ("error" in authResult) return authResult.error;

  try {
    const db = getDb();
    const users = db
      .prepare(
        `SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`
      )
      .all() as {
        id: number;
        name: string;
        email: string;
        role: string;
        created_at: string;
      }[];

    logApiResponse(req, 200, startTime);
    return NextResponse.json({ users });
  } catch (err) {
    const { logError } = await import("@/lib/logger");
    logError("admin/users GET", err);
    logApiResponse(req, 500, startTime);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/v1/admin/users?id=123 — delete a user
export async function DELETE(req: NextRequest) {
  const startTime = Date.now();
  const authResult = requireAdmin(req);
  if ("error" in authResult) return authResult.error;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: "Valid user ID required" }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare("SELECT id, role FROM users WHERE id = ?").get(Number(id)) as
      | { id: number; role: string }
      | undefined;

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.role === "admin") {
      return NextResponse.json({ message: "Cannot delete admin user" }, { status: 403 });
    }

    db.prepare("DELETE FROM users WHERE id = ?").run(Number(id));

    logApiResponse(req, 200, startTime);
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err) {
    const { logError } = await import("@/lib/logger");
    logError("admin/users DELETE", err);
    logApiResponse(req, 500, startTime);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/v1/admin/users — update user role
export async function PATCH(req: NextRequest) {
  const startTime = Date.now();
  const authResult = requireAdmin(req);
  if ("error" in authResult) return authResult.error;

  try {
    const body = await req.json();
    const { id, role } = body;

    if (!id || !role || !["customer", "admin"].includes(role)) {
      return NextResponse.json({ message: "Valid id and role required" }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare("SELECT id FROM users WHERE id = ?").get(Number(id));
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, Number(id));

    logApiResponse(req, 200, startTime);
    return NextResponse.json({ message: "User role updated" });
  } catch (err) {
    const { logError } = await import("@/lib/logger");
    logError("admin/users PATCH", err);
    logApiResponse(req, 500, startTime);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
