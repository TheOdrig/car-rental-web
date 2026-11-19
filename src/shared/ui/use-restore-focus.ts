"use client"

import * as React from "react"

interface FocusHandlers {
    onOpenAutoFocus?: (event: Event) => void
    onCloseAutoFocus?: (event: Event) => void
}

function focusPageAnchor(): void {
    const anchor = document.querySelector<HTMLElement>("main h1") ?? document.querySelector<HTMLElement>("main")
    if (!anchor) return
    if (!anchor.hasAttribute("tabindex")) anchor.setAttribute("tabindex", "-1")
    anchor.focus()
}

export function useRestoreFocus({ onOpenAutoFocus, onCloseAutoFocus }: FocusHandlers) {
    const opener = React.useRef<HTMLElement | null>(null)

    const handleOpen = React.useCallback(
        (event: Event) => {
            const active = document.activeElement
            opener.current = active instanceof HTMLElement && active !== document.body ? active : null
            onOpenAutoFocus?.(event)
        },
        [onOpenAutoFocus]
    )

    const handleClose = React.useCallback(
        (event: Event) => {
            onCloseAutoFocus?.(event)
            const target = opener.current
            opener.current = null
            if (event.defaultPrevented) return
            if (target?.isConnected) {
                event.preventDefault()
                target.focus()
            } else if (target) {
                event.preventDefault()
                focusPageAnchor()
            }
        },
        [onCloseAutoFocus]
    )

    return { onOpenAutoFocus: handleOpen, onCloseAutoFocus: handleClose }
}
