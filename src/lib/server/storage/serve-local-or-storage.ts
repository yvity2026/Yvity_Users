import "server-only";

import fs from "fs/promises";
import {
  downloadObject,
  useSupabaseStorage,
  type StorageBucket,
} from "@/lib/server/supabase/object-storage";

export async function readLocalOrStorageFile(input: {
  localPath: string | null;
  bucket: StorageBucket;
  objectPath: string;
}): Promise<Buffer | null> {
  if (input.localPath) {
    try {
      return await fs.readFile(input.localPath);
    } catch {
      // fall through to storage
    }
  }

  if (!useSupabaseStorage()) return null;
  return downloadObject(input.bucket, input.objectPath);
}
