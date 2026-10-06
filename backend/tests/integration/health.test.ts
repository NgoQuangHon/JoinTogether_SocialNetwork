import request from "supertest";
import app from "../../src/app";
import { pool } from "../../src/config/db";


afterAll(async () => {
  await pool.end();
});

describe("GET /health Endpoint Test", () => {
  it("should return 200 OK with good response status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "good response" });
  });

  it("should return 404 for unknown endpoints", async () => {
    const response = await request(app).get("/unknown-route-12345");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Không tìm thấy đường dẫn");
  });
});
