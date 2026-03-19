import { screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { render } from "@reearth-cms/test/utils";

import Card from "./card";

describe("Card", () => {
  test("renders string title", () => {
    render(<Card title="My Card Title" />);
    expect(screen.getByText("My Card Title")).toBeInTheDocument();
  });

  test("renders JSX title", () => {
    render(
      <Card
        title={
          <span>
            <strong>Bold</strong> Title
          </span>
        }
      />,
    );
    expect(screen.getByText("Bold")).toBeInTheDocument();
    expect(screen.getByText("Title", { exact: false })).toBeInTheDocument();
  });

  test("renders toolbar and children", () => {
    render(
      <Card title="Title" toolbar={<button>Toolbar Action</button>}>
        <p>Card content</p>
      </Card>,
    );
    expect(screen.getByText("Toolbar Action")).toBeInTheDocument();
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });
});
