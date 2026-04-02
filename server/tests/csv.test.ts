import { expect, test, describe } from "bun:test";
import { Readable } from "stream";
import { processCsv } from "../csvProcessor";

describe("CSV Processing Logic", () => {
  test("should parse CSV and identify new posts", async () => {
    const sampleCsv = `postId,id,name,email,body\n1,1,"Test Post","test@example.com","Hello world"`;
    const stream = Readable.from(sampleCsv);
    const { conflicts, newPosts }: any = await processCsv(stream, []);
    expect(newPosts.length).toBe(1);
    expect(conflicts.length).toBe(0);
    expect(newPosts[0].name).toBe("Test Post");
  });

  test("should handle BOM and quoted headers", async () => {
    const csvWithBom = `\uFEFF"postId","id","name","email","body"\n1,10,"Name","email@test.com","body"`;
    const stream = Readable.from(csvWithBom);
    const { newPosts }: any = await processCsv(stream, []);
    expect(newPosts.length).toBe(1);
    expect(newPosts[0].id).toBe(10);
    expect(newPosts[0].name).toBe("Name");
  });

  test("should handle multiline content within quotes", async () => {
    const multilineCsv = `postId,id,name,email,body\n1,1,"Name","email@test.com","Line 1\nLine 2"`;
    const stream = Readable.from(multilineCsv);
    const { newPosts }: any = await processCsv(stream, []);
    expect(newPosts[0].body).toBe("Line 1\nLine 2");
  });

  test("should normalize line endings during comparison", async () => {
    const existing: any = [{ id: 1, postId: 1, name: "Name", email: "e@e.com", body: "Line 1\nLine 2" }];
    const csvContent = `postId,id,name,email,body\n1,1,"Name","e@e.com","Line 1\r\nLine 2"`;
    const stream = Readable.from(csvContent);
    const { conflicts }: any = await processCsv(stream, existing);
    expect(conflicts.length).toBe(0);
  });

  test("should detect conflicts when data differs", async () => {
    const existing: any = [{ id: 1, postId: 1, name: "Old Name", email: "e@e.com", body: "body" }];
    const csvContent = `postId,id,name,email,body\n1,1,"New Name","e@e.com","body"`;
    const stream = Readable.from(csvContent);
    const { conflicts }: any = await processCsv(stream, existing);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].new.name).toBe("New Name");
  });

  test("should skip malformed rows without ID", async () => {
    const malformedCsv = `postId,id,name,email,body\n1,,"No ID","email@test.com","body"`;
    const stream = Readable.from(malformedCsv);
    const { newPosts }: any = await processCsv(stream, []);
    expect(newPosts.length).toBe(0);
  });

  test("should handle larger datasets (1000 rows)", async () => {
    let largeCsv = "postId,id,name,email,body\n";
    for (let i = 1; i <= 1000; i++) {
      largeCsv += `1,${i},"User ${i}","user${i}@test.com","Body content ${i}"\n`;
    }
    const stream = Readable.from(largeCsv);
    const { newPosts }: any = await processCsv(stream, []);
    expect(newPosts.length).toBe(1000);
    expect(newPosts[999].id).toBe(1000);
  });
});
