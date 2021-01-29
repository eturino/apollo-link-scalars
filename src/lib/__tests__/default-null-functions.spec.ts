import defaultNullFunctions from "../default-null-functions";

describe("default null functions", () => {
  it("parses as identity", () => {
    expect(defaultNullFunctions.parseValue("a")).toEqual("a");
  });
  it("serialies as identity", () => {
    expect(defaultNullFunctions.serialize("a")).toEqual("a");
  });
});
