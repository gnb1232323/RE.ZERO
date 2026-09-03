import { google } from "googleapis";

const STUDENTS_FOLDER_ID = process.env.GOOGLE_DRIVE_STUDENTS_FOLDER_ID;
const RECEIPTS_FOLDER_ID = process.env.GOOGLE_DRIVE_RECEIPTS_FOLDER_ID;

function getAuth() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Google OAuth env vars are not set (GOOGLE_OAUTH_CLIENT_ID/SECRET/REFRESH_TOKEN)");
  }
  const client = new google.auth.OAuth2(clientId, clientSecret);
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

function getDrive() {
  return google.drive({ version: "v3", auth: getAuth() });
}

function escapeForQuery(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export async function findOrCreateStudentFolder(fullName: string, cachedFolderId?: string | null): Promise<string> {
  if (!STUDENTS_FOLDER_ID) throw new Error("GOOGLE_DRIVE_STUDENTS_FOLDER_ID is not set");
  const drive = getDrive();

  if (cachedFolderId) {
    try {
      const existing = await drive.files.get({ fileId: cachedFolderId, fields: "id, trashed" });
      if (!existing.data.trashed) return cachedFolderId;
    } catch {
      // cached folder is gone or inaccessible — fall through and recreate/relocate
    }
  }

  const name = escapeForQuery(fullName);
  const query = `'${STUDENTS_FOLDER_ID}' in parents and name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const found = await drive.files.list({ q: query, fields: "files(id, name)" });
  if (found.data.files && found.data.files.length > 0) {
    return found.data.files[0].id!;
  }

  const created = await drive.files.create({
    requestBody: {
      name: fullName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [STUDENTS_FOLDER_ID],
    },
    fields: "id",
  });
  return created.data.id!;
}

export async function uploadReceipt({
  fileName,
  mimeType,
  buffer,
  studentFolderId,
}: {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  studentFolderId: string;
}): Promise<{ fileId: string; viewLink: string }> {
  if (!RECEIPTS_FOLDER_ID) throw new Error("GOOGLE_DRIVE_RECEIPTS_FOLDER_ID is not set");
  const drive = getDrive();
  const { Readable } = await import("stream");

  const created = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [RECEIPTS_FOLDER_ID],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id, webViewLink",
  });

  const fileId = created.data.id!;

  // Consumer Google Drive only allows a single real parent per file, so the
  // receipt lives in the flat receipts folder and gets a shortcut in the
  // student's own folder instead of a second real parent.
  await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [studentFolderId],
      mimeType: "application/vnd.google-apps.shortcut",
      shortcutDetails: { targetId: fileId },
    },
    fields: "id",
  });

  return {
    fileId,
    viewLink: created.data.webViewLink ?? `https://drive.google.com/file/d/${fileId}/view`,
  };
}
