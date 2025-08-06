'use client';

import React from 'react';
import { Button } from './button';

interface RecaptchaPopoverProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onVerify: (token: string) => void;
  trigger: React.ReactNode;
}

export function RecaptchaPopover({
  open,
  onOpenChange,
  onVerify,
  trigger,
}: RecaptchaPopoverProps) {
  // Untuk development, langsung auto verify
  const handleVerify = () => {
    onVerify('dummy-recaptcha-token');
    onOpenChange?.(false);
  };

  return (
    <div>
      <div onClick={handleVerify}>{trigger}</div>
      {/* Kamu bisa kembangkan untuk popover UI jika pakai Google Recaptcha */}
    </div>
  );
}
