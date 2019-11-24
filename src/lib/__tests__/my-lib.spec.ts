import { identity } from "../my-lib";

describe("identity()", () => {
  it("returns the same input given", () => {
    expect(identity(null)).toBeNull();
    expect(identity(4)).toBe(4);
    expect(identity("whatever ")).toBe("whatever ");

    const obj = { a: 1, b: 2 };
    expect(identity(obj)).toBe(obj);
  });
});
