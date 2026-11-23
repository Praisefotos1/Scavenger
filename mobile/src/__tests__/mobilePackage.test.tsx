import { Platform, Text } from "react-native";
import { render, screen } from "@testing-library/react-native";

describe("scavenger-mobile package", () => {
  it("runs under the react-native jest preset", () => {
    expect(Platform).toBeDefined();
    expect(Platform.OS).toBeTruthy();
  });

  it("renders components via @testing-library/react-native", () => {
    render(<Text>Mobile package unit tests</Text>);
    expect(screen.getByText("Mobile package unit tests")).toBeDefined();
  });
});
