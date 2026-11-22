"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatPersonName } from "@/lib/person-name";

export function MemberPhoto({ row, preview = true }) {
  const url = row.fotoPerfil?.url;
  const name = formatPersonName(row.nombres, row.apellidos);
  const avatar = (
    <Avatar className="size-9 shrink-0" aria-hidden="true">
      <AvatarImage src={url} alt="" />
      <AvatarFallback>{[row.nombres?.[0], row.apellidos?.[0]].filter(Boolean).join("")}</AvatarFallback>
    </Avatar>
  );

  return preview ? (
    <PhotoPreview url={url} name={name}>{avatar}</PhotoPreview>
  ) : avatar;
}

export function PhotoPreview({ url, name, children, tooltip }) {
  if (!url) return children;

  const triggerProps = {
    type: "button",
    "aria-label": tooltip || `Ampliar foto de ${name}`,
    className: "shrink-0 cursor-zoom-in rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  };

  return (
    <Dialog>
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger render={<DialogTrigger {...triggerProps} />}>
            {children}
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      ) : (
        <DialogTrigger {...triggerProps}>{children}</DialogTrigger>
      )}
      <DialogContent className="max-h-[90dvh] gap-4 overflow-y-auto p-4 sm:max-w-3xl sm:p-6">
        <DialogTitle className="pr-10 leading-snug">{name}</DialogTitle>
        <Avatar className="aspect-square size-auto w-full max-h-[70dvh] rounded-lg bg-muted after:hidden">
          <AvatarImage
            src={url}
            alt={`Foto de ${name}`}
            className="aspect-auto rounded-lg object-contain"
          />
          <AvatarFallback className="rounded-lg">
            No se pudo cargar la foto.
          </AvatarFallback>
        </Avatar>
      </DialogContent>
    </Dialog>
  );
}
