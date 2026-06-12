import { describe, expect, test } from "vitest";

import { render, screen } from "@reearth-cms/test/utils";

import ContentSection from "./index";

describe("ContentSection", () => {
  describe("Rendering and conditional header", () => {
    test("Renders children content", () => {
      render(
        <ContentSection>
          <span>child content</span>
        </ContentSection>,
      );

      expect(screen.getByText("child content")).toBeInTheDocument();
    });

    test("Renders title text when provided", () => {
      render(<ContentSection title="Section title" />);

      const title = screen.getByText("Section title");
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe("P");
    });

    test("Renders description text when provided", () => {
      render(<ContentSection description="Section description" />);

      expect(screen.getByText("Section description")).toBeInTheDocument();
    });

    test("Renders headerActions node when provided", () => {
      render(<ContentSection headerActions={<button>Action</button>} />);

      expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
    });

    test("Omits the header when title, description and headerActions are all absent", () => {
      const { container } = render(
        <ContentSection>
          <span>child content</span>
        </ContentSection>,
      );

      // Wrapper contains only the GridArea, no Header
      expect(container.firstChild?.childNodes).toHaveLength(1);
    });

    test("Renders the header when any header field is provided", () => {
      const { container } = render(
        <ContentSection title="Section title">
          <span>child content</span>
        </ContentSection>,
      );

      // Wrapper contains both the Header and the GridArea
      expect(container.firstChild?.childNodes).toHaveLength(2);
    });
  });

  describe("Style toggles", () => {
    test("Applies a border to the wrapper when danger is true", () => {
      const { container } = render(<ContentSection danger />);

      expect(container.firstChild).toHaveStyleRule("border", "1px solid #ff4d4f");
    });

    test("Does not apply a border to the wrapper by default", () => {
      const { container } = render(<ContentSection />);

      expect(container.firstChild).not.toHaveStyleRule("border", "1px solid #ff4d4f");
    });

    test("Indents the header horizontally by default", () => {
      const { container } = render(<ContentSection title="title" />);

      const header = container.firstChild?.firstChild;
      expect(header).toHaveStyleRule("padding", "10px 24px");
    });

    test("Removes the header horizontal padding when hasHorizontalRule is false", () => {
      const { container } = render(<ContentSection title="title" hasHorizontalRule={false} />);

      const header = container.firstChild?.firstChild;
      expect(header).toHaveStyleRule("padding", "10px 0px");
    });

    test("Keeps the header horizontal indent even when hasPadding is false", () => {
      const { container } = render(<ContentSection title="title" hasPadding={false} />);

      const header = container.firstChild?.firstChild;
      expect(header).toHaveStyleRule("padding", "10px 24px");
    });

    test("Removes the header bottom border when hasHorizontalRule is false", () => {
      const { container } = render(<ContentSection title="title" hasHorizontalRule={false} />);

      const header = container.firstChild?.firstChild;
      expect(header).toHaveStyleRule("border-bottom", "none");
    });

    test("Keeps a header bottom border by default", () => {
      const { container } = render(<ContentSection />);

      const header = container.firstChild?.firstChild;
      expect(header).not.toHaveStyleRule("border-bottom", "none");
    });

    test("Removes grid area padding when hasPadding is false", () => {
      const { container } = render(
        <ContentSection hasPadding={false}>
          <span>child</span>
        </ContentSection>,
      );

      const gridArea = container.firstChild?.firstChild;
      expect(gridArea).toHaveStyleRule("padding", "0px");
    });

    test("Applies grid area padding by default", () => {
      const { container } = render(
        <ContentSection>
          <span>child</span>
        </ContentSection>,
      );

      const gridArea = container.firstChild?.firstChild;
      expect(gridArea).not.toHaveStyleRule("padding", "0px");
    });

    test("Applies a non-zero gap to the grid area when hasGap is true", () => {
      const { container } = render(
        <ContentSection hasGap>
          <span>child</span>
        </ContentSection>,
      );

      const gridArea = container.firstChild?.firstChild;
      expect(gridArea).not.toHaveStyleRule("gap", "0px");
    });

    test("Has no grid area gap by default", () => {
      const { container } = render(
        <ContentSection>
          <span>child</span>
        </ContentSection>,
      );

      const gridArea = container.firstChild?.firstChild;
      expect(gridArea).toHaveStyleRule("gap", "0px");
    });
  });
});
