"use client";

import { Children, isValidElement, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast as notify } from "sonner";
import { cn } from "@/lib/utils";

function collectOptions(children) {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];
    if (child.type === "option") {
      return [
        {
          value: String(child.props.value ?? child.props.children),
          label: child.props.children,
          disabled: child.props.disabled,
        },
      ];
    }
    return collectOptions(child.props.children);
  });
}

// Conserva el contrato de los formularios existentes y usa el Select de la plantilla.
export function AdminSelect({
  children,
  value,
  defaultValue,
  onChange,
  className,
  id,
  name,
  disabled,
  required,
  ...props
}) {
  const options = collectOptions(children);

  return (
    <Select
      items={options}
      value={value == null ? undefined : String(value)}
      defaultValue={defaultValue == null ? undefined : String(defaultValue)}
      name={name}
      disabled={disabled}
      required={required}
      onValueChange={(nextValue) => {
        const target = { value: nextValue ?? "", name, id };
        onChange?.({ target, currentTarget: target });
      }}
    >
      <SelectTrigger id={id} className={cn("w-full", className)} {...props}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function AdminCheckbox({ onChange, value, name, id, ...props }) {
  return (
    <Checkbox
      {...props}
      name={name}
      id={id}
      value={value}
      onCheckedChange={(checked) => {
        const target = { checked, value, name, id };
        onChange?.({ target, currentTarget: target });
      }}
    />
  );
}

export function AdminModal({
  children,
  onClose,
  className,
  title = "Detalles",
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose?.();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn("max-h-[90dvh] overflow-y-auto sm:max-w-2xl", className)}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function AdminToast({ show = true, type = "info", message, onClose }) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!show || !message) return;
    const method = ["success", "error", "warning", "info"].includes(type)
      ? type
      : "info";
    const id = notify[method](message, {
      duration: 3500,
      onDismiss: () => closeRef.current?.(),
      onAutoClose: () => closeRef.current?.(),
    });
    return () => {
      notify.dismiss(id);
    };
  }, [show, type, message]);

  return null;
}

export function AdminConfirm({
  show,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  showCancel = true,
  type,
}) {
  return (
    <Dialog
      open={show}
      onOpenChange={(open) => {
        if (!open) onCancel?.();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {showCancel && (
            <Button variant="outline" onClick={onCancel}>
              {cancelText}
            </Button>
          )}
          <Button
            variant={type === "error" ? "destructive" : "default"}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
