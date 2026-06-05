'use client';

import React from 'react';

type Props = { children: React.ReactNode };

export class ErrorBoundary extends React.Component<Props, { hasError: boolean }> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    // TODO: send to logging service
    // console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h3 className="text-lg font-semibold">Nimadir noto&apos;g&apos;ri ketdi</h3>
          <p className="mt-2 text-sm text-ink-tertiary">
            Sahifani yangilang yoki keyinroq urinib ko&apos;ring.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
