import "@testing-library/jest-dom";
import { setPathname } from "./test/mock-navigation";

jest.mock("next/navigation", () => jest.requireActual("./test/mock-navigation"));

beforeEach(() => {
  setPathname("/");
});
