import { DocumentNode } from "graphql";
import { fragmentReducer } from "../fragment-reducer";
import { expectedFragmentsReduced as efr1, operationQuery as op1 } from "./common1.fixtures";
import { expectedFragmentsReduced as efr2, operationQuery as op2 } from "./common2.fixtures";

describe("fragmentReducer(documentNode): operationNode", () => {
  it("returns null with no definitions", () => {
    expect(fragmentReducer((null as unknown) as DocumentNode)).toBeNull();
    expect(fragmentReducer(({} as unknown) as DocumentNode)).toBeNull();
    expect(fragmentReducer(({ definitions: [] } as unknown) as DocumentNode)).toBeNull();
  });
  it("returns null with no OperationDefinitionNode in the definitions", () => {
    expect(
      fragmentReducer(({
        definitions: [{ whatever: null }],
      } as unknown) as DocumentNode)
    ).toBeNull();
  });
  it("example1", () => {
    expect(fragmentReducer(op1)).toEqual(efr1);
  });
  it("example2", () => {
    expect(fragmentReducer(op2)).toEqual(efr2);
  });
});
