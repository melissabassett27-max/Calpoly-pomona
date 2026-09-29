'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  error?: string;
}

export function FormField({ label, name, value, onChange, type = 'text', required = false, placeholder, maxLength, multiline = false, rows = 4, disabled = false, error }: FormFieldProps) {
  const errorId = `${name}-error`;
  return (
    <div>
      <Label htmlFor={name} className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {multiline ? (
        <div className="mt-1">
          <Textarea
            id={name}
            value={value ?? ''}
            onChange={(e) => onChange(name, e.target.value)}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            disabled={disabled}
            className="resize-none"
          />
          {maxLength && (
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {(value ?? '').split(/\s+/).filter(Boolean).length} / {maxLength} words
            </p>
          )}
        </div>
      ) : (
        <Input
          id={name}
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`mt-1 ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
        />
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
