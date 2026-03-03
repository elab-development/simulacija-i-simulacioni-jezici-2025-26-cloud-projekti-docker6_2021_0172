import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../src/components/ui/Button"; 

describe("Button komponenta", () => {
  it("treba da prikaže tačan tekst koji mu se prosledi", () => {
    render(<Button>Klikni me</Button>);
    
    const buttonElement = screen.getByText("Klikni me");
    expect(buttonElement).toBeInTheDocument();
  });

  it("treba da pozove funkciju kada se klikne", () => {
    const mockOnClick = jest.fn();
    
    render(<Button onClick={mockOnClick}>Test Dugme</Button>);
    
    const buttonElement = screen.getByText("Test Dugme");
    fireEvent.click(buttonElement);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});