import React from 'react';
import { render, screen } from '@testing-library/react';
import Logo from '../../components/Logo';

describe('Logo Component', () => {
  it('renders logo with default props', () => {
    render(<Logo />);
    const logoElement = screen.getByTestId('logo');
    expect(logoElement).toBeInTheDocument();
  });

  it('renders logo with custom size', () => {
    render(<Logo size={50} />);
    const logoElement = screen.getByTestId('logo');
    expect(logoElement).toBeInTheDocument();
  });

  it('renders animated logo when animated prop is true', () => {
    render(<Logo animated={true} />);
    const logoElement = screen.getByTestId('logo');
    expect(logoElement).toBeInTheDocument();
  });

  it('renders static logo when animated prop is false', () => {
    render(<Logo animated={false} />);
    const logoElement = screen.getByTestId('logo');
    expect(logoElement).toBeInTheDocument();
  });
});
