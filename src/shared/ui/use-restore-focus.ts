"use client"

import * as React from "react"

interface FocusHandlers {
    onOpenAutoFocus?: (event: Event) => void
    onCloseAutoFocus?: (event: Event) => void
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
            if (!event.defaultPrevented && target?.isConnected) {
                event.preventDefault()
                target.focus()
            }
        },
        [onCloseAutoFocus]
    )

    return { onOpenAutoFocus: handleOpen, onCloseAutoFocus: handleClose }
}
