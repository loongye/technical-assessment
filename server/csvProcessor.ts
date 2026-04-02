import { Readable } from "stream";
import csv from "csv-parser";

export interface Post {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}

export interface Conflict {
  id: number;
  old: Post;
  new: Post;
}

export const processCsv = async (
  stream: Readable,
  existingData: Post[]
): Promise<{ conflicts: Conflict[]; newPosts: Post[] }> => {
  const results: any[] = [];
  
  return new Promise((resolve, reject) => {
    stream
      .pipe(csv({
        mapHeaders: ({ header }) => header.replace(/^\uFEFF/, "").replace(/^"(.*)"$/, "$1")
      }))
      .on("data", (data) => results.push(data))
      .on("error", (error) => reject(error))
      .on("end", () => {
        const conflicts: Conflict[] = [];
        const newPosts: Post[] = [];

        for (const raw of results) {
          if (!raw.id || !raw.postId) continue;

          const postData: Post = {
            id: parseInt(raw.id),
            postId: parseInt(raw.postId),
            name: raw.name || "",
            email: raw.email || "",
            body: raw.body || "",
          };

          const existing = existingData.find(p => p.id === postData.id);

          if (existing) {
            const isDifferent = 
              existing.postId !== postData.postId ||
              existing.name !== postData.name ||
              existing.email !== postData.email ||
              existing.body.replace(/\r\n/g, '\n') !== postData.body.replace(/\r\n/g, '\n');

            if (isDifferent) {
              conflicts.push({ id: postData.id, old: existing, new: postData });
            }
          } else {
            newPosts.push(postData);
          }
        }
        resolve({ conflicts, newPosts });
      });
  });
};
